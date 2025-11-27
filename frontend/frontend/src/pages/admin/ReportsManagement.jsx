import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsAPI } from '../../services/api';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const ReportsManagement = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [selectedReport, setSelectedReport] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [feedback, setFeedback] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Utility function to truncate text
  const truncateText = (text, maxLength = 60) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Fetch reports
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['adminReports', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      return await reportsAPI.getReports(params);
    },
  });

  // Review report mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ reportId, status, feedback }) => {
      return await reportsAPI.reviewReport(reportId, { status, feedback });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminReports']);
      toast.success(t('reports.reviewSuccess'));
      setIsReviewModalOpen(false);
      setSelectedReport(null);
      setFeedback('');
    },
    onError: (error) => {
      toast.error(`${t('reports.reviewFailed')}: ${error.message}`);
    }
  });

  const handleViewReport = (report) => {
    setSelectedReport(report);
  };

  const handleReviewClick = (report) => {
    setSelectedReport(report);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedReport) return;
    
    await reviewMutation.mutateAsync({
      reportId: selectedReport._id,
      status: reviewStatus,
      feedback: feedback
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { color: 'gray', icon: ClockIcon, text: t('reports.draft') },
      submitted: { color: 'blue', icon: ClockIcon, text: t('reports.submitted') },
      under_review: { color: 'yellow', icon: ClockIcon, text: t('reports.underReview') },
      approved: { color: 'green', icon: CheckCircleIcon, text: t('reports.approved') },
      rejected: { color: 'red', icon: XCircleIcon, text: t('reports.rejected') }
    };

    const badge = badges[status] || badges.draft;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${badge.color}-100 text-${badge.color}-800`}>
        <Icon className="h-4 w-4 mr-1" />
        {badge.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'gray',
      normal: 'blue',
      high: 'red'
    };
    
    const labels = {
      low: t('reports.low'),
      normal: t('reports.normal'),
      high: t('reports.high')
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded bg-${colors[priority] || 'gray'}-100 text-${colors[priority] || 'gray'}-800`}>
        {labels[priority] || t('reports.normal')}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="ml-4 text-gray-600">{t('reports.loadingReports')}</p>
      </div>
    );
  }

  const reports = reportsData?.reports || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <DocumentTextIcon className="h-8 w-8 text-white" />
                </div>
                {t('reports.title')}
              </h1>
              <p className="text-indigo-100 mt-2 text-lg">
                {t('reports.description')}
              </p>
            </div>
            <div className="text-white text-right">
              <p className="text-3xl font-bold">{reports.length}</p>
              <p className="text-indigo-200">{t('reports.totalReports')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{t('reports.filterByStatus')}:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">{t('reports.allReports')}</option>
              <option value="submitted">{t('reports.submitted')}</option>
              <option value="under_review">{t('reports.underReview')}</option>
              <option value="approved">{t('reports.approved')}</option>
              <option value="rejected">{t('reports.rejected')}</option>
            </select>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {reports.length === 0 ? (
            <div className="text-center py-16">
              <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-900">{t('reports.noReportsFound')}</p>
              <p className="text-gray-500 mt-2">{t('reports.reportsWillAppear')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto shadow-sm rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase w-2/5 min-w-0">{t('reports.tableTitle')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20 hidden sm:table-cell">{t('reports.tableType')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32 hidden md:table-cell">{t('reports.tableSubmittedBy')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24 hidden lg:table-cell">{t('reports.tableDate')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20 hidden xl:table-cell">{t('reports.tablePriority')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">{t('reports.tableStatus')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase w-24">{t('reports.tableActions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report._id} className="hover:bg-indigo-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="group relative">
                          <div className="font-semibold text-gray-900 leading-tight">
                            <span 
                              className="cursor-help hover:text-blue-600 transition-colors"
                              title={report.title}
                            >
                              {truncateText(report.title, 45)}
                            </span>
                          </div>
                          {report.title.length > 45 && (
                            <div className="absolute z-20 invisible group-hover:visible bg-gray-900 text-white text-sm rounded-lg px-4 py-3 mt-2 shadow-xl max-w-md whitespace-normal left-0 top-full">
                              <div className="font-medium mb-1">{t('reports.fullTitle')}:</div>
                              <div className="text-gray-200">{report.title}</div>
                              <div className="absolute -top-2 left-6 w-4 h-4 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </div>
                        {report.summary && (
                          <div className="text-sm text-gray-500 mt-1 leading-tight" title={report.summary}>
                            {truncateText(report.summary, 50)}
                          </div>
                        )}
                        {/* Mobile-only additional info */}
                        <div className="flex flex-wrap gap-2 mt-2 sm:hidden">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {report.report_type}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {report.created_by_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <span className="capitalize text-gray-700">{t(`reports.${report.report_type}`)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 hidden md:table-cell">
                        {report.created_by_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 hidden lg:table-cell">
                        {report.submitted_at ? format(new Date(report.submitted_at), 'MMM dd, yyyy') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                        {getPriorityBadge(report.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(report.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewReport(report)}
                            className="text-blue-600 hover:text-white hover:bg-blue-600 p-2 rounded-lg transition-all duration-200"
                            title={t('reports.viewDetails')}
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          {report.status === 'submitted' && (
                            <button
                              onClick={() => handleReviewClick(report)}
                              className="text-green-600 hover:text-white hover:bg-green-600 p-2 rounded-lg transition-all duration-200"
                              title={t('reports.reviewReport')}
                            >
                              <ChatBubbleLeftRightIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
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
      {selectedReport && !isReviewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedReport.title}</h2>
                  <p className="text-indigo-100 mt-1">{selectedReport.summary}</p>
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
                  <p className="text-sm text-gray-500">{t('reports.reportType')}</p>
                  <p className="font-semibold capitalize">{t(`reports.${selectedReport.report_type}`)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('reports.status')}</p>
                  <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('reports.submittedBy')}</p>
                  <p className="font-semibold">{selectedReport.created_by_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('reports.submittedDate')}</p>
                  <p className="font-semibold">
                    {selectedReport.submitted_at ? format(new Date(selectedReport.submitted_at), 'MMM dd, yyyy HH:mm') : t('reports.notSubmitted')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('reports.dateRange')}</p>
                  <p className="font-semibold">
                    {format(new Date(selectedReport.date_range.start), 'MMM dd, yyyy')} - {format(new Date(selectedReport.date_range.end), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('reports.priority')}</p>
                  <div className="mt-1">{getPriorityBadge(selectedReport.priority)}</div>
                </div>
              </div>

              {/* Report Content */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('reports.reportData')}</h3>
                <div className="bg-indigo-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm"><strong>{t('reports.totalRecords')}:</strong> {selectedReport.content?.totalRecords?.toLocaleString() || 0}</p>
                  <p className="text-sm"><strong>{t('reports.birthRecords')}:</strong> {selectedReport.content?.totalBirths?.toLocaleString() || 0}</p>
                  <p className="text-sm"><strong>{t('reports.deathRecords')}:</strong> {selectedReport.content?.totalDeaths?.toLocaleString() || 0}</p>
                  <p className="text-sm"><strong>{t('reports.marriageRecords')}:</strong> {selectedReport.content?.totalMarriages?.toLocaleString() || 0}</p>
                  <p className="text-sm"><strong>{t('reports.divorceRecords')}:</strong> {selectedReport.content?.totalDivorces?.toLocaleString() || 0}</p>
                  <p className="text-sm"><strong>{t('reports.netPopulationGrowth')}:</strong> +{selectedReport.content?.netGrowth?.toLocaleString() || 0}</p>
                </div>
              </div>

              {/* Feedback */}
              {selectedReport.feedback && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t('reports.adminFeedback')}</h3>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <p className="text-sm text-gray-700">{selectedReport.feedback}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedReport.status === 'submitted' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setIsReviewModalOpen(true);
                      setReviewStatus('approved');
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl"
                  >
                    <CheckCircleIcon className="h-5 w-5 inline mr-2" />
                    {t('reports.approve')}
                  </button>
                  <button
                    onClick={() => {
                      setIsReviewModalOpen(true);
                      setReviewStatus('rejected');
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl"
                  >
                    <XCircleIcon className="h-5 w-5 inline mr-2" />
                    {t('reports.reject')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">{t('reports.reviewReport')}</h2>
              <p className="text-indigo-100 mt-1">{selectedReport.title}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('reports.reviewDecision')}
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setReviewStatus('approved')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                      reviewStatus === 'approved'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <CheckCircleIcon className="h-5 w-5 inline mr-2" />
                    {t('reports.approve')}
                  </button>
                  <button
                    onClick={() => setReviewStatus('rejected')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                      reviewStatus === 'rejected'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <XCircleIcon className="h-5 w-5 inline mr-2" />
                    {t('reports.reject')}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('reports.feedbackOptional')}
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder={t('reports.feedbackPlaceholder')}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsReviewModalOpen(false);
                    setFeedback('');
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl"
                >
                  {t('reports.cancel')}
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={reviewMutation.isPending}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl disabled:opacity-50"
                >
                  {reviewMutation.isPending ? t('reports.submitting') : t('reports.submitReview')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;
