import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsAPI } from '../../services/api';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const MyReports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch my reports
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['myReports', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      return await reportsAPI.getReports(params);
    },
  });

  const getStatusBadge = (status) => {
    const badges = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: ClockIcon, text: 'Draft' },
      submitted: { color: 'bg-blue-100 text-blue-800', icon: ClockIcon, text: 'Submitted' },
      under_review: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'Under Review' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Rejected' }
    };

    const badge = badges[status] || badges.draft;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="h-4 w-4 mr-1" />
        {badge.text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        <p className="ml-4 text-gray-600">Loading your reports...</p>
      </div>
    );
  }

  const reports = reportsData?.reports || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <DocumentTextIcon className="h-8 w-8 text-white" />
                </div>
                My Reports
              </h1>
              <p className="text-purple-100 mt-2 text-lg">
                View your submitted reports and admin feedback
              </p>
            </div>
            <div className="text-white text-right">
              <p className="text-3xl font-bold">{reports.length}</p>
              <p className="text-purple-200">Total Reports</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            >
              <option value="all">All Reports</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {reports.length === 0 ? (
            <div className="text-center py-16">
              <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-900">No reports found</p>
              <p className="text-gray-500 mt-2">Create and submit reports to see them here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feedback</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report._id} className="hover:bg-purple-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{report.title}</div>
                        <div className="text-sm text-gray-500">{report.summary}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="capitalize text-gray-700">{report.report_type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {report.submitted_at ? format(new Date(report.submitted_at), 'MMM dd, yyyy') : 'Not submitted'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(report.status)}
                      </td>
                      <td className="px-6 py-4">
                        {report.feedback ? (
                          <div className="flex items-center text-sm">
                            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1 text-blue-600" />
                            <span className="text-blue-600 font-medium">Has feedback</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No feedback</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="text-blue-600 hover:text-white hover:bg-blue-600 p-2 rounded-lg transition-all duration-200"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedReport.title}</h2>
                  <p className="text-purple-100 mt-1">{selectedReport.summary}</p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Report Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Report Type</p>
                  <p className="font-semibold capitalize">{selectedReport.report_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created Date</p>
                  <p className="font-semibold">
                    {format(new Date(selectedReport.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted Date</p>
                  <p className="font-semibold">
                    {selectedReport.submitted_at 
                      ? format(new Date(selectedReport.submitted_at), 'MMM dd, yyyy HH:mm')
                      : 'Not submitted'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date Range</p>
                  <p className="font-semibold">
                    {format(new Date(selectedReport.date_range.start), 'MMM dd, yyyy')} - {format(new Date(selectedReport.date_range.end), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reviewed Date</p>
                  <p className="font-semibold">
                    {selectedReport.reviewed_at 
                      ? format(new Date(selectedReport.reviewed_at), 'MMM dd, yyyy HH:mm')
                      : 'Not reviewed yet'}
                  </p>
                </div>
              </div>

              {/* Report Content */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Report Data</h3>
                <div className="bg-purple-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm"><strong>Total Records:</strong> {selectedReport.content?.totalRecords?.toLocaleString() || 0}</p>
                  <p className="text-sm"><strong>Birth Records:</strong> {selectedReport.content?.totalBirths?.toLocaleString() || 0}</p>
                  <p className="text-sm"><strong>Death Records:</strong> {selectedReport.content?.totalDeaths?.toLocaleString() || 0}</p>
                  <p className="text-sm"><strong>Marriage Records:</strong> {selectedReport.content?.totalMarriages?.toLocaleString() || 0}</p>
                  <p className="text-sm"><strong>Divorce Records:</strong> {selectedReport.content?.totalDivorces?.toLocaleString() || 0}</p>
                  <p className="text-sm"><strong>Net Population Growth:</strong> +{selectedReport.content?.netGrowth?.toLocaleString() || 0}</p>
                </div>
              </div>

              {/* Admin Feedback - HIGHLIGHTED */}
              {selectedReport.feedback && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 mr-2 text-blue-600" />
                    Admin Feedback
                  </h3>
                  <div className={`border-l-4 p-4 rounded ${
                    selectedReport.status === 'approved' 
                      ? 'bg-green-50 border-green-400' 
                      : 'bg-red-50 border-red-400'
                  }`}>
                    <div className="flex items-start">
                      {selectedReport.status === 'approved' ? (
                        <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                      ) : (
                        <XCircleIcon className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
                      )}
                      <div>
                        <p className={`font-semibold mb-2 ${
                          selectedReport.status === 'approved' ? 'text-green-800' : 'text-red-800'
                        }`}>
                          Report {selectedReport.status === 'approved' ? 'Approved' : 'Rejected'}
                        </p>
                        <p className="text-gray-700">{selectedReport.feedback}</p>
                        {selectedReport.reviewed_at && (
                          <p className="text-sm text-gray-500 mt-2">
                            Reviewed on {format(new Date(selectedReport.reviewed_at), 'MMMM dd, yyyy \'at\' HH:mm')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* No Feedback Message */}
              {!selectedReport.feedback && selectedReport.status === 'submitted' && (
                <div className="border-t pt-6">
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <div className="flex items-center">
                      <ClockIcon className="h-6 w-6 text-blue-600 mr-3" />
                      <div>
                        <p className="font-semibold text-blue-800">Awaiting Admin Review</p>
                        <p className="text-sm text-blue-700 mt-1">Your report has been submitted and is waiting for admin review.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReports;
