import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  DocumentCheckIcon, 
  MagnifyingGlassIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { birthRecordsAPI, deathRecordsAPI, marriageRecordsAPI, divorceRecordsAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Certificates = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // Fetch all records
  const { data: birthRecords, isLoading: birthLoading } = useQuery({
    queryKey: ['birthRecords'],
    queryFn: async () => {
      try {
        const response = await birthRecordsAPI.getRecords();
        console.log('Birth records response:', response);
        // Handle different response structures
        const records = response?.data?.birth_records || response?.birth_records || [];
        console.log('Birth records extracted:', records);
        return records;
      } catch (error) {
        console.error('Error fetching birth records:', error);
        return [];
      }
    },
  });

  const { data: deathRecords, isLoading: deathLoading } = useQuery({
    queryKey: ['deathRecords'],
    queryFn: async () => {
      try {
        const response = await deathRecordsAPI.getRecords();
        console.log('Death records response:', response);
        const records = response?.data?.death_records || response?.death_records || [];
        console.log('Death records extracted:', records);
        return records;
      } catch (error) {
        console.error('Error fetching death records:', error);
        return [];
      }
    },
  });

  const { data: marriageRecords, isLoading: marriageLoading } = useQuery({
    queryKey: ['marriageRecords'],
    queryFn: async () => {
      try {
        const response = await marriageRecordsAPI.getRecords();
        console.log('Marriage records response:', response);
        const records = response?.data?.marriage_records || response?.marriage_records || [];
        console.log('Marriage records extracted:', records);
        return records;
      } catch (error) {
        console.error('Error fetching marriage records:', error);
        return [];
      }
    },
  });

  const { data: divorceRecords, isLoading: divorceLoading } = useQuery({
    queryKey: ['divorceRecords'],
    queryFn: async () => {
      try {
        const response = await divorceRecordsAPI.getRecords();
        console.log('Divorce records response:', response);
        const records = response?.data?.divorce_records || response?.divorce_records || [];
        console.log('Divorce records extracted:', records);
        return records;
      } catch (error) {
        console.error('Error fetching divorce records:', error);
        return [];
      }
    },
  });

  const isLoading = birthLoading || deathLoading || marriageLoading || divorceLoading;

  // Combine all records with type and proper ID field
  const allRecords = [
    ...(birthRecords || []).map(r => ({ 
      ...r, 
      type: 'birth', 
      displayName: r.child_first_name,
      recordId: r.birth_id || r._id 
    })),
    ...(deathRecords || []).map(r => ({ 
      ...r, 
      type: 'death', 
      displayName: r.deceased_first_name,
      recordId: r.death_id || r._id 
    })),
    ...(marriageRecords || []).map(r => ({ 
      ...r, 
      type: 'marriage', 
      displayName: `${r.spouse1_full_name} & ${r.spouse2_full_name}`,
      recordId: r.marriage_id || r._id 
    })),
    ...(divorceRecords || []).map(r => ({ 
      ...r, 
      type: 'divorce', 
      displayName: `${r.spouse1_full_name} & ${r.spouse2_full_name}`,
      recordId: r.divorce_id || r._id 
    })),
  ];

  console.log('All records combined:', allRecords);
  console.log('Total records:', allRecords.length);
  console.log('Sample record:', allRecords[0]);

  // Filter records
  const filteredRecords = allRecords.filter(record => {
    const matchesType = selectedType === 'all' || record.type === selectedType;
    const matchesSearch = !searchQuery || 
      record.certificate_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleViewCertificate = (record) => {
    console.log('Viewing certificate for record:', record);
    navigate(`/certificates/${record.type}/${record.recordId}`);
  };

  const handlePrintCertificate = (record) => {
    console.log('Printing certificate for record:', record);
    navigate(`/certificates/${record.type}/${record.recordId}`);
    setTimeout(() => window.print(), 500);
  };

  const handleDownloadCertificate = async (record) => {
    console.log('Downloading certificate for record:', record);
    setDownloadingId(record.recordId);
    
    try {
      // Dynamic import for better code splitting
      const domtoimage = await import('dom-to-image-more');
      const jsPDF = (await import('jspdf')).default;
      
      // Navigate to certificate view to render it
      navigate(`/certificates/${record.type}/${record.recordId}`);
      
      // Wait for page to load and render
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Find the certificate content
      const element = document.querySelector('.certificate-content') || document.body;
      
      // Get element dimensions
      const rect = element.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // Generate high-quality PNG from DOM
      const dataUrl = await domtoimage.toPng(element, {
        quality: 1.0,
        bgcolor: '#ffffff',
        width: width * 3, // 3x scale for better quality
        height: height * 3,
        style: {
          transform: 'scale(3)',
          transformOrigin: 'top left',
          width: width + 'px',
          height: height + 'px'
        },
        cacheBust: true,
        imagePlaceholder: undefined
      });
      
      // Create image to get dimensions
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      // Create PDF with proper dimensions
      const pdf = new jsPDF({
        orientation: height > width ? 'portrait' : 'landscape',
        unit: 'px',
        format: [width, height],
        compress: true
      });
      
      // Add image to PDF (full page)
      pdf.addImage(dataUrl, 'PNG', 0, 0, width, height, undefined, 'FAST');
      
      // Generate filename
      const filename = `${record.type.charAt(0).toUpperCase() + record.type.slice(1)}_Certificate_${record.certificate_number || record.recordId}.pdf`;
      pdf.save(filename);
      
      toast.success('Certificate downloaded successfully');
      
      // Navigate back after download
      setTimeout(() => navigate('/certificates'), 500);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'birth': return 'bg-green-100 text-green-800 border-green-200';
      case 'death': return 'bg-red-100 text-red-800 border-red-200';
      case 'marriage': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'divorce': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    return DocumentCheckIcon;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <DocumentCheckIcon className="h-8 w-8 mr-3" />
              Certificates
            </h1>
            <p className="mt-2 text-green-100">Generate, view, and download official vital records certificates</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm font-semibold">Total Certificates</p>
              <p className="text-3xl font-bold">{allRecords.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by certificate number or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedType('birth')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === 'birth'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Birth
            </button>
            <button
              onClick={() => setSelectedType('death')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === 'death'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Death
            </button>
            <button
              onClick={() => setSelectedType('marriage')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === 'marriage'
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Marriage
            </button>
            <button
              onClick={() => setSelectedType('divorce')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === 'divorce'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Divorce
            </button>
          </div>
        </div>
      </Card>

      {/* Certificates List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      ) : filteredRecords.length === 0 ? (
        <Card className="p-12 text-center">
          <DocumentCheckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Certificates Found</h3>
          <p className="text-gray-500">
            {searchQuery || selectedType !== 'all'
              ? 'Try adjusting your filters or search terms'
              : 'No records available yet. Create some vital records first.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRecords.map((record) => {
            const TypeIcon = getTypeIcon(record.type);
            return (
              <Card key={`${record.type}-${record.recordId}`} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`p-3 rounded-lg ${getTypeColor(record.type)}`}>
                      <TypeIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{record.displayName}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getTypeColor(record.type)}`}>
                          {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Certificate No: <span className="font-mono font-semibold">{record.certificate_number}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Issued: {record.created_at ? new Date(record.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleViewCertificate(record)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    <Button
                      onClick={() => handlePrintCertificate(record)}
                      className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                    >
                      <PrinterIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Print</span>
                    </Button>
                    <Button
                      onClick={() => handleDownloadCertificate(record)}
                      disabled={downloadingId === record.recordId}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadingId === record.recordId ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span className="hidden sm:inline">Downloading...</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownTrayIcon className="h-4 w-4" />
                          <span className="hidden sm:inline">Download</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-l-4 border-blue-500">
        <div className="flex">
          <div className="flex-shrink-0">
            <DocumentCheckIcon className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Certificate Information:</strong> All registered vital records are available for certificate generation. 
              Certificates are formatted according to Ethiopian vital records standards and include security features.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Certificates;
