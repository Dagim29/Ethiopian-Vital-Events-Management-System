import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useTranslation } from 'react-i18next';
import { birthRecordsAPI, deathRecordsAPI, marriageRecordsAPI, divorceRecordsAPI } from '../services/api';
import { format } from 'date-fns';

const VerifyCertificate = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [certificateNumber, setCertificateNumber] = useState(searchParams.get('cert') || '');
  const [recordType, setRecordType] = useState(searchParams.get('type') || 'birth');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const verifyCertificate = async () => {
    if (!certificateNumber.trim()) {
      setError('Please enter a certificate number');
      return;
    }

    setLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      let record = null;
      let api = null;

      // Select appropriate API based on record type
      switch (recordType) {
        case 'birth':
          api = birthRecordsAPI;
          break;
        case 'death':
          api = deathRecordsAPI;
          break;
        case 'marriage':
          api = marriageRecordsAPI;
          break;
        case 'divorce':
          api = divorceRecordsAPI;
          break;
        default:
          throw new Error('Invalid record type');
      }

      // Fetch all records and search for certificate number
      const response = await api.getRecords({ search: certificateNumber });
      const records = response.birth_records || response.death_records || 
                     response.marriage_records || response.divorce_records || 
                     response.births || response.deaths || 
                     response.marriages || response.divorces || [];

      // Find record with matching certificate number
      record = records.find(r => r.certificate_number === certificateNumber);

      if (record && record.status === 'approved') {
        setVerificationResult({
          valid: true,
          record,
          recordType
        });
      } else if (record) {
        setVerificationResult({
          valid: false,
          message: 'Certificate found but not yet approved',
          status: record.status
        });
      } else {
        setVerificationResult({
          valid: false,
          message: 'Certificate not found in our records'
        });
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to verify certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatRecordDetails = (record) => {
    if (!record) return null;

    switch (recordType) {
      case 'birth':
        return {
          name: `${record.child_first_name} ${record.child_father_name} ${record.child_grandfather_name || ''}`.trim(),
          date: record.date_of_birth,
          place: `${record.birth_city}, ${record.birth_region}`,
          registrationDate: record.registration_date
        };
      case 'death':
        return {
          name: `${record.deceased_first_name} ${record.deceased_father_name} ${record.deceased_grandfather_name || ''}`.trim(),
          date: record.date_of_death,
          place: `${record.death_city}, ${record.death_region}`,
          registrationDate: record.registration_date
        };
      case 'marriage':
        return {
          name: `${record.spouse1_full_name} & ${record.spouse2_full_name}`,
          date: record.marriage_date,
          place: `${record.marriage_city}, ${record.marriage_region}`,
          registrationDate: record.registration_date
        };
      case 'divorce':
        return {
          name: `${record.spouse1_full_name} & ${record.spouse2_full_name}`,
          date: record.divorce_date,
          place: `${record.divorce_city}, ${record.divorce_region}`,
          registrationDate: record.registration_date
        };
      default:
        return null;
    }
  };

  const details = verificationResult?.valid ? formatRecordDetails(verificationResult.record) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Certificate Verification
          </h1>
          <p className="text-lg text-gray-600">
            Verify the authenticity of vital records certificates
          </p>
        </div>

        {/* Verification Form */}
        <Card className="p-8 mb-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificate Number
              </label>
              <input
                type="text"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
                placeholder="Enter certificate number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Record Type
              </label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="birth">Birth Certificate</option>
                <option value="death">Death Certificate</option>
                <option value="marriage">Marriage Certificate</option>
                <option value="divorce">Divorce Certificate</option>
              </select>
            </div>

            <Button
              onClick={verifyCertificate}
              disabled={loading}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3 text-lg font-semibold"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2 inline" />
                  Verify Certificate
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="p-6 mb-6 bg-red-50 border-l-4 border-red-500">
            <div className="flex items-center">
              <XCircleIcon className="h-6 w-6 text-red-500 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </Card>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <Card className={`p-8 ${verificationResult.valid ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
            <div className="flex items-start">
              {verificationResult.valid ? (
                <CheckCircleIcon className="h-12 w-12 text-green-500 mr-4 flex-shrink-0" />
              ) : (
                <XCircleIcon className="h-12 w-12 text-red-500 mr-4 flex-shrink-0" />
              )}
              
              <div className="flex-1">
                <h2 className={`text-2xl font-bold mb-4 ${verificationResult.valid ? 'text-green-800' : 'text-red-800'}`}>
                  {verificationResult.valid ? 'Certificate Verified ✓' : 'Verification Failed'}
                </h2>

                {verificationResult.valid && details ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Certificate Number</p>
                        <p className="text-lg font-semibold text-gray-900">{certificateNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Record Type</p>
                        <p className="text-lg font-semibold text-gray-900 capitalize">{recordType}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Name</p>
                        <p className="text-lg font-semibold text-gray-900">{details.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Date</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {details.date ? format(new Date(details.date), 'MMM dd, yyyy') : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Place</p>
                        <p className="text-lg font-semibold text-gray-900">{details.place}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Registration Date</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {details.registrationDate ? format(new Date(details.registrationDate), 'MMM dd, yyyy') : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-green-100 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Status:</strong> This certificate is authentic and has been officially approved by the Vital Management System.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-lg text-red-700">{verificationResult.message}</p>
                    {verificationResult.status && (
                      <p className="text-sm text-red-600">
                        Current Status: <span className="font-semibold capitalize">{verificationResult.status}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Information */}
        <Card className="p-6 mt-6 bg-blue-50">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Verify</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Enter the certificate number found on your certificate document</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Select the correct record type (Birth, Death, Marriage, or Divorce)</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Click "Verify Certificate" to check authenticity</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span>If you have a QR code on your certificate, you can scan it to auto-fill the information</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default VerifyCertificate;
