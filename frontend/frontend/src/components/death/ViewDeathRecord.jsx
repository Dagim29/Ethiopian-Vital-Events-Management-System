import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { format, parseISO, isValid } from 'date-fns';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PhotoIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { deathRecordsAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ViewDeathRecord = ({ isOpen = false, onClose = () => {}, record = {}, onStatusChange = () => {} }) => {
  const { user } = useAuth();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  
  // Check if user can approve/reject
  const canApprove = user && (user.role === 'admin' || user.role === 'vms_officer');
  const showApproveButtons = canApprove && record && record.status && ['draft', 'submitted'].includes(record.status);
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

  const formatFieldName = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const renderField = (key, value) => {
    if (value === null || value === undefined || value === '') {
      value = 'N/A';
    }

    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('dob')) {
      value = formatDate(value);
    }

    return (
      <div key={key} className="py-2 border-b border-gray-100 last:border-0">
        <dt className="text-sm font-medium text-gray-500">{formatFieldName(key)}</dt>
        <dd className="mt-1 text-sm text-gray-900 break-words">
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

  const renderPhotos = () => {
    const photos = [
      { label: 'Deceased Photo', src: record.deceased_photo, icon: '🕊️' }
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

  const getSections = () => {
    if (!record || Object.keys(record).length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No record data available</p>
        </div>
      );
    }

    const sections = {
      'Deceased Information': [
        'deceased_first_name', 'deceased_father_name', 'deceased_grandfather_name',
        'deceased_gender', 'date_of_death', 'time_of_death', 'age_at_death'
      ],
      'Death Details': [
        'cause_of_death', 'place_of_death'
      ],
      'Informant Information': [
        'informant_name', 'informant_relationship', 'informant_phone'
      ],
      'Additional Information': [
        'notes', 'status', 'certificate_number'
      ]
    };

    return Object.entries(sections).map(([title, fields]) => {
      const sectionFields = fields
        .filter(field => record[field] !== undefined && record[field] !== null && record[field] !== '')
        .map(field => renderField(field, record[field]));

      if (sectionFields.length === 0) return null;

      return (
        <div key={title} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-4 py-3 bg-red-50 border-b border-red-200">
            <h3 className="text-base font-medium text-red-800">{title}</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {sectionFields}
          </div>
        </div>
      );
    });
  };

  if (!isOpen) return null;

  console.log('Death Record Data:', record);

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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h2" className="text-xl font-semibold leading-6 text-gray-900 mb-6">
                      Death Record Details
                    </Dialog.Title>
                    
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
                              await deathRecordsAPI.approveRecord(record.death_id || record.id);
                              toast.success('Death record approved successfully');
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
                                await deathRecordsAPI.rejectRecord(record.death_id || record.id, reason);
                                toast.success('Death record rejected');
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
                    className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 border border-gray-300"
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

ViewDeathRecord.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  record: PropTypes.object
};

export default ViewDeathRecord;
