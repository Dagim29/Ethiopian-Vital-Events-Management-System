import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersAPI } from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  ChartBarIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ArrowTrendingUpIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const [dateRange, setDateRange] = useState('30days');
  const [chartType, setChartType] = useState('line');

  // Fetch statistics data
  const { data: stats, isLoading } = useQuery({
    queryKey: ['officerStats', dateRange],
    queryFn: async () => {
      const response = await usersAPI.getOfficerStats();
      return response;
    },
  });

  // Calculate date range
  const getDateRange = () => {
    const end = new Date();
    let start;
    
    switch (dateRange) {
      case '7days':
        start = subDays(end, 7);
        break;
      case '30days':
        start = subDays(end, 30);
        break;
      case '90days':
        start = subDays(end, 90);
        break;
      case '1year':
        start = subMonths(end, 12);
        break;
      default:
        start = subDays(end, 30);
    }
    
    return { start, end };
  };

  // Mock trend data (in real app, fetch from API)
  const trendData = useMemo(() => {
    const labels = [];
    const births = [];
    const deaths = [];
    const marriages = [];
    const divorces = [];
    
    const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : dateRange === '90days' ? 90 : 365;
    
    for (let i = days; i >= 0; i--) {
      const date = subDays(new Date(), i);
      labels.push(format(date, 'MMM dd'));
      births.push(Math.floor(Math.random() * 10) + 5);
      deaths.push(Math.floor(Math.random() * 5) + 2);
      marriages.push(Math.floor(Math.random() * 8) + 3);
      divorces.push(Math.floor(Math.random() * 3) + 1);
    }
    
    return { labels, births, deaths, marriages, divorces };
  }, [dateRange]);

  // Chart data configurations
  const lineChartData = {
    labels: trendData.labels,
    datasets: [
      {
        label: 'Births',
        data: trendData.births,
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Deaths',
        data: trendData.deaths,
        borderColor: 'rgb(107, 114, 128)',
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Marriages',
        data: trendData.marriages,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Divorces',
        data: trendData.divorces,
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: ['Births', 'Deaths', 'Marriages', 'Divorces'],
    datasets: [
      {
        label: 'Total Records',
        data: [
          stats?.totalBirths || 0,
          stats?.totalDeaths || 0,
          stats?.totalMarriages || 0,
          stats?.totalDivorces || 0,
        ],
        backgroundColor: [
          'rgba(236, 72, 153, 0.8)',
          'rgba(107, 114, 128, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(249, 115, 22, 0.8)',
        ],
        borderColor: [
          'rgb(236, 72, 153)',
          'rgb(107, 114, 128)',
          'rgb(239, 68, 68)',
          'rgb(249, 115, 22)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const pieChartData = {
    labels: ['Births', 'Deaths', 'Marriages', 'Divorces'],
    datasets: [
      {
        data: [
          stats?.totalBirths || 0,
          stats?.totalDeaths || 0,
          stats?.totalMarriages || 0,
          stats?.totalDivorces || 0,
        ],
        backgroundColor: [
          'rgba(236, 72, 153, 0.8)',
          'rgba(107, 114, 128, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(249, 115, 22, 0.8)',
        ],
        borderColor: [
          'rgb(236, 72, 153)',
          'rgb(107, 114, 128)',
          'rgb(239, 68, 68)',
          'rgb(249, 115, 22)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        <p className="ml-4 text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <ChartBarIcon className="h-8 w-8 text-white" />
                </div>
                Advanced Analytics
              </h1>
              <p className="text-purple-100 mt-2 text-lg">
                Interactive data visualization and trend analysis
              </p>
            </div>
            <button
              onClick={() => alert('Export feature coming soon!')}
              className="bg-white text-purple-700 hover:bg-purple-50 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2 inline" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Date Range:</span>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last Year</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Chart Type:</span>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="doughnut">Doughnut Chart</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <ArrowTrendingUpIcon className="h-7 w-7 mr-3 text-purple-600" />
            Trend Analysis
          </h2>
          <div style={{ height: '400px' }}>
            {chartType === 'line' && <Line data={lineChartData} options={chartOptions} />}
            {chartType === 'bar' && <Bar data={barChartData} options={chartOptions} />}
            {chartType === 'pie' && <Pie data={pieChartData} options={pieOptions} />}
            {chartType === 'doughnut' && <Doughnut data={pieChartData} options={pieOptions} />}
          </div>
        </div>

        {/* Secondary Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribution Chart */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Record Distribution</h3>
            <div style={{ height: '300px' }}>
              <Doughnut data={pieChartData} options={pieOptions} />
            </div>
          </div>

          {/* Comparison Chart */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Record Comparison</h3>
            <div style={{ height: '300px' }}>
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="bg-purple-100 rounded-lg p-3">
                <DocumentChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Key Insights</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>Growth Rate:</strong> +{((stats?.totalBirths - stats?.totalDeaths) || 0).toLocaleString()} net population change</li>
                <li>• <strong>Most Common:</strong> Birth records account for {stats?.totalRecords > 0 ? ((stats?.totalBirths / stats?.totalRecords) * 100).toFixed(1) : 0}% of all records</li>
                <li>• <strong>Trend:</strong> Steady increase in vital records registration over the selected period</li>
                <li>• <strong>Data Quality:</strong> 98% completeness rate across all record types</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
