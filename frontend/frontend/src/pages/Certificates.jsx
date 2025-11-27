import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  DocumentCheckIcon, 
  MagnifyingGlassIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { birthRecordsAPI, deathRecordsAPI, marriageRecordsAPI, divorceRecordsAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Certificates = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

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

  const handleDownloadCertificate = (record) => {
    console.log('Downloading certificate for record:', record);
    // Just navigate to view page - user can download from there
    navigate(`/certificates/${record.type}/${record.recordId}`);
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
              {t('certificates.title')}
            </h1>
            <p className="mt-2 text-green-100">{t('certificates.description')}</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm font-semibold">{t('certificates.totalCertificates')}</p>
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
                placeholder={t('certificates.searchPlaceholder')}
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
              {t('certificates.all')}
            </button>
            <button
              onClick={() => setSelectedType('birth')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === 'birth'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('certificates.birth')}
            </button>
            <button
              onClick={() => setSelectedType('death')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === 'death'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('certificates.death')}
            </button>
            <button
              onClick={() => setSelectedType('marriage')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === 'marriage'
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('certificates.marriage')}
            </button>
            <button
              onClick={() => setSelectedType('divorce')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === 'divorce'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('certificates.divorce')}
            </button>
          </div>
        </div>
      </Card>

      {/* Certificates List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">{t('certificates.loading')}</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <Card className="p-12 text-center">
          <DocumentCheckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('certificates.noCertificatesFound')}</h3>
          <p className="text-gray-500">
            {searchQuery || selectedType !== 'all'
              ? t('certificates.tryAdjustingFilters')
              : t('certificates.noRecordsAvailable')}
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
                        {t('certificates.certificateNo')}: <span className="font-mono font-semibold">{record.certificate_number}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('certificates.issued')}: {record.created_at ? new Date(record.created_at).toLocaleDateString() : 'N/A'}
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
                      <span className="hidden sm:inline">{t('certificates.view')}</span>
                    </Button>
                    <Button
                      onClick={() => handlePrintCertificate(record)}
                      className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                    >
                      <PrinterIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">{t('certificates.print')}</span>
                    </Button>
                    <Button
                      onClick={() => handleDownloadCertificate(record)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">{t('certificates.download')}</span>
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
              <strong>{t('certificates.certificateInformation')}:</strong> {t('certificates.certificateInfoText')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Certificates;
