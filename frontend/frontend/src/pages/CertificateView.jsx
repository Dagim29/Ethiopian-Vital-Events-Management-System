import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { birthRecordsAPI, deathRecordsAPI, marriageRecordsAPI, divorceRecordsAPI } from '../services/api';
import { PrinterIcon, ArrowDownTrayIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import ethiopianFlag from '../assets/ethiopia-flag.png';
import { downloadCertificate, DOWNLOAD_METHODS } from '../utils/certificateDownload';
import { generateCertificateQRCode } from '../utils/qrCodeGenerator';

const CertificateView = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const certificateRef = useRef();
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);

  // Fetch record based on type
  const { data: record, isLoading, error } = useQuery({
    queryKey: [`${type}Record`, id],
    queryFn: async () => {
      console.log('Fetching certificate:', { type, id });
      let response;
      try {
        switch (type) {
          case 'birth':
            response = await birthRecordsAPI.getRecord(id);
            break;
          case 'death':
            response = await deathRecordsAPI.getRecord(id);
            break;
          case 'marriage':
            response = await marriageRecordsAPI.getRecord(id);
            break;
          case 'divorce':
            response = await divorceRecordsAPI.getRecord(id);
            break;
          default:
            throw new Error('Invalid certificate type');
        }
        console.log('Full API Response:', response);
        
        // The API methods already return response.data, so response IS the data
        // Check if it has a nested data property or use it directly
        const recordData = response?.data || response;
        
        console.log('Final extracted record:', recordData);
        
        if (!recordData || typeof recordData !== 'object') {
          throw new Error('Invalid data returned from API');
        }
        
        return recordData;
      } catch (err) {
        console.error('Error fetching record:', err);
        throw err;
      }
    },
  });

  console.log('Current record state:', record);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);

  // Generate QR code when record is loaded
  useEffect(() => {
    const generateQR = async () => {
      if (record && record.certificate_number) {
        try {
          const qrData = await generateCertificateQRCode({
            certificateNumber: record.certificate_number,
            recordType: type,
            recordId: record._id || record.id,
            issuedDate: record.issued_date || record.created_at || new Date().toISOString()
          });
          setQrCodeDataUrl(qrData);
          console.log('QR code generated successfully');
        } catch (error) {
          console.error('Failed to generate QR code:', error);
        }
      }
    };

    generateQR();
  }, [record, type]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!record) {
      toast.error('Certificate not ready for download');
      return;
    }

    if (!certificateRef.current) {
      toast.error('Certificate element not found');
      return;
    }

    // Wait for QR code to be fully rendered
    if (!qrCodeDataUrl) {
      toast.warning('QR code is still loading. Please wait a moment...');
      return;
    }

    setIsDownloading(true);
    
    try {
      toast.info('Generating PDF with QR code...', { autoClose: 2000 });
      
      // Use html2canvas method to capture the certificate with QR code
      const result = await downloadCertificate(
        certificateRef.current,
        record,
        type,
        DOWNLOAD_METHODS.HTML2CANVAS
      );

      if (result.success) {
        toast.success('Certificate downloaded successfully!');
      } else {
        toast.error(result.message || 'Failed to download certificate');
      }
    } catch (error) {
      console.error('Download error:', error);
      
      // Offer print as fallback
      const usePrint = window.confirm(
        'PDF generation failed. Would you like to use Print to PDF instead?\n\n' +
        'Click OK to open print dialog, then select "Save as PDF".'
      );
      
      if (usePrint) {
        toast.info('Opening print dialog. Select "Save as PDF" to download.');
        setTimeout(() => window.print(), 300);
      } else {
        toast.error('Download cancelled. Please try again or use the Print button.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Certificate</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => navigate('/certificates')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Certificates
          </button>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Record Found</h2>
          <p className="text-gray-600 mb-4">The certificate record could not be found.</p>
          <button
            onClick={() => navigate('/certificates')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Certificates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {/* Action Bar */}
      <div className="max-w-5xl mx-auto mb-6 px-4">
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/certificates')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Certificates
          </button>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow"
            >
              <PrinterIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="hidden sm:inline">Downloading...</span>
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Certificate */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white shadow-2xl certificate-content" ref={certificateRef}>
          {type === 'birth' && <BirthCertificate record={record} qrCodeDataUrl={qrCodeDataUrl} />}
          {type === 'death' && <DeathCertificate record={record} qrCodeDataUrl={qrCodeDataUrl} />}
          {type === 'marriage' && <MarriageCertificate record={record} qrCodeDataUrl={qrCodeDataUrl} />}
          {type === 'divorce' && <DivorceCertificate record={record} qrCodeDataUrl={qrCodeDataUrl} />}
        </div>
      </div>
    </div>
  );
};

// Birth Certificate Template (Clean Ethiopian Design)
const BirthCertificate = ({ record, qrCodeDataUrl }) => {
  return (
    <div className="p-12 bg-white" style={{ fontFamily: 'Times New Roman, serif' }}>
      <div className="border-8 border-double p-8" style={{ borderColor: '#009639' }}>
        {/* Header */}
        <div className="flex items-center justify-center mb-6 pb-4 border-b-4" style={{ borderColor: '#FEDD00' }}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <img src={ethiopianFlag} alt="Ethiopian Flag" className="w-20 h-14 object-cover rounded-md shadow-lg border-2 border-gray-300" />
              <div>
                <h1 className="text-3xl font-bold" style={{ color: '#009639' }}>
                  የኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ
                </h1>
                <h2 className="text-2xl font-semibold text-gray-800">
                  FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA
                </h2>
              </div>
              <img src={ethiopianFlag} alt="Ethiopian Flag" className="w-20 h-14 object-cover rounded-md shadow-lg border-2 border-gray-300" />
            </div>
            <h3 className="text-xl font-bold mt-2" style={{ color: '#009639' }}>
              BIRTH CERTIFICATE / የልደት የምስክር ወረቀት
            </h3>
          </div>
        </div>

        {/* Certificate Number */}
        <div className="text-center mb-6">
          <p className="text-lg font-semibold">Certificate No: <span className="font-mono text-xl">{record?.certificate_number}</span></p>
        </div>

        {/* Main Content */}
        <div className="space-y-6 text-lg">
          
          {/* Child Information */}
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
            <h4 className="font-bold text-xl mb-4 text-center" style={{ color: '#009639' }}>CHILD INFORMATION</h4>
            <div className="flex gap-6">
              {/* Photo */}
              {record?.photo_url && (
                <div className="flex-shrink-0">
                  <div className="w-32 h-40 border-4 border-green-600 rounded-lg overflow-hidden shadow-lg bg-white">
                    <img 
                      src={record.photo_url} 
                      alt="Child Photo" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">No Photo</div>';
                      }}
                    />
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-1">Child Photo</p>
                </div>
              )}
              
              {/* Information */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-semibold text-lg">
                    {record?.child_first_name} {record?.child_father_name} {record?.child_grandfather_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-semibold">{record?.child_gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-semibold">{record?.date_of_birth}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nationality</p>
                  <p className="font-semibold">{record?.child_nationality || 'Ethiopian'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Place of Birth</p>
                  <p className="font-semibold">{record?.place_of_birth_name || record?.birth_city || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Place of Birth Details */}
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
            <h4 className="font-bold text-xl mb-4 text-center" style={{ color: '#009639' }}>PLACE OF BIRTH DETAILS</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Region</p>
                <p className="font-semibold">{record?.birth_region}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Zone</p>
                <p className="font-semibold">{record?.birth_zone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Woreda</p>
                <p className="font-semibold">{record?.birth_woreda}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Kebele</p>
                <p className="font-semibold">{record?.birth_kebele}</p>
              </div>
            </div>
          </div>

          {/* Parents Information */}
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
            <h4 className="font-bold text-xl mb-4 text-center" style={{ color: '#009639' }}>PARENTS INFORMATION</h4>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-2">Father</p>
                <p className="font-semibold text-base mb-1">{record?.father_full_name}</p>
                <p className="text-sm text-gray-600">Nationality: {record?.father_nationality}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-2">Mother</p>
                <p className="font-semibold text-base mb-1">{record?.mother_full_name}</p>
                <p className="text-sm text-gray-600">Nationality: {record?.mother_nationality}</p>
              </div>
            </div>
          </div>

          {/* Registration Details */}
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
            <h4 className="font-bold text-xl mb-4 text-center" style={{ color: '#009639' }}>REGISTRATION DETAILS</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Registration Date</p>
                <p className="font-semibold">
                  {record?.created_at ? new Date(record.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Registered By</p>
                <p className="font-semibold">{record?.registered_by_name || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="mt-12 pt-8 border-t-4" style={{ borderColor: '#FEDD00' }}>
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="border-t-2 border-gray-800 pt-2 mt-16">
                  <p className="font-semibold">Registrar's Signature</p>
                  <p className="text-sm text-gray-600">የምዝገባ ሰራተኛ ፊርማ</p>
                </div>
              </div>
              <div className="text-center">
                <div className="qr-code-container mx-auto" style={{ width: '120px', height: '120px', border: '2px solid #009639', padding: '8px', backgroundColor: '#fff' }}>
                  {qrCodeDataUrl ? (
                    <img src={qrCodeDataUrl} alt="Certificate QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-gray-400">Loading QR...</div>
                  )}
                </div>
                <p className="text-xs text-center text-gray-600 mt-2 font-semibold">Scan to Verify</p>
                <p className="text-xs text-center text-gray-500">ለማረጋገጥ ይቃኙ</p>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-gray-800 pt-2 mt-16">
                  <p className="font-semibold">Official Stamp</p>
                  <p className="text-sm text-gray-600">ማህተም</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t-2 border-gray-300 text-center text-sm text-gray-600">
          <p>This certificate is issued in accordance with Ethiopian Vital Events Registration and National Identity Card Proclamation</p>
          <p className="mt-1">ይህ የምስክር ወረቀት በኢትዮጵያ የህይወት ክስተቶች ምዝገባ እና የመታወቂያ ካርድ አዋጅ መሠረት የተሰጠ ነ��</p>
        </div>
      </div>
    </div>
  );
};

// Death Certificate Template
const DeathCertificate = ({ record, qrCodeDataUrl }) => {
  return (
    <div className="p-12 bg-white" style={{ fontFamily: 'Times New Roman, serif' }}>
      <div className="border-8 border-double p-8" style={{ borderColor: '#DA121A' }}>
        {/* Header */}
        <div className="flex items-center justify-center mb-6 pb-4 border-b-4" style={{ borderColor: '#FEDD00' }}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <img src={ethiopianFlag} alt="Ethiopian Flag" className="w-20 h-14 object-cover rounded-md shadow-lg border-2 border-gray-300" />
              <div>
                <h1 className="text-3xl font-bold" style={{ color: '#009639' }}>
                  የኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ
                </h1>
                <h2 className="text-2xl font-semibold text-gray-800">
                  FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA
                </h2>
              </div>
              <img src={ethiopianFlag} alt="Ethiopian Flag" className="w-20 h-14 object-cover rounded-md shadow-lg border-2 border-gray-300" />
            </div>
            <h3 className="text-xl font-bold mt-2" style={{ color: '#DA121A' }}>
              DEATH CERTIFICATE / የሞት የምስክር ወረቀት
            </h3>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-lg font-semibold">Certificate No: <span className="font-mono text-xl">{record?.certificate_number}</span></p>
        </div>

        <div className="space-y-6 text-lg">
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
            <h4 className="font-bold text-xl mb-4 text-center" style={{ color: '#DA121A' }}>DECEASED INFORMATION</h4>
            <div className="flex gap-6">
              {/* Photo */}
              {record?.photo_url && (
                <div className="flex-shrink-0">
                  <div className="w-32 h-40 border-4 border-red-600 rounded-lg overflow-hidden shadow-lg bg-white">
                    <img 
                      src={record.photo_url} 
                      alt="Deceased Photo" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">No Photo</div>';
                      }}
                    />
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-1">Deceased Photo</p>
                </div>
              )}
              
              {/* Information */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-semibold text-lg">
                    {record?.deceased_first_name} {record?.deceased_father_name} {record?.deceased_grandfather_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-semibold">{record?.deceased_gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Death</p>
                  <p className="font-semibold">{record?.date_of_death}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Place of Death</p>
                  <p className="font-semibold">{record?.place_of_death_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Age at Death</p>
                  <p className="font-semibold">{record?.age_at_death} {record?.age_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cause of Death</p>
                  <p className="font-semibold">{record?.cause_of_death || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="mt-12 pt-8 border-t-4" style={{ borderColor: '#FEDD00' }}>
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="border-t-2 border-gray-800 pt-2 mt-16">
                  <p className="font-semibold">Registrar's Signature</p>
                  <p className="text-sm text-gray-600">የምዝገባ ሰራተኛ ፊርማ</p>
                </div>
              </div>
              <div className="text-center">
                <div className="qr-code-container mx-auto" style={{ width: '120px', height: '120px', border: '2px solid #DA121A', padding: '8px', backgroundColor: '#fff' }}>
                  {qrCodeDataUrl ? (
                    <img src={qrCodeDataUrl} alt="Certificate QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-gray-400">Loading QR...</div>
                  )}
                </div>
                <p className="text-xs text-center text-gray-600 mt-2 font-semibold">Scan to Verify</p>
                <p className="text-xs text-center text-gray-500">ለማረጋገጥ ይቃኙ</p>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-gray-800 pt-2 mt-16">
                  <p className="font-semibold">Official Stamp</p>
                  <p className="text-sm text-gray-600">ማህተም</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t-2 border-gray-300 text-center text-sm text-gray-600">
          <p>This certificate is issued in accordance with Ethiopian Vital Events Registration and National Identity Card Proclamation</p>
          <p className="mt-1">ይህ የምስክር ወረቀት በኢትዮጵያ የህይወት ክስተቶች ምዝገባ እና የመታወቂያ ካርድ አዋጅ መሠረት የተሰጠ ነው</p>
        </div>
      </div>
    </div>
  );
};

// Marriage Certificate Template
const MarriageCertificate = ({ record, qrCodeDataUrl }) => {
  return (
    <div className="p-12 bg-white" style={{ fontFamily: 'Times New Roman, serif' }}>
      <div className="border-8 border-double p-8" style={{ borderColor: '#E91E63' }}>
        {/* Header */}
        <div className="flex items-center justify-center mb-6 pb-4 border-b-4" style={{ borderColor: '#FEDD00' }}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <img src={ethiopianFlag} alt="Ethiopian Flag" className="w-20 h-14 object-cover rounded-md shadow-lg border-2 border-gray-300" />
              <div>
                <h1 className="text-3xl font-bold" style={{ color: '#009639' }}>
                  የኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ
                </h1>
                <h2 className="text-2xl font-semibold text-gray-800">
                  FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA
                </h2>
              </div>
              <img src={ethiopianFlag} alt="Ethiopian Flag" className="w-20 h-14 object-cover rounded-md shadow-lg border-2 border-gray-300" />
            </div>
            <h3 className="text-xl font-bold mt-2" style={{ color: '#E91E63' }}>
              MARRIAGE CERTIFICATE / የጋብቻ የምስክር ወረቀት
            </h3>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-lg font-semibold">Certificate No: <span className="font-mono text-xl">{record?.certificate_number}</span></p>
        </div>

        <div className="space-y-6 text-lg">
          
          {/* Spouses Information */}
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
            <h4 className="font-bold text-xl mb-4 text-center" style={{ color: '#E91E63' }}>SPOUSES INFORMATION</h4>
            <div className="grid grid-cols-2 gap-6">
              {/* Spouse 1 */}
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-3">SPOUSE 1 (Husband/Wife)</p>
                <div className="flex gap-3">
                  {/* Photo */}
                  {record?.spouse1_photo_url && (
                    <div className="flex-shrink-0">
                      <div className="w-24 h-32 border-3 border-pink-500 rounded-lg overflow-hidden shadow-md bg-white">
                        <img 
                          src={record.spouse1_photo_url} 
                          alt="Spouse 1 Photo" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">No Photo</div>';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {/* Info */}
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-semibold">{record?.spouse1_full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="font-semibold">{record?.spouse1_date_of_birth || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Nationality</p>
                      <p className="font-semibold">{record?.spouse1_nationality}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ID Number</p>
                      <p className="font-semibold">{record?.spouse1_id_number || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Spouse 2 */}
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-3">SPOUSE 2 (Husband/Wife)</p>
                <div className="flex gap-3">
                  {/* Photo */}
                  {record?.spouse2_photo_url && (
                    <div className="flex-shrink-0">
                      <div className="w-24 h-32 border-3 border-pink-500 rounded-lg overflow-hidden shadow-md bg-white">
                        <img 
                          src={record.spouse2_photo_url} 
                          alt="Spouse 2 Photo" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">No Photo</div>';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {/* Info */}
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-semibold">{record?.spouse2_full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="font-semibold">{record?.spouse2_date_of_birth || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Nationality</p>
                      <p className="font-semibold">{record?.spouse2_nationality}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ID Number</p>
                      <p className="font-semibold">{record?.spouse2_id_number || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Marriage Details */}
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
            <h4 className="font-bold text-xl mb-4 text-center" style={{ color: '#E91E63' }}>MARRIAGE DETAILS</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Marriage Date</p>
                <p className="font-semibold text-lg">{record?.marriage_date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Marriage Type</p>
                <p className="font-semibold">{record?.marriage_type || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Place of Marriage</p>
                <p className="font-semibold">{record?.marriage_place || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Registration Details */}
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
            <h4 className="font-bold text-xl mb-4 text-center" style={{ color: '#E91E63' }}>REGISTRATION DETAILS</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Registration Date</p>
                <p className="font-semibold">
                  {record?.created_at ? new Date(record.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Registered By</p>
                <p className="font-semibold">{record?.registered_by_name || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="mt-12 pt-8 border-t-4" style={{ borderColor: '#FEDD00' }}>
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="border-t-2 border-gray-800 pt-2 mt-16">
                  <p className="font-semibold">Registrar's Signature</p>
                  <p className="text-sm text-gray-600">የምዝገባ ሰራተኛ ፊርማ</p>
                </div>
              </div>
              <div className="text-center">
                <div className="qr-code-container mx-auto" style={{ width: '120px', height: '120px', border: '2px solid #E91E63', padding: '8px', backgroundColor: '#fff' }}>
                  {qrCodeDataUrl ? (
                    <img src={qrCodeDataUrl} alt="Certificate QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-gray-400">Loading QR...</div>
                  )}
                </div>
                <p className="text-xs text-center text-gray-600 mt-2 font-semibold">Scan to Verify</p>
                <p className="text-xs text-center text-gray-500">ለማረጋገጥ ይቃኙ</p>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-gray-800 pt-2 mt-16">
                  <p className="font-semibold">Official Stamp</p>
                  <p className="text-sm text-gray-600">ማህተም</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t-2 border-gray-300 text-center text-sm text-gray-600">
          <p>This certificate is issued in accordance with Ethiopian Family Code</p>
          <p className="mt-1">ይህ የምስክር ወረቀት በኢትዮጵያ የቤተሰብ ህግ መሠረት የተሰጠ ነው</p>
        </div>
      </div>
    </div>
  );
};

// Divorce Certificate Template
const DivorceCertificate = ({ record, qrCodeDataUrl }) => {
  return (
    <div className="p-12 bg-white" style={{ fontFamily: 'Times New Roman, serif' }}>
      <div className="border-8 border-double p-8" style={{ borderColor: '#FF9800' }}>
        {/* Header */}
        <div className="flex items-center justify-center mb-6 pb-4 border-b-4" style={{ borderColor: '#FEDD00' }}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <img src={ethiopianFlag} alt="Ethiopian Flag" className="w-20 h-14 object-cover rounded-md shadow-lg border-2 border-gray-300" />
              <div>
                <h1 className="text-3xl font-bold" style={{ color: '#009639' }}>
                  የኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ
                </h1>
                <h2 className="text-2xl font-semibold text-gray-800">
                  FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA
                </h2>
              </div>
              <img src={ethiopianFlag} alt="Ethiopian Flag" className="w-20 h-14 object-cover rounded-md shadow-lg border-2 border-gray-300" />
            </div>
            <h3 className="text-xl font-bold mt-2" style={{ color: '#FF9800' }}>
              DIVORCE CERTIFICATE / የፍቺ የምስክር ወረቀት
            </h3>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-lg font-semibold">Certificate No: <span className="font-mono text-xl">{record?.certificate_number}</span></p>
        </div>

        <div className="space-y-6 text-lg">
          
          {/* Former Spouses Information */}
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
            <h4 className="font-bold text-xl mb-4 text-center" style={{ color: '#FF9800' }}>FORMER SPOUSES INFORMATION</h4>
            <div className="grid grid-cols-2 gap-6">
              {/* Former Spouse 1 */}
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-3">FORMER SPOUSE 1</p>
                <div className="flex gap-3">
                  {/* Photo */}
                  {record?.spouse1_photo_url && (
                    <div className="flex-shrink-0">
                      <div className="w-24 h-32 border-3 border-orange-500 rounded-lg overflow-hidden shadow-md bg-white">
                        <img 
                          src={record.spouse1_photo_url} 
                          alt="Former Spouse 1 Photo" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">No Photo</div>';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {/* Info */}
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-semibold">{record?.spouse1_full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="font-semibold">{record?.spouse1_date_of_birth || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Nationality</p>
                      <p className="font-semibold">{record?.spouse1_nationality || 'Ethiopian'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ID Number</p>
                      <p className="font-semibold">{record?.spouse1_id_number || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Former Spouse 2 */}
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-3">FORMER SPOUSE 2</p>
                <div className="flex gap-3">
                  {/* Photo */}
                  {record?.spouse2_photo_url && (
                    <div className="flex-shrink-0">
                      <div className="w-24 h-32 border-3 border-orange-500 rounded-lg overflow-hidden shadow-md bg-white">
                        <img 
                          src={record.spouse2_photo_url} 
                          alt="Former Spouse 2 Photo" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">No Photo</div>';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {/* Info */}
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-semibold">{record?.spouse2_full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="font-semibold">{record?.spouse2_date_of_birth || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Nationality</p>
                      <p className="font-semibold">{record?.spouse2_nationality || 'Ethiopian'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ID Number</p>
                      <p className="font-semibold">{record?.spouse2_id_number || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divorce Details */}
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
            <h4 className="font-bold text-xl mb-4 text-center" style={{ color: '#FF9800' }}>DIVORCE DETAILS</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Divorce Date</p>
                <p className="font-semibold text-lg">{record?.divorce_date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Divorce Type</p>
                <p className="font-semibold">{record?.divorce_type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Court Name</p>
                <p className="font-semibold">{record?.court_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Court Case Number</p>
                <p className="font-semibold">{record?.court_case_number || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Divorce Reason</p>
                <p className="font-semibold">{record?.divorce_reason || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Registration Details */}
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
            <h4 className="font-bold text-xl mb-4 text-center" style={{ color: '#FF9800' }}>REGISTRATION DETAILS</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Registration Date</p>
                <p className="font-semibold">
                  {record?.created_at ? new Date(record.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Registered By</p>
                <p className="font-semibold">{record?.registered_by_name || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="mt-12 pt-8 border-t-4" style={{ borderColor: '#FEDD00' }}>
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="border-t-2 border-gray-800 pt-2 mt-16">
                  <p className="font-semibold">Registrar's Signature</p>
                  <p className="text-sm text-gray-600">የምዝገባ ሰራተኛ ፊርማ</p>
                </div>
              </div>
              <div className="text-center">
                <div className="qr-code-container mx-auto" style={{ width: '120px', height: '120px', border: '2px solid #FF9800', padding: '8px', backgroundColor: '#fff' }}>
                  {qrCodeDataUrl ? (
                    <img src={qrCodeDataUrl} alt="Certificate QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-gray-400">Loading QR...</div>
                  )}
                </div>
                <p className="text-xs text-center text-gray-600 mt-2 font-semibold">Scan to Verify</p>
                <p className="text-xs text-center text-gray-500">ለማረጋገጥ ይቃኙ</p>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-gray-800 pt-2 mt-16">
                  <p className="font-semibold">Official Stamp</p>
                  <p className="text-sm text-gray-600">ማህተም</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t-2 border-gray-300 text-center text-sm text-gray-600">
          <p>This certificate is issued in accordance with Ethiopian Family Code</p>
          <p className="mt-1">ይህ የምስክር ወረቀት በኢትዮጵያ የቤተሰብ ህግ መሠረት የተሰጠ ነው</p>
        </div>
      </div>
    </div>
  );
};

export default CertificateView;
