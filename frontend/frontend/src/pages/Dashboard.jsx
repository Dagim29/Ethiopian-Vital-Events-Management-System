import React, { useState, useEffect, Fragment } from 'react';
import { 
  UserGroupIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  CalendarIcon,
  PlusIcon,
  EyeIcon,
  ArrowPathIcon,
  UserIcon,
  HomeIcon,
  HeartIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { birthRecordsAPI, deathRecordsAPI, marriageRecordsAPI, divorceRecordsAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import AdminDashboard from './admin/Dashboard';
import VMSOfficerDashboard from './vms-officer/Dashboard';
import StatisticianDashboard from './statistician/Dashboard';
import ClerkDashboard from './clerk/Dashboard';

// Custom Card Component
const StatCard = ({ title, value, icon: Icon, iconBg, trend, trendText, to }) => {
  return (
    <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`flex-shrink-0 rounded-xl p-3 ${iconBg} shadow-md`}>
              <Icon className="h-7 w-7 text-white" aria-hidden="true" />
            </div>
            <div>
              <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</dt>
              <dd className="flex items-baseline mt-1">
                <div className="text-3xl font-bold text-gray-900">{value}</div>
                {trend && (
                  <div className={`ml-3 flex items-center text-sm font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {trend > 0 ? (
                      <span>↑</span>
                    ) : (
                      <span>↓</span>
                    )}
                    <span className="ml-1">{Math.abs(trend)}%</span>
                  </div>
                )}
              </dd>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-t border-gray-200">
        <div className="text-sm">
          <Link to={to} className="font-semibold text-ethiopia-blue hover:text-ethiopia-green transition-colors duration-200 flex items-center group">
            View all
            <svg className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Activity Item Component
const ActivityItem = ({ type, record, date, icon: Icon, iconBg, to }) => {
  const getRecordTitle = () => {
    if (type === 'birth') return `New Birth: ${record.childName || 'Unknown'}`;
    if (type === 'death') return `Death Record: ${record.deceasedName || 'Unknown'}`;
    if (type === 'marriage') return `Marriage: ${record.husbandName} & ${record.wifeName}`;
    if (type === 'divorce') return `Divorce Record #${record.caseNumber || ''}`;
    return 'New Record';
  };

  return (
    <li className="py-4">
      <div className="flex items-center space-x-4">
        <div className={`flex-shrink-0 rounded-full p-2 ${iconBg}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            <Link to={to} className="hover:text-ethiopia-blue">
              {getRecordTitle()}
            </Link>
          </p>
          <p className="text-sm text-gray-500">
            {format(new Date(date), 'MMM d, yyyy')}
          </p>
        </div>
        <div>
          <Link
            to={to}
            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ethiopia-yellow"
          >
            View
          </Link>
        </div>
      </div>
    </li>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  
  // Route to appropriate dashboard based on user role
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  
  if (user?.role === 'vms_officer') {
    return <VMSOfficerDashboard />;
  }
  
  if (user?.role === 'statistician') {
    return <StatisticianDashboard />;
  }
  
  if (user?.role === 'clerk') {
    return <ClerkDashboard />;
  }
  
  const [stats, setStats] = useState({
    totalBirths: 0,
    totalDeaths: 0,
    totalMarriages: 0,
    totalDivorces: 0,
    recentBirths: [],
    recentDeaths: [],
    recentMarriages: [],
    recentDivorces: [],
    monthlyTrend: {
      births: 5.3,
      deaths: -2.1,
      marriages: 3.7,
      divorces: 1.2
    }
  });
  const [loading, setLoading] = useState(true);
  
  // Mock data for demonstration
  const mockData = {
    totalBirths: 1,//248,
    totalDeaths: 1,//189,
    totalMarriages: 1,//143,
    totalDivorces: 1,//67,
    recentBirths: [
      { id: 1, childName: 'Alemayehu Kebede', date: '2023-10-15' },
      { id: 2, childName: 'Selamawit Assefa', date: '2023-10-14' },
    ],
    recentDeaths: [
      { id: 1, deceasedName: 'Kebede Hailu', date: '2023-10-12' },
      { id: 2, deceasedName: 'Aster Demisse', date: '2023-10-10' },
    ],
    recentMarriages: [
      { id: 1, husbandName: 'Yonas Tesfaye', wifeName: 'Marta Girma', date: '2023-10-08' },
    ],
    recentDivorces: [
      { id: 1, caseNumber: 'DIV-2023-045', date: '2023-10-05' },
    ]
  };

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    const fetchDashboardData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, you would use the actual API calls:
        // const [births, deaths, marriages, divorces] = await Promise.all([
        //   birthRecordsAPI.getStats(),
        //   deathRecordsAPI.getStats(),
        //   marriageRecordsAPI.getStats(),
        //   divorceRecordsAPI.getStats()
        // ]);
        
        // For now, using mock data
        setStats(prev => ({
          ...prev,
          ...mockData
        }));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all record types in parallel
      const [birthsResponse, deathsResponse, marriagesResponse, divorcesResponse] = await Promise.all([
        birthRecordsAPI.getRecords({ page: 1, per_page: 5 }),
        deathRecordsAPI.getRecords({ page: 1, per_page: 5 }),
        marriageRecordsAPI.getRecords({ page: 1, per_page: 5 }),
        divorceRecordsAPI.getRecords({ page: 1, per_page: 5 }),
      ]);

      setStats({
        totalBirths: birthsResponse.total || 0,
        totalDeaths: deathsResponse.total || 0,
        totalMarriages: marriagesResponse.total || 0,
        totalDivorces: divorcesResponse.total || 0,
        recentBirths: birthsResponse.birth_records || [],
        recentDeaths: deathsResponse.death_records || [],
        recentMarriages: marriagesResponse.marriage_records || [],
        recentDivorces: divorcesResponse.divorce_records || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Birth Records',
      value: stats.totalBirths,
      icon: UserGroupIcon,
      color: 'from-success-500 to-success-600',
      bgColor: 'bg-success-50',
      textColor: 'text-success-600',
      records: stats.recentBirths,
    },
    {
      title: 'Death Records',
      value: stats.totalDeaths,
      icon: DocumentTextIcon,
      color: 'from-danger-500 to-danger-600',
      bgColor: 'bg-danger-50',
      textColor: 'text-danger-600',
      records: stats.recentDeaths,
    },
    {
      title: 'Marriage Records',
      value: stats.totalMarriages,
      icon: ChartBarIcon,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-600',
      records: stats.recentMarriages,
    },
    {
      title: 'Divorce Records',
      value: stats.totalDivorces,
      icon: CalendarIcon,
      color: 'from-warning-500 to-warning-600',
      bgColor: 'bg-warning-50',
      textColor: 'text-warning-600',
      records: stats.recentDivorces,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 text-ethiopia-yellow animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Combine all recent activities and sort by date
  const allActivities = [
    ...stats.recentBirths.map(item => ({ ...item, type: 'birth' })),
    ...stats.recentDeaths.map(item => ({ ...item, type: 'death' })),
    ...stats.recentMarriages.map(item => ({ ...item, type: 'marriage' })),
    ...stats.recentDivorces.map(item => ({ ...item, type: 'divorce' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋</h1>
            <p className="mt-2 text-blue-100 text-lg">Here's what's happening with your records today.</p>
          </div>
          <div className="mt-4 flex space-x-3 md:mt-0">
            <Link
              to="/births/new"
              className="inline-flex items-center px-6 py-3 border-2 border-white text-sm font-semibold rounded-lg shadow-lg text-white bg-transparent hover:bg-white hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Record
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Births"
          value={stats.totalBirths.toLocaleString()}
          icon={UserGroupIcon}
          iconBg="bg-ethiopia-blue"
          trend={stats.monthlyTrend.births}
          to="/births"
        />
        
        <StatCard
          title="Total Deaths"
          value={stats.totalDeaths.toLocaleString()}
          icon={DocumentTextIcon}
          iconBg="bg-ethiopia-red"
          trend={stats.monthlyTrend.deaths}
          to="/deaths"
        />
        
        <StatCard
          title="Total Marriages"
          value={stats.totalMarriages.toLocaleString()}
          icon={HeartIcon}
          iconBg="bg-ethiopia-yellow"
          trend={stats.monthlyTrend.marriages}
          to="/marriages"
        />
        
        <StatCard
          title="Total Divorces"
          value={stats.totalDivorces.toLocaleString()}
          icon={ScaleIcon}
          iconBg="bg-ethiopia-green"
          trend={stats.monthlyTrend.divorces}
          to="/divorces"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-lg overflow-hidden rounded-xl border border-gray-200">
            <div className="px-6 py-5 sm:px-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <h3 className="text-xl font-bold leading-6 text-gray-900">Recent Activities</h3>
              <p className="mt-1 text-sm text-gray-600">Latest records across all categories</p>
            </div>
            <div className="bg-white overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {allActivities.length > 0 ? (
                  allActivities.map((activity) => {
                    const props = {
                      type: activity.type,
                      record: activity,
                      date: activity.date,
                      to: `/${activity.type}s/${activity.id}`,
                      icon: activity.type === 'birth' ? UserGroupIcon : 
                            activity.type === 'death' ? DocumentTextIcon :
                            activity.type === 'marriage' ? HeartIcon : ScaleIcon,
                      iconBg: activity.type === 'birth' ? 'bg-ethiopia-blue' :
                              activity.type === 'death' ? 'bg-ethiopia-red' :
                              activity.type === 'marriage' ? 'bg-ethiopia-yellow' : 'bg-ethiopia-green'
                    };
                    return <ActivityItem key={`${activity.type}-${activity.id}`} {...props} />;
                  })
                ) : (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activities</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding a new record.</p>
                  </div>
                )}
              </ul>
            </div>
            <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
              <Link 
                to="/activities" 
                className="text-sm font-medium text-ethiopia-blue hover:text-ethiopia-blue/80"
              >
                View all activities
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="bg-white shadow-lg overflow-hidden rounded-xl border border-gray-200">
            <div className="px-6 py-5 sm:px-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <h3 className="text-xl font-bold leading-6 text-gray-900">Quick Actions</h3>
              <p className="mt-1 text-sm text-gray-600">Common tasks and shortcuts</p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 gap-4">
                {[/* ... */].map((item) => (
                  <Link
                    key={item.name}
                    to={item.to}
                    className="group flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className={`flex-shrink-0 h-10 w-10 rounded-md ${item.color} flex items-center justify-center`}>
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-ethiopia-blue">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">Click to {item.name.toLowerCase()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 gap-4">
                <Link to="/deaths/new" className="flex items-center space-x-4 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 group">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center shadow-md">
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-base font-bold text-red-900">Add Death Record</span>
                    <p className="text-xs text-red-700">Register new death certificate</p>
                  </div>
                  <svg className="h-5 w-5 text-red-600 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link to="/marriages/new" className="flex items-center space-x-4 bg-gradient-to-r from-pink-50 to-pink-100 border-2 border-pink-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 group">
                  <div className="flex-shrink-0 w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center shadow-md">
                    <HeartIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-base font-bold text-pink-900">Add Marriage Record</span>
                    <p className="text-xs text-pink-700">Register new marriage certificate</p>
                  </div>
                  <svg className="h-5 w-5 text-pink-600 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link to="/divorces/new" className="flex items-center space-x-4 bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 group">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center shadow-md">
                    <ScaleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-base font-bold text-orange-900">Add Divorce Record</span>
                    <p className="text-xs text-orange-700">Register new divorce record</p>
                  </div>
                  <svg className="h-5 w-5 text-orange-600 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;



