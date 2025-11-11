import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, EyeIcon, PencilIcon, TrashIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import ViewBirthRecord from '../components/birth/ViewBirthRecord';
import { useAuth } from '../context/AuthContext';
import { birthRecordsAPI } from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import BirthRecordForm from '../components/birth/BirthRecordForm';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const BirthRecords = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    region: '',
    gender: ''
  });

  useEffect(() => {
    fetchRecords();
  }, [currentPage, searchTerm, filters.gender, filters.region, filters.status, filters.dateFrom, filters.dateTo]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      
      // Prepare query parameters - include search and filters
      const queryParams = {
        page: currentPage,
        per_page: 20,
        search: searchTerm || '',
        // Add filter parameters if they have values
        ...(filters.gender && { gender: filters.gender }),
        ...(filters.region && { region: filters.region }),
        ...(filters.status && { status: filters.status }),
        ...(filters.dateFrom && { date_from: filters.dateFrom }),
        ...(filters.dateTo && { date_to: filters.dateTo })
      };
      
      console.log('Fetching records with params:', queryParams);
      
      const response = await birthRecordsAPI.getRecords(queryParams);
      
      console.log('API Response in component:', response);
      
      // Handle the response - check for the correct data structure
      if (response && response.birth_records) {
        const recordsData = Array.isArray(response.birth_records) 
          ? response.birth_records 
          : [];
          
        console.log('Processed records data:', recordsData);
        
        setRecords(recordsData);
        setTotalPages(response.pages || 1);
        setTotalRecords(response.total || 0);
        
        // Log if no records were found
        if (recordsData.length === 0) {
          const noRecordsMessage = searchTerm 
            ? 'No birth records found matching your search criteria.'
            : 'No birth records found in the database.';
          
          console.warn(noRecordsMessage);
          
          // Only show toast if it's not the initial load
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
      console.error('Error fetching birth records:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Show user-friendly error message
      const errorMessage = error.response?.data?.message || 'Failed to load birth records. Please try again.';
      toast.error(errorMessage);
      
      // Reset state on error
      setRecords([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (record) => {
    setRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;
    
    setIsDeleting(true);
    try {
      await birthRecordsAPI.deleteRecord(recordToDelete.birth_id || recordToDelete.id);
      toast.success('Birth record deleted successfully');
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
      fetchRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error(error.message || 'Failed to delete record');
    } finally {
      setIsDeleting(false);
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
      const fullRecord = await birthRecordsAPI.getRecord(record.birth_id || record.id);
      console.log('Full record fetched for view:', fullRecord);
      setSelectedRecord(fullRecord);
      setIsViewOpen(true);
    } catch (error) {
      console.error('Error fetching record details:', error);
      toast.error('Failed to load record details');
    }
  };

  const handleEditRecord = async (record) => {
    try {
      // Fetch full record details to ensure all fields are available
      const fullRecord = await birthRecordsAPI.getRecord(record.birth_id || record.id);
      setSelectedRecord(fullRecord);
      setIsFormOpen(true);
    } catch (error) {
      console.error('Error fetching record details:', error);
      toast.error('Failed to load record details');
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
    setCurrentPage(1); // Reset to first page when searching
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      approved: 'badge-success',
      draft: 'badge-warning',
      rejected: 'badge-error',
    };
    
    return (
      <span className={`${statusStyles[status] || 'badge-info'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
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

  const handleExport = () => {
    try {
      // Prepare data for export
      const exportData = records.map(record => ({
        'Certificate Number': record.certificate_number || 'N/A',
        'Child Name': `${record.child_first_name || ''} ${record.child_father_name || ''} ${record.child_grandfather_name || ''}`.trim(),
        'Gender': record.child_gender || 'N/A',
        'Date of Birth': record.date_of_birth || 'N/A',
        'Place of Birth': record.place_of_birth_name || record.birth_city || 'N/A',
        'Region': record.birth_region || 'N/A',
        'Zone': record.birth_zone || 'N/A',
        'Woreda': record.birth_woreda || 'N/A',
        'Kebele': record.birth_kebele || 'N/A',
        'Father Name': record.father_full_name || 'N/A',
        'Mother Name': record.mother_full_name || 'N/A',
        'Registration Date': formatDate(record.registration_date),
        'Registered By': record.registered_by_name || 'N/A',
        'Status': record.status || 'N/A'
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Birth Records');
      
      // Generate filename with current date
      const filename = `Birth_Records_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      
      // Save file
      XLSX.writeFile(wb, filename);
      
      toast.success(`Exported ${exportData.length} records successfully!`);
    } catch (error) {
      console.error('Error exporting records:', error);
      toast.error('Failed to export records. Please try again.');
    }
  };

  const applyFilters = () => {
    // Apply filters and fetch records
    fetchRecords();
    setShowFilters(false);
    toast.success('Filters applied!');
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      dateFrom: '',
      dateTo: '',
      region: '',
      gender: ''
    });
    toast.info('Filters cleared!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-xl border-b border-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-bold text-xl">📋</span>
                </div>
                Birth Records
              </h1>
              <p className="text-blue-100 mt-2 text-lg">
                Manage birth registration records • {totalRecords.toLocaleString()} total records
              </p>
            </div>
            {user?.role !== 'statistician' && (
              <Button 
                onClick={handleAddRecord}
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Birth Record
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
                  placeholder="Search by name, certificate number..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowFilters(!showFilters)}
                variant="outline" 
                size="sm" 
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200"
              >
                <FunnelIcon className="h-4 w-4 mr-1" />
                Filter
              </Button>
              <Button 
                onClick={handleExport}
                variant="outline" 
                size="sm" 
                className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </Card>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Records</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={filters.gender}
                  onChange={(e) => setFilters({...filters, gender: e.target.value})}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                <select
                  value={filters.region}
                  onChange={(e) => setFilters({...filters, region: e.target.value})}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Regions</option>
                  <option value="AD">Addis Ababa</option>
                  <option value="AF">Afar</option>
                  <option value="AM">Amhara</option>
                  <option value="BG">Benishangul-Gumuz</option>
                  <option value="DD">Dire Dawa</option>
                  <option value="GM">Gambella</option>
                  <option value="HR">Harari</option>
                  <option value="OR">Oromia</option>
                  <option value="SO">Somali</option>
                  <option value="SN">Southern Nations</option>
                  <option value="TG">Tigray</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="draft">Draft</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={applyFilters}
                className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-lg"
              >
                Apply Filters
              </Button>
              <Button
                onClick={clearFilters}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg"
              >
                Clear Filters
              </Button>
            </div>
          </Card>
        )}

        {/* Records Table */}
        <Card className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading records...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Certificate #
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Child's Name
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Father's Name
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Date of Birth
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4 shadow-md">
                            <span className="text-4xl">📋</span>
                          </div>
                          <p className="text-xl font-bold text-gray-900 mb-2">No birth records found</p>
                          <p className="text-sm text-gray-500 mb-4">
                            {user?.role === 'statistician' ? 'No records available in the database' : 'Start by adding a new birth record'}
                          </p>
                          {user?.role !== 'statistician' && (
                            <Button onClick={handleAddRecord} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md">
                              <PlusIcon className="h-5 w-5 mr-2 inline" />
                              Add First Record
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record.birth_id || record.id} className="hover:bg-blue-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-blue-900 bg-blue-100 px-3 py-1 rounded-full text-sm">
                            {record.certificate_number || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                          {record.child_first_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {record.father_full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {formatDate(record.date_of_birth)}
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
                              title="View Details"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            {user?.role !== 'statistician' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleEditRecord(record)}
                                  className="text-blue-600 hover:text-white hover:bg-blue-600 p-2 rounded-lg transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-md"
                                  title="Edit Birth Record"
                                >
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteClick(record)}
                                  className="text-red-600 hover:text-white hover:bg-red-600 p-2 rounded-lg transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-md"
                                  title="Delete Record"
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
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
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
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="ml-2"
                      >
                        Next
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Birth Record Form Modal - Only render when isFormOpen is true */}
      {isFormOpen && (
        <BirthRecordForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedRecord(null);
          }}
          record={selectedRecord}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* View Birth Record Modal */}
      <ViewBirthRecord
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
        onStatusChange={fetchRecords}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
              {/* Warning Icon */}
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Delete Birth Record?
              </h3>

              {/* Message */}
              <p className="text-gray-600 text-center mb-2">
                Are you sure you want to delete this birth record?
              </p>
              
              {recordToDelete && (
                <div className="bg-gray-50 rounded-lg p-3 mb-6">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Child:</span> {recordToDelete.child_first_name}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Certificate:</span> {recordToDelete.certificate_number}
                  </p>
                </div>
              )}

              <p className="text-sm text-red-600 text-center font-medium mb-6">
                ⚠️ This action cannot be undone!
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setRecordToDelete(null);
                  }}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="h-4 w-4" />
                      Delete Record
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BirthRecords;

