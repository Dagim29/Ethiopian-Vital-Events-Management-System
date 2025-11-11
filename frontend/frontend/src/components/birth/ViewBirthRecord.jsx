import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { format, parseISO, isValid } from 'date-fns';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, UserIcon, CalendarIcon, MapPinIcon, HeartIcon, DocumentTextIcon, CheckCircleIcon, XCircleIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { birthRecordsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const ViewBirthRecord = ({ isOpen = false, onClose = () => {}, record = {}, onStatusChange = () => {} }) => {
  const { user } = useAuth();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  
  // Check if user can approve/reject
  const canApprove = user && (user.role === 'admin' || user.role === 'vms_officer');
  const showApproveButtons = canApprove && record && record.status && ['draft', 'submitted'].includes(record.status);
  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      return isValid(date) ? format(date, 'MMMM d, yyyy') : 'N/A';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  // Helper function to format field names
  const formatFieldName = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Render a field with label and value
  const renderField = (key, value) => {
    if (value === null || value === undefined || value === '') {
      value = 'N/A';
    }

    // Format specific fields
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('dob')) {
      value = formatDate(value);
    }

    return (
      <div key={key} className="py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors duration-150 px-4 -mx-4">
        <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{formatFieldName(key)}</dt>
        <dd className="mt-1.5 text-sm text-gray-900 break-words font-medium">
          {Array.isArray(value) ? (
            <ul className="list-disc pl-5 space-y-1">
              {value.map((item, idx) => (
                <li key={idx}>{String(item)}</li>
              ))}
            </ul>
          ) : typeof value === 'object' ? (
            <pre className="whitespace-pre-wrap bg-gray-50 p-2 rounded text-xs">
              {JSON.stringify(value, null, 2)}
            </pre>
          ) : (
            String(value)
          )}
        </dd>
      </div>
    );
  };

  // Render photos section
  const renderPhotos = () => {
    const photos = [
      { label: 'Child Photo', src: record.child_photo, icon: '👶' },
      { label: 'Father Photo', src: record.father_photo, icon: '👨' },
      { label: 'Mother Photo', src: record.mother_photo, icon: '👩' }
    ].filter(photo => photo.src && photo.src.length > 0);

    if (photos.length === 0) {
      return null;
    }

    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6 hover:shadow-lg transition-shadow duration-200">
        <div className="px-5 py-4 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
          <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2">
            <PhotoIcon className="h-5 w-5" />
            Photos
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {photos.map((photo, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="relative w-full">
                  <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300 shadow-md">
                    <img
                      src={photo.src}
                      alt={photo.label}
                      className="w-full h-full object-cover"
                      style={{ display: 'block', maxWidth: '100%', maxHeight: '100%' }}
                      onError={(e) => {
                        e.target.parentElement.innerHTML = `
                          <div class="w-full h-full flex flex-col items-center justify-center bg-red-50">
                            <svg class="h-12 w-12 text-red-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span class="text-sm text-red-600">Failed to load image</span>
                          </div>
                        `;
                      }}
                    />
                  </div>
                </div>
                <p className="mt-3 text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="text-xl">{photo.icon}</span>
                  {photo.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Group fields into sections
  const getSections = () => {
    if (!record || Object.keys(record).length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No record data available</p>
        </div>
      );
    }

    // Get all fields from the record that aren't in the defined sections
    const otherFields = Object.keys(record).filter(
      field => ![
        'child_first_name', 'child_middle_name', 'child_last_name',
        'date_of_birth', 'gender', 'weight_kg', 'height_cm',
        'father_name', 'mother_name', 'father_contact', 'mother_contact',
        'place_of_birth', 'delivery_type', 'birth_time', 'birth_attendant',
        'apgar_score', 'complications', 'blood_type', 'additional_notes',
        'child_photo', 'father_photo', 'mother_photo'
      ].includes(field)
    );

    const sections = {
      'Child Information': [
        'child_first_name', 'child_middle_name', 'child_last_name',
        'date_of_birth', 'gender', 'weight_kg', 'height_cm'
      ],
      'Parents Information': [
        'father_name', 'mother_name', 'father_contact', 'mother_contact'
      ],
      'Birth Details': [
        'place_of_birth', 'delivery_type', 'birth_time', 'birth_attendant'
      ],
      'Medical Information': [
        'apgar_score', 'complications', 'blood_type', 'additional_notes'
      ],
      'Additional Information': otherFields
    };

    return Object.entries(sections).map(([title, fields]) => {
      const sectionFields = fields
        .filter(field => record[field] !== undefined && record[field] !== null && record[field] !== '')
        .map(field => renderField(field, record[field]));

      if (sectionFields.length === 0) return null;

      const getSectionIcon = () => {
        if (title === 'Child Information') return <UserIcon className="h-5 w-5" />;
        if (title === 'Parents Information') return <HeartIcon className="h-5 w-5" />;
        if (title === 'Birth Details') return <CalendarIcon className="h-5 w-5" />;
        if (title === 'Medical Information') return <DocumentTextIcon className="h-5 w-5" />;
        return <MapPinIcon className="h-5 w-5" />;
      };

      return (
        <div key={title} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6 hover:shadow-lg transition-shadow duration-200">
          <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
              {getSectionIcon()}
              {title}
            </h3>
          </div>
          <div className="divide-y divide-gray-100 p-2">
            {sectionFields}
          </div>
        </div>
      );
    });
  };

  if (!isOpen) return null;

  // Debug: Log the record to console
  console.log('Birth Record Data:', record);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white px-4 pt-5 pb-4 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6 border border-gray-200">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-full bg-gray-100 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 focus:outline-none transition-all duration-200 transform hover:scale-110"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex items-center justify-between mb-4">
                      <Dialog.Title className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                          <DocumentTextIcon className="h-7 w-7 text-white" />
                        </div>
                        Birth Record Details
                      </Dialog.Title>
                      {record.status && (
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          record.status === 'approved' ? 'bg-green-100 text-green-800' :
                          record.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 -mr-2">
                      {renderPhotos()}
                      {getSections()}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between items-center gap-3 border-t pt-4">
                  <div className="flex gap-3">
                    {showApproveButtons && (
                      <>
                        <button
                          type="button"
                          className="rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={async () => {
                            setIsApproving(true);
                            try {
                              await birthRecordsAPI.approveRecord(record.birth_id || record.id);
                              toast.success('Birth record approved successfully');
                              onStatusChange();
                              onClose();
                            } catch (error) {
                              toast.error(error.message || 'Failed to approve record');
                            } finally {
                              setIsApproving(false);
                            }
                          }}
                          disabled={isApproving || isRejecting}
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                          {isApproving ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          type="button"
                          className="rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={async () => {
                            const reason = prompt('Please provide a reason for rejection (optional):');
                            if (reason !== null) {
                              setIsRejecting(true);
                              try {
                                await birthRecordsAPI.rejectRecord(record.birth_id || record.id, reason);
                                toast.success('Birth record rejected');
                                onStatusChange();
                                onClose();
                              } catch (error) {
                                toast.error(error.message || 'Failed to reject record');
                              } finally {
                                setIsRejecting(false);
                              }
                            }
                          }}
                          disabled={isApproving || isRejecting}
                        >
                          <XCircleIcon className="h-5 w-5" />
                          {isRejecting ? 'Rejecting...' : 'Reject'}
                        </button>
                      </>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    className="rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transform hover:-translate-y-0.5 transition-all duration-200"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

ViewBirthRecord.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  record: PropTypes.object
};

export default ViewBirthRecord;