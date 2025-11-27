import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { auditLogsAPI } from '../../services/api';
import { ClockIcon, UserIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const AuditHistory = ({ recordType, recordId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (recordType && recordId) {
      fetchAuditHistory();
    }
  }, [recordType, recordId]);

  const fetchAuditHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching audit history for:', recordType, recordId);
      const response = await auditLogsAPI.getRecordHistory(recordType, recordId);
      console.log('Audit history response:', response);
      setLogs(response.audit_logs || []);
      console.log('Audit logs set:', response.audit_logs);
    } catch (err) {
      console.error('Error fetching audit history:', err);
      setError('Failed to load audit history');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    const colors = {
      create: 'text-green-600 bg-green-50',
      update: 'text-blue-600 bg-blue-50',
      approve: 'text-green-600 bg-green-50',
      reject: 'text-red-600 bg-red-50',
      delete: 'text-red-600 bg-red-50',
      status_change: 'text-yellow-600 bg-yellow-50',
    };
    return colors[action] || 'text-gray-600 bg-gray-50';
  };

  const getActionIcon = (action) => {
    const icons = {
      create: '➕',
      update: '✏️',
      approve: '✅',
      reject: '❌',
      delete: '🗑️',
      status_change: '🔄',
    };
    return icons[action] || '📝';
  };

  const getActionLabel = (action) => {
    const labels = {
      create: 'Created',
      update: 'Updated',
      approve: 'Approved',
      reject: 'Rejected',
      delete: 'Deleted',
      status_change: 'Status Changed',
    };
    return labels[action] || action;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>No audit history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <ClockIcon className="h-5 w-5 mr-2 text-teal-600" />
        Audit History
      </h3>
      
      <div className="flow-root">
        <ul className="-mb-8">
          {logs.map((log, index) => (
            <li key={log._id}>
              <div className="relative pb-8">
                {index !== logs.length - 1 && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getActionColor(log.action)}`}>
                      <span className="text-sm">{getActionIcon(log.action)}</span>
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{log.user_name}</span>
                        {' '}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                          {getActionLabel(log.action)}
                        </span>
                      </p>
                      {log.details && (
                        <p className="mt-1 text-sm text-gray-600">{log.details}</p>
                      )}
                      {log.user_role && (
                        <p className="mt-1 text-xs text-gray-500 flex items-center">
                          <UserIcon className="h-3 w-3 mr-1" />
                          {log.user_role}
                        </p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      <time dateTime={log.timestamp}>
                        {format(new Date(log.timestamp), 'MMM d, yyyy')}
                        <br />
                        <span className="text-xs">{format(new Date(log.timestamp), 'h:mm a')}</span>
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

AuditHistory.propTypes = {
  recordType: PropTypes.string.isRequired,
  recordId: PropTypes.string.isRequired,
};

export default AuditHistory;
