import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersAPI } from '../../services/api';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  ArrowTrendingUpIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ChartPieIcon,
  HeartIcon,
  XCircleIcon,
  ClockIcon,
  CakeIcon,
  FaceFrownIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const StatisticianDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const { data: stats, isLoading, isError, error } = useQuery({
    queryKey: ['officerStats'],
    queryFn: async () => {
      console.log('Fetching statistician stats...');
      const response = await usersAPI.getOfficerStats();
      console.log('Statistician stats response:', response);
      return response;
    },
    onError: (error) => {
      console.error('Error fetching statistician stats:', error);
    },
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        <p className="ml-4 text-gray-600">{t('statistician.loadingStatistics')}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-6 w-6 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">{t('statistician.errorLoadingDashboard')}</h3>
              <p className="text-sm text-red-700 mt-2">
                {error?.message || t('statistician.failedToLoadStatistics')}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                {t('statistician.refreshPage')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ensure stats has default values
  const safeStats = {
    totalRecords: stats?.totalRecords || 0,
    totalBirths: stats?.totalBirths || 0,
    totalDeaths: stats?.totalDeaths || 0,
    totalMarriages: stats?.totalMarriages || 0,
    totalDivorces: stats?.totalDivorces || 0,
    myRecords: stats?.myRecords || 0,
    myBirths: stats?.myBirths || 0,
    myDeaths: stats?.myDeaths || 0,
    myMarriages: stats?.myMarriages || 0,
    myDivorces: stats?.myDivorces || 0,
  };

  console.log('Rendering statistician dashboard with stats:', safeStats);

  const handleExportReport = () => {
    try {
      const currentDate = new Date().toLocaleDateString();
      
      // Summary data
      const summaryData = [
        { 'Metric': t('statistician.totalRecordsLabel'), 'Count': safeStats.totalRecords },
        { 'Metric': t('birth.birthRecords'), 'Count': safeStats.totalBirths },
        { 'Metric': t('death.deathRecords'), 'Count': safeStats.totalDeaths },
        { 'Metric': t('marriage.marriageRecords'), 'Count': safeStats.totalMarriages },
        { 'Metric': t('divorce.divorceRecords'), 'Count': safeStats.totalDivorces },
        { 'Metric': '', 'Count': '' },
        { 'Metric': t('statistician.populationGrowth'), 'Count': safeStats.totalBirths - safeStats.totalDeaths },
      ];

      // Percentage distribution
      const distributionData = [
        { 'Record Type': t('birth.birthRecords'), 'Count': safeStats.totalBirths, 'Percentage': safeStats.totalRecords > 0 ? ((safeStats.totalBirths / safeStats.totalRecords) * 100).toFixed(2) + '%' : '0%' },
        { 'Record Type': t('death.deathRecords'), 'Count': safeStats.totalDeaths, 'Percentage': safeStats.totalRecords > 0 ? ((safeStats.totalDeaths / safeStats.totalRecords) * 100).toFixed(2) + '%' : '0%' },
        { 'Record Type': t('marriage.marriageRecords'), 'Count': safeStats.totalMarriages, 'Percentage': safeStats.totalRecords > 0 ? ((safeStats.totalMarriages / safeStats.totalRecords) * 100).toFixed(2) + '%' : '0%' },
        { 'Record Type': t('divorce.divorceRecords'), 'Count': safeStats.totalDivorces, 'Percentage': safeStats.totalRecords > 0 ? ((safeStats.totalDivorces / safeStats.totalRecords) * 100).toFixed(2) + '%' : '0%' },
      ];

      // Key insights and rates
      const insightsData = [
        { 'Metric': t('statistician.birthRate'), 'Value': safeStats.totalRecords > 0 ? ((safeStats.totalBirths / safeStats.totalRecords) * 1000).toFixed(1) : 0, 'Unit': t('statistician.per1000Records') },
        { 'Metric': t('statistician.deathRate'), 'Value': safeStats.totalRecords > 0 ? ((safeStats.totalDeaths / safeStats.totalRecords) * 1000).toFixed(1) : 0, 'Unit': t('statistician.per1000Records') },
        { 'Metric': t('statistician.marriageRate'), 'Value': safeStats.totalRecords > 0 ? ((safeStats.totalMarriages / safeStats.totalRecords) * 1000).toFixed(1) : 0, 'Unit': t('statistician.per1000Records') },
        { 'Metric': t('statistician.divorceRate'), 'Value': safeStats.totalRecords > 0 ? ((safeStats.totalDivorces / safeStats.totalRecords) * 1000).toFixed(1) : 0, 'Unit': t('statistician.per1000Records') },
        { 'Metric': '', 'Value': '', 'Unit': '' },
        { 'Metric': t('statistician.netGrowth'), 'Value': safeStats.totalBirths - safeStats.totalDeaths, 'Unit': t('statistician.records') },
        { 'Metric': t('statistician.growthRate'), 'Value': safeStats.totalRecords > 0 ? (((safeStats.totalBirths - safeStats.totalDeaths) / safeStats.totalRecords) * 100).toFixed(2) : 0, 'Unit': '%' },
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Add summary sheet
      const ws1 = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Summary');
      
      // Add distribution sheet
      const ws2 = XLSX.utils.json_to_sheet(distributionData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Distribution');
      
      // Add insights sheet
      const ws3 = XLSX.utils.json_to_sheet(insightsData);
      XLSX.utils.book_append_sheet(wb, ws3, t('statistician.keyInsights'));

      // Generate filename
      const filename = `Statistician_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Export
      XLSX.writeFile(wb, filename);
      
      toast.success(t('statistician.reportExportedSuccessfully'));
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error(t('statistician.failedToExportReport'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <ChartPieIcon className="h-8 w-8 text-white" />
                </div>
                {t('statistician.title')}
              </h1>
              <p className="text-purple-100 mt-2 text-lg">
                {t('statistician.description')} • {safeStats.totalRecords.toLocaleString()} {t('statistician.totalRecordsLabel')}
              </p>
            </div>
            <button
              onClick={handleExportReport}
              className="bg-white text-purple-700 hover:bg-purple-50 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2 inline" />
              {t('statistician.exportReport')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
        {/* Main Stats Overview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">{t('statistician.totalRecordsLabel')}</p>
                <p className="text-4xl font-bold mt-2">{safeStats.totalRecords.toLocaleString()}</p>
                <p className="text-purple-100 text-xs mt-2">{t('statistician.allVitalRecords')}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <DocumentTextIcon className="h-10 w-10" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm font-medium uppercase tracking-wide">{t('birth.birthRecords')}</p>
                <p className="text-4xl font-bold mt-2">{safeStats.totalBirths.toLocaleString()}</p>
                <p className="text-pink-100 text-xs mt-2">{safeStats.totalRecords > 0 ? ((safeStats.totalBirths / safeStats.totalRecords) * 100).toFixed(1) : 0}% {t('statistician.ofTotal')}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <CakeIcon className="h-10 w-10" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm font-medium uppercase tracking-wide">{t('death.deathRecords')}</p>
                <p className="text-4xl font-bold mt-2">{safeStats.totalDeaths.toLocaleString()}</p>
                <p className="text-gray-100 text-xs mt-2">{safeStats.totalRecords > 0 ? ((safeStats.totalDeaths / safeStats.totalRecords) * 100).toFixed(1) : 0}% {t('statistician.ofTotal')}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <FaceFrownIcon className="h-10 w-10" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium uppercase tracking-wide">{t('marriage.marriageRecords')}</p>
                <p className="text-4xl font-bold mt-2">{safeStats.totalMarriages.toLocaleString()}</p>
                <p className="text-red-100 text-xs mt-2">{safeStats.totalRecords > 0 ? ((safeStats.totalMarriages / safeStats.totalRecords) * 100).toFixed(1) : 0}% {t('statistician.ofTotal')}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <HeartIcon className="h-10 w-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-xl shadow-lg p-5 border-2 border-orange-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{t('divorce.divorceRecords')}</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{safeStats.totalDivorces.toLocaleString()}</p>
              </div>
              <XCircleIcon className="h-10 w-10 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-5 border-2 border-blue-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{t('statistician.regionTotal')}</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{safeStats.totalRecords.toLocaleString()}</p>
              </div>
              <ChartBarIcon className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-5 border-2 border-green-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{t('statistician.growthRate')}</p>
                <p className="text-3xl font-bold text-green-600 mt-1">+{(safeStats.totalBirths - safeStats.totalDeaths).toLocaleString()}</p>
              </div>
              <ArrowTrendingUpIcon className="h-10 w-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-5 border-2 border-indigo-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{t('statistician.dataQuality')}</p>
                <p className="text-3xl font-bold text-indigo-600 mt-1">98%</p>
              </div>
              <ChartBarIcon className="h-10 w-10 text-indigo-500" />
            </div>
          </div>
        </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Record Type Distribution */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-purple-600" />
            {t('statistician.recordTypeDistribution')}
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{t('birth.birthRecords')}</span>
                <span className="text-sm font-medium text-gray-900">{safeStats.totalBirths}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${safeStats.totalRecords > 0 ? (safeStats.totalBirths / safeStats.totalRecords) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{t('death.deathRecords')}</span>
                <span className="text-sm font-medium text-gray-900">{safeStats.totalDeaths}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-red-500 h-2.5 rounded-full" 
                  style={{ width: `${safeStats.totalRecords > 0 ? (safeStats.totalDeaths / safeStats.totalRecords) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{t('marriage.marriageRecords')}</span>
                <span className="text-sm font-medium text-gray-900">{safeStats.totalMarriages}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-pink-500 h-2.5 rounded-full" 
                  style={{ width: `${safeStats.totalRecords > 0 ? (safeStats.totalMarriages / safeStats.totalRecords) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{t('divorce.divorceRecords')}</span>
                <span className="text-sm font-medium text-gray-900">{safeStats.totalDivorces}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-orange-500 h-2.5 rounded-full" 
                  style={{ width: `${safeStats.totalRecords > 0 ? (safeStats.totalDivorces / safeStats.totalRecords) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Key Insights */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartPieIcon className="h-6 w-6 mr-2 text-indigo-600" />
            {t('statistician.keyInsights')}
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border-l-4 border-green-500">
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase">{t('statistician.birthRate')}</span>
                <p className="text-sm text-gray-600 mt-1">{t('birth.births')} {t('statistician.per1000Records')}</p>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {safeStats.totalRecords > 0 ? ((safeStats.totalBirths / safeStats.totalRecords) * 1000).toFixed(1) : 0}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border-l-4 border-red-500">
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase">{t('statistician.deathRate')}</span>
                <p className="text-sm text-gray-600 mt-1">{t('death.deaths')} {t('statistician.per1000Records')}</p>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {safeStats.totalRecords > 0 ? ((safeStats.totalDeaths / safeStats.totalRecords) * 1000).toFixed(1) : 0}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border-l-4 border-pink-500">
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase">{t('statistician.marriageRate')}</span>
                <p className="text-sm text-gray-600 mt-1">{t('marriage.marriages')} {t('statistician.per1000Records')}</p>
              </div>
              <span className="text-2xl font-bold text-pink-600">
                {safeStats.totalRecords > 0 ? ((safeStats.totalMarriages / safeStats.totalRecords) * 1000).toFixed(1) : 0}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-md text-white">
              <div>
                <span className="text-xs font-medium uppercase">{t('statistician.netGrowth')}</span>
                <p className="text-xs mt-1 opacity-90">{t('statistician.populationChange')}</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold">
                  {safeStats.totalBirths - safeStats.totalDeaths > 0 ? '+' : ''}{(safeStats.totalBirths - safeStats.totalDeaths).toLocaleString()}
                </span>
                <p className="text-xs opacity-90 mt-1">
                  {safeStats.totalRecords > 0 ? (((safeStats.totalBirths - safeStats.totalDeaths) / safeStats.totalRecords) * 100).toFixed(1) : 0}% {t('statistician.change')}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

        {/* Advanced Features */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <ChartBarIcon className="h-7 w-7 mr-3 text-purple-600" />
            {t('statistician.advancedAnalytics')}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => navigate('/statistician/analytics')}
              className="group relative inline-flex items-center justify-center px-6 py-6 border-2 border-indigo-300 text-base font-semibold rounded-xl shadow-lg text-indigo-700 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-600 hover:to-indigo-700 hover:text-white hover:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
            >
              <ChartBarIcon className="h-8 w-8 mr-3" />
              <div className="text-left">
                <div>{t('statistician.interactiveAnalytics')}</div>
                <div className="text-xs opacity-80">{t('statistician.chartsVisualizations')}</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => navigate('/statistician/reports')}
              className="group relative inline-flex items-center justify-center px-6 py-6 border-2 border-purple-300 text-base font-semibold rounded-xl shadow-lg text-purple-700 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-600 hover:to-purple-700 hover:text-white hover:border-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-105"
            >
              <DocumentTextIcon className="h-8 w-8 mr-3" />
              <div className="text-left">
                <div>{t('statistician.generateReports')}</div>
                <div className="text-xs opacity-80">{t('statistician.pdfExcelExport')}</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => navigate('/statistician/my-reports')}
              className="group relative inline-flex items-center justify-center px-6 py-6 border-2 border-green-300 text-base font-semibold rounded-xl shadow-lg text-green-700 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-600 hover:to-green-700 hover:text-white hover:border-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105"
            >
              <EyeIcon className="h-8 w-8 mr-3" />
              <div className="text-left">
                <div>{t('statistician.myReports')}</div>
                <div className="text-xs opacity-80">{t('statistician.viewAdminFeedback')}</div>
              </div>
            </button>
          </div>
        </div>

        {/* Quick Access - View Only */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <EyeIcon className="h-7 w-7 mr-3 text-purple-600" />
            {t('statistician.quickAccess')}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => navigate('/births')}
              className="group relative inline-flex items-center justify-center px-6 py-4 border-2 border-pink-300 text-sm font-semibold rounded-xl shadow-md text-pink-700 bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-600 hover:to-pink-700 hover:text-white hover:border-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-200 transform hover:scale-105"
            >
              <CakeIcon className="h-6 w-6 mr-2" />
              {t('birth.birthRecords')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/deaths')}
              className="group relative inline-flex items-center justify-center px-6 py-4 border-2 border-gray-300 text-sm font-semibold rounded-xl shadow-md text-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-600 hover:to-gray-700 hover:text-white hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 transform hover:scale-105"
            >
              <FaceFrownIcon className="h-6 w-6 mr-2" />
              {t('death.deathRecords')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/marriages')}
              className="group relative inline-flex items-center justify-center px-6 py-4 border-2 border-red-300 text-sm font-semibold rounded-xl shadow-md text-red-700 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-600 hover:to-red-700 hover:text-white hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105"
            >
              <HeartIcon className="h-6 w-6 mr-2" />
              {t('marriage.marriageRecords')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/divorces')}
              className="group relative inline-flex items-center justify-center px-6 py-4 border-2 border-orange-300 text-sm font-semibold rounded-xl shadow-md text-orange-700 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-600 hover:to-orange-700 hover:text-white hover:border-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 transform hover:scale-105"
            >
              <XCircleIcon className="h-6 w-6 mr-2" />
              {t('divorce.divorceRecords')}
            </button>
          </div>
        </div>

        {/* Access Note */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="bg-purple-100 rounded-lg p-3">
                <ChartPieIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('statistician.statisticianRole')}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong className="text-purple-700">{t('statistician.yourPermissions')}:</strong> {t('statistician.permissionsText')}
              </p>
              <div className="mt-3 flex items-center text-xs text-gray-600">
                <ClockIcon className="h-4 w-4 mr-1" />
                {t('statistician.lastUpdated')}: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticianDashboard;
