import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, EyeIcon, PencilIcon, TrashIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { divorceRecordsAPI } from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import DivorceRecordForm from '../components/divorce/DivorceRecordForm';
import ViewDivorceRecord from '../components/divorce/ViewDivorceRecord';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';

const DivorceRecords = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    region: ''
  });

  useEffect(() => {
    fetchRecords();
  }, [currentPage, searchTerm, filters.region, filters.status, filters.dateFrom, filters.dateTo]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      
      const queryParams = {
        page: currentPage,
        per_page: 20,
        search: searchTerm || '',
        ...(filters.region && { region: filters.region }),
        ...(filters.status && { status: filters.status }),
        ...(filters.dateFrom && { date_from: filters.dateFrom }),
        ...(filters.dateTo && { date_to: filters.dateTo })
      };
      
      console.log('Fetching divorce records with params:', queryParams);
      
      const response = await divorceRecordsAPI.getRecords(queryParams);
      
      console.log('API Response in component:', response);
      console.log('Response type:', typeof response);
      console.log('Has divorce_records?', response?.divorce_records);
      console.log('divorce_records length:', response?.divorce_records?.length);
      console.log('divorce_records array:', response?.divorce_records);
      
      if (response && response.divorce_records) {
        console.log('Setting records to state:', response.divorce_records);
        setRecords(response.divorce_records);
        setTotalPages(response.pages || 1);
        setTotalRecords(response.total || 0);
        console.log('State updated - records count:', response.divorce_records.length);
        
        if (response.divorce_records.length === 0) {
          const noRecordsMessage = searchTerm 
            ? t('divorce.noRecordsFound')
            : t('divorce.noRecordsAvailable');
          
          if (currentPage === 1) {
            toast.info(noRecordsMessage, { autoClose: 3000 });
          }
        }
      } else {
        console.warn('Empty or invalid response from server');
        setRecords([]);
        setTotalPages(1);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error('Error fetching divorce records:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.message || t('divorce.failedToLoad');
      toast.error(errorMessage);
      
      setRecords([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (window.confirm(t('divorce.deleteConfirm'))) {
      try {
        await divorceRecordsAPI.deleteRecord(id);
        toast.success(t('divorce.recordDeleted'));
        fetchRecords();
      } catch (error) {
        console.error('Error deleting record:', error);
        toast.error(t('divorce.failedToDelete'));
      }
    }
  };

  const handleFormSuccess = () => {
    fetchRecords();
    setSelectedRecord(null);
    setIsFormOpen(false);
  };

  const handleViewRecord = async (record) => {
    try {
      // Fetch full record details including photos
      const fullRecord = await divorceRecordsAPI.getRecord(record.divorce_id || record.id);
      setSelectedRecord(fullRecord);
      setIsViewOpen(true);
    } catch (error) {
      console.error('Error fetching record details:', error);
      toast.error(t('divorce.failedToLoadDetails'));
    }
  };

  const handleEditRecord = async (record) => {
    try {
      // Fetch full record details to ensure all fields including photos are available
      const fullRecord = await divorceRecordsAPI.getRecord(record.divorce_id || record.id);
      setSelectedRecord(fullRecord);
      setIsFormOpen(true);
    } catch (error) {
      console.error('Error fetching record details:', error);
      toast.error(t('divorce.failedToLoadDetails'));
      // Fallback to using the record from the list
      setSelectedRecord(record);
      setIsFormOpen(true);
    }
  };

  const handleAddRecord = () => {
    setSelectedRecord(null);
    setIsFormOpen(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleExport = () => {
    try {
      const exportData = records.map(record => ({
        [t('divorce.certificateNumber')]: record.certificate_number || 'N/A',
        [t('divorce.spouse1')]: record.spouse1_full_name || 'N/A',
        [t('divorce.spouse2')]: record.spouse2_full_name || 'N/A',
        [t('divorce.divorceDate')]: record.divorce_date || 'N/A',
        [t('divorce.divorceType')]: record.divorce_type || 'N/A',
        [t('divorce.courtName')]: record.court_name || 'N/A',
        [t('divorce.caseNumber')]: record.divorce_case_number || 'N/A',
        [t('divorce.region')]: record.divorce_region || 'N/A',
        [t('divorce.zone')]: record.divorce_zone || 'N/A',
        [t('divorce.woreda')]: record.divorce_woreda || 'N/A',
        [t('common.registrationDate')]: record.registration_date ? format(new Date(record.registration_date), 'MMM dd, yyyy') : 'N/A',
        [t('common.registeredBy')]: record.registered_by_name || 'N/A',
        [t('records.status')]: record.status || 'N/A'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, t('divorce.title'));
      const filename = `Divorce_Records_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(wb, filename);
      
      toast.success(t('divorce.exportSuccess', { count: exportData.length }));
    } catch (error) {
      console.error('Error exporting records:', error);
      toast.error(t('divorce.exportFailed'));
    }
  };

  const applyFilters = () => {
    fetchRecords();
    setShowFilters(false);
    toast.success(t('divorce.filtersApplied'));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      dateFrom: '',
      dateTo: '',
      region: ''
    });
    toast.info(t('divorce.filtersCleared'));
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      approved: 'badge-success',
      draft: 'badge-warning',
      pending: 'badge-warning',
      rejected: 'badge-error',
    };
    
    const statusLabels = {
      approved: t('records.approved'),
      draft: t('records.draft'),
      pending: t('records.pending'),
      rejected: t('records.rejected'),
    };
    
    return (
      <span className={`${statusStyles[status] || 'badge-info'}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  console.log('Rendering DivorceRecords - records state:', records);
  console.log('Rendering DivorceRecords - records.length:', records.length);
  console.log('Rendering DivorceRecords - loading:', loading);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 shadow-xl border-b border-orange-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-bold text-xl">⚖️</span>
                </div>
                {t('divorce.title')}
              </h1>
              <p className="text-orange-100 mt-2 text-lg">
                {t('divorce.manageRecords')} • {totalRecords.toLocaleString()} {t('divorce.totalRecords')}
              </p>
            </div>
            {user?.role !== 'statistician' && (
              <Button 
                onClick={handleAddRecord}
                className="bg-white text-orange-700 hover:bg-orange-50 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                {t('divorce.addDivorceRecord')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6 hover:shadow-xl transition-shadow duration-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder={t('divorce.searchPlaceholder')}
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowFilters(!showFilters)}
                variant="outline" 
                size="sm" 
                className="border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200"
              >
                <FunnelIcon className="h-4 w-4 mr-1" />
                {t('divorce.filter')}
              </Button>
              <Button 
                onClick={handleExport}
                variant="outline" 
                size="sm" 
                className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                {t('divorce.export')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('divorce.filterRecords')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('divorce.region')}</label>
                <select
                  value={filters.region}
                  onChange={(e) => setFilters({...filters, region: e.target.value})}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                >
                  <option value="">{t('divorce.allRegions')}</option>
                  <option value="AD">{t('divorce.addisAbaba')}</option>
                  <option value="AF">{t('divorce.afar')}</option>
                  <option value="AM">{t('divorce.amhara')}</option>
                  <option value="BG">{t('divorce.benishangul')}</option>
                  <option value="DD">{t('divorce.direDawa')}</option>
                  <option value="GM">{t('divorce.gambella')}</option>
                  <option value="HR">{t('divorce.harari')}</option>
                  <option value="OR">{t('divorce.oromia')}</option>
                  <option value="SO">{t('divorce.somali')}</option>
                  <option value="SN">{t('divorce.southernNations')}</option>
                  <option value="TG">{t('divorce.tigray')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('records.status')}</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                >
                  <option value="">{t('divorce.allStatus')}</option>
                  <option value="approved">{t('common.approved')}</option>
                  <option value="pending">{t('common.pending')}</option>
                  <option value="draft">{t('divorce.draft')}</option>
                  <option value="rejected">{t('common.rejected')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('divorce.dateFrom')}</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('divorce.dateTo')}</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={applyFilters}
                className="bg-orange-600 text-white hover:bg-orange-700 px-6 py-2 rounded-lg"
              >
                {t('divorce.applyFilters')}
              </Button>
              <Button
                onClick={clearFilters}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg"
              >
                {t('divorce.clearFilters')}
              </Button>
            </div>
          </Card>
        )}

        {/* Records Table */}
        <Card className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600"></div>
              <p className="mt-4 text-gray-600 font-medium">{t('divorce.loadingRecords')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {t('divorce.certificateNumber')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('divorce.spouse1')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('divorce.spouse2')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('divorce.divorceDate')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('divorce.court')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('records.status')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('divorce.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-4 shadow-md">
                            <span className="text-4xl">⚖️</span>
                          </div>
                          <p className="text-xl font-bold text-gray-900 mb-2">{t('divorce.noRecordsFound')}</p>
                          <p className="text-sm text-gray-500 mb-4">
                            {user?.role === 'statistician' ? t('divorce.noRecordsAvailable') : t('divorce.startByAdding')}
                          </p>
                          {user?.role !== 'statistician' && (
                            <Button onClick={handleAddRecord} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md">
                              <PlusIcon className="h-5 w-5 mr-2 inline" />
                              {t('divorce.addFirstRecord')}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record.divorce_id || record.id} className="hover:bg-orange-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-orange-900 bg-orange-100 px-3 py-1 rounded-full text-sm">
                            {record.certificate_number || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                          {record.spouse1_full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                          {record.spouse2_full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {formatDate(record.divorce_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {record.court_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(record.status || 'draft')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => handleViewRecord(record)}
                              className="text-green-600 hover:text-white hover:bg-green-600 p-2 rounded-lg transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-md"
                              title="View"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            {user?.role !== 'statistician' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleEditRecord(record)}
                                  className="text-blue-600 hover:text-white hover:bg-blue-600 p-2 rounded-lg transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-md"
                                  title="Edit"
                                >
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRecord(record.divorce_id || record.id)}
                                  className="text-red-600 hover:text-white hover:bg-red-600 p-2 rounded-lg transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-md"
                                  title="Delete"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              
              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    {t('common.previous')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    {t('common.next')}
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      {t('divorce.showingPage')} <span className="font-medium">{currentPage}</span> {t('records.of')}{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        {t('common.previous')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="ml-2"
                      >
                        {t('common.next')}
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Divorce Record Form Modal */}
      <DivorceRecordForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
        onSuccess={handleFormSuccess}
      />

      {/* View Divorce Record Modal */}
      <ViewDivorceRecord
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
        onStatusChange={() => {
          fetchRecords();
        }}
      />
    </div>
  );
};

export default DivorceRecords;
