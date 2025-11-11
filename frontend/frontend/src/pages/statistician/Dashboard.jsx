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

const StatisticianDashboard = () => {
  const navigate = useNavigate();
  
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
        <p className="ml-4 text-gray-600">Loading statistics...</p>
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
              <h3 className="text-lg font-medium text-red-800">Error Loading Dashboard</h3>
              <p className="text-sm text-red-700 mt-2">
                {error?.message || 'Failed to load statistics. Please try refreshing the page.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Refresh Page
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
        { 'Metric': 'Total Records', 'Count': safeStats.totalRecords },
        { 'Metric': 'Birth Records', 'Count': safeStats.totalBirths },
        { 'Metric': 'Death Records', 'Count': safeStats.totalDeaths },
        { 'Metric': 'Marriage Records', 'Count': safeStats.totalMarriages },
        { 'Metric': 'Divorce Records', 'Count': safeStats.totalDivorces },
        { 'Metric': '', 'Count': '' },
        { 'Metric': 'Population Growth', 'Count': safeStats.totalBirths - safeStats.totalDeaths },
      ];

      // Percentage distribution
      const distributionData = [
        { 'Record Type': 'Birth Records', 'Count': safeStats.totalBirths, 'Percentage': safeStats.totalRecords > 0 ? ((safeStats.totalBirths / safeStats.totalRecords) * 100).toFixed(2) + '%' : '0%' },
        { 'Record Type': 'Death Records', 'Count': safeStats.totalDeaths, 'Percentage': safeStats.totalRecords > 0 ? ((safeStats.totalDeaths / safeStats.totalRecords) * 100).toFixed(2) + '%' : '0%' },
        { 'Record Type': 'Marriage Records', 'Count': safeStats.totalMarriages, 'Percentage': safeStats.totalRecords > 0 ? ((safeStats.totalMarriages / safeStats.totalRecords) * 100).toFixed(2) + '%' : '0%' },
        { 'Record Type': 'Divorce Records', 'Count': safeStats.totalDivorces, 'Percentage': safeStats.totalRecords > 0 ? ((safeStats.totalDivorces / safeStats.totalRecords) * 100).toFixed(2) + '%' : '0%' },
      ];

      // Key insights and rates
      const insightsData = [
        { 'Metric': 'Birth Rate', 'Value': safeStats.totalRecords > 0 ? ((safeStats.totalBirths / safeStats.totalRecords) * 1000).toFixed(1) : 0, 'Unit': 'per 1000 records' },
        { 'Metric': 'Death Rate', 'Value': safeStats.totalRecords > 0 ? ((safeStats.totalDeaths / safeStats.totalRecords) * 1000).toFixed(1) : 0, 'Unit': 'per 1000 records' },
        { 'Metric': 'Marriage Rate', 'Value': safeStats.totalRecords > 0 ? ((safeStats.totalMarriages / safeStats.totalRecords) * 1000).toFixed(1) : 0, 'Unit': 'per 1000 records' },
        { 'Metric': 'Divorce Rate', 'Value': safeStats.totalRecords > 0 ? ((safeStats.totalDivorces / safeStats.totalRecords) * 1000).toFixed(1) : 0, 'Unit': 'per 1000 records' },
        { 'Metric': '', 'Value': '', 'Unit': '' },
        { 'Metric': 'Net Population Growth', 'Value': safeStats.totalBirths - safeStats.totalDeaths, 'Unit': 'records' },
        { 'Metric': 'Growth Rate', 'Value': safeStats.totalRecords > 0 ? (((safeStats.totalBirths - safeStats.totalDeaths) / safeStats.totalRecords) * 100).toFixed(2) : 0, 'Unit': '%' },
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
      XLSX.utils.book_append_sheet(wb, ws3, 'Key Insights');

      // Generate filename
      const filename = `Statistician_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Export
      XLSX.writeFile(wb, filename);
      
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report. Please try again.');
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
                Statistician Dashboard
              </h1>
              <p className="text-purple-100 mt-2 text-lg">
                Analytics & Statistical Analysis • {safeStats.totalRecords.toLocaleString()} Total Records
              </p>
            </div>
            <button
              onClick={handleExportReport}
              className="bg-white text-purple-700 hover:bg-purple-50 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2 inline" />
              Export Report
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
                <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">Total Records</p>
                <p className="text-4xl font-bold mt-2">{safeStats.totalRecords.toLocaleString()}</p>
                <p className="text-purple-100 text-xs mt-2">All vital records</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <DocumentTextIcon className="h-10 w-10" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm font-medium uppercase tracking-wide">Birth Records</p>
                <p className="text-4xl font-bold mt-2">{safeStats.totalBirths.toLocaleString()}</p>
                <p className="text-pink-100 text-xs mt-2">{safeStats.totalRecords > 0 ? ((safeStats.totalBirths / safeStats.totalRecords) * 100).toFixed(1) : 0}% of total</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <CakeIcon className="h-10 w-10" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm font-medium uppercase tracking-wide">Death Records</p>
                <p className="text-4xl font-bold mt-2">{safeStats.totalDeaths.toLocaleString()}</p>
                <p className="text-gray-100 text-xs mt-2">{safeStats.totalRecords > 0 ? ((safeStats.totalDeaths / safeStats.totalRecords) * 100).toFixed(1) : 0}% of total</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <FaceFrownIcon className="h-10 w-10" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium uppercase tracking-wide">Marriage Records</p>
                <p className="text-4xl font-bold mt-2">{safeStats.totalMarriages.toLocaleString()}</p>
                <p className="text-red-100 text-xs mt-2">{safeStats.totalRecords > 0 ? ((safeStats.totalMarriages / safeStats.totalRecords) * 100).toFixed(1) : 0}% of total</p>
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
                <p className="text-gray-600 text-sm font-medium">Divorce Records</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{safeStats.totalDivorces.toLocaleString()}</p>
              </div>
              <XCircleIcon className="h-10 w-10 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-5 border-2 border-blue-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Region Total</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{safeStats.totalRecords.toLocaleString()}</p>
              </div>
              <ChartBarIcon className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-5 border-2 border-green-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Growth Rate</p>
                <p className="text-3xl font-bold text-green-600 mt-1">+{(safeStats.totalBirths - safeStats.totalDeaths).toLocaleString()}</p>
              </div>
              <ArrowTrendingUpIcon className="h-10 w-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-5 border-2 border-indigo-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Data Quality</p>
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
            Record Type Distribution
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Birth Records</span>
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
                <span className="text-sm font-medium text-gray-700">Death Records</span>
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
                <span className="text-sm font-medium text-gray-700">Marriage Records</span>
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
                <span className="text-sm font-medium text-gray-700">Divorce Records</span>
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
            Key Insights & Metrics
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border-l-4 border-green-500">
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase">Birth Rate</span>
                <p className="text-sm text-gray-600 mt-1">Births per 1000 records</p>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {safeStats.totalRecords > 0 ? ((safeStats.totalBirths / safeStats.totalRecords) * 1000).toFixed(1) : 0}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border-l-4 border-red-500">
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase">Death Rate</span>
                <p className="text-sm text-gray-600 mt-1">Deaths per 1000 records</p>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {safeStats.totalRecords > 0 ? ((safeStats.totalDeaths / safeStats.totalRecords) * 1000).toFixed(1) : 0}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border-l-4 border-pink-500">
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase">Marriage Rate</span>
                <p className="text-sm text-gray-600 mt-1">Marriages per 1000 records</p>
              </div>
              <span className="text-2xl font-bold text-pink-600">
                {safeStats.totalRecords > 0 ? ((safeStats.totalMarriages / safeStats.totalRecords) * 1000).toFixed(1) : 0}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-md text-white">
              <div>
                <span className="text-xs font-medium uppercase">Net Growth</span>
                <p className="text-xs mt-1 opacity-90">Population change</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold">
                  {safeStats.totalBirths - safeStats.totalDeaths > 0 ? '+' : ''}{(safeStats.totalBirths - safeStats.totalDeaths).toLocaleString()}
                </span>
                <p className="text-xs opacity-90 mt-1">
                  {safeStats.totalRecords > 0 ? (((safeStats.totalBirths - safeStats.totalDeaths) / safeStats.totalRecords) * 100).toFixed(1) : 0}% change
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
            Advanced Analytics & Reports
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => navigate('/statistician/analytics')}
              className="group relative inline-flex items-center justify-center px-6 py-6 border-2 border-indigo-300 text-base font-semibold rounded-xl shadow-lg text-indigo-700 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-600 hover:to-indigo-700 hover:text-white hover:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
            >
              <ChartBarIcon className="h-8 w-8 mr-3" />
              <div className="text-left">
                <div>Interactive Analytics</div>
                <div className="text-xs opacity-80">Charts & Visualizations</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => navigate('/statistician/reports')}
              className="group relative inline-flex items-center justify-center px-6 py-6 border-2 border-purple-300 text-base font-semibold rounded-xl shadow-lg text-purple-700 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-600 hover:to-purple-700 hover:text-white hover:border-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-105"
            >
              <DocumentTextIcon className="h-8 w-8 mr-3" />
              <div className="text-left">
                <div>Generate Reports</div>
                <div className="text-xs opacity-80">PDF & Excel Export</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => navigate('/statistician/my-reports')}
              className="group relative inline-flex items-center justify-center px-6 py-6 border-2 border-green-300 text-base font-semibold rounded-xl shadow-lg text-green-700 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-600 hover:to-green-700 hover:text-white hover:border-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105"
            >
              <EyeIcon className="h-8 w-8 mr-3" />
              <div className="text-left">
                <div>My Reports</div>
                <div className="text-xs opacity-80">View Admin Feedback</div>
              </div>
            </button>
          </div>
        </div>

        {/* Quick Access - View Only */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <EyeIcon className="h-7 w-7 mr-3 text-purple-600" />
            Quick Access - View Records
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => navigate('/births')}
              className="group relative inline-flex items-center justify-center px-6 py-4 border-2 border-pink-300 text-sm font-semibold rounded-xl shadow-md text-pink-700 bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-600 hover:to-pink-700 hover:text-white hover:border-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-200 transform hover:scale-105"
            >
              <CakeIcon className="h-6 w-6 mr-2" />
              Birth Records
            </button>
            <button
              type="button"
              onClick={() => navigate('/deaths')}
              className="group relative inline-flex items-center justify-center px-6 py-4 border-2 border-gray-300 text-sm font-semibold rounded-xl shadow-md text-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-600 hover:to-gray-700 hover:text-white hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 transform hover:scale-105"
            >
              <FaceFrownIcon className="h-6 w-6 mr-2" />
              Death Records
            </button>
            <button
              type="button"
              onClick={() => navigate('/marriages')}
              className="group relative inline-flex items-center justify-center px-6 py-4 border-2 border-red-300 text-sm font-semibold rounded-xl shadow-md text-red-700 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-600 hover:to-red-700 hover:text-white hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105"
            >
              <HeartIcon className="h-6 w-6 mr-2" />
              Marriage Records
            </button>
            <button
              type="button"
              onClick={() => navigate('/divorces')}
              className="group relative inline-flex items-center justify-center px-6 py-4 border-2 border-orange-300 text-sm font-semibold rounded-xl shadow-md text-orange-700 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-600 hover:to-orange-700 hover:text-white hover:border-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 transform hover:scale-105"
            >
              <XCircleIcon className="h-6 w-6 mr-2" />
              Divorce Records
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
              <h3 className="text-lg font-bold text-gray-900 mb-2">Statistician Role - View Only Access</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong className="text-purple-700">Your Permissions:</strong> You have read-only access to all vital records for statistical analysis and reporting purposes. 
                You can view, analyze, and export data but cannot create, edit, or delete records. User management features are restricted to administrators.
              </p>
              <div className="mt-3 flex items-center text-xs text-gray-600">
                <ClockIcon className="h-4 w-4 mr-1" />
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticianDashboard;
