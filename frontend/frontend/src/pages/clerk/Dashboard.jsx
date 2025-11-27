import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersAPI, birthRecordsAPI, deathRecordsAPI, marriageRecordsAPI, divorceRecordsAPI } from '../../services/api';
import { 
  PlusCircleIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  CakeIcon,
  FaceFrownIcon,
  HeartIcon,
  XMarkIcon as XCircleIconOutline,
  ChartBarIcon,
  InformationCircleIcon,
  EyeIcon,
  CalendarIcon,
  UserGroupIcon,
  TrophyIcon,
  SparklesIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';
import { useNavigate } from 'react-router-dom';

const ClerkDashboard = () => {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState('week'); // week, month, all
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['officerStats'],
    queryFn: async () => {
      const response = await usersAPI.getOfficerStats();
      return response;
    },
  });

  // Fetch recent records created by this clerk
  const { data: recentRecords, isLoading: loadingRecords, error: recordsError } = useQuery({
    queryKey: ['clerkRecentRecords'],
    enabled: !!stats, // Only fetch when stats are loaded
    retry: 1,
    queryFn: async () => {
      try {
        const [births, deaths, marriages, divorces] = await Promise.all([
          birthRecordsAPI.getRecords({ limit: 3 }),
          deathRecordsAPI.getRecords({ limit: 3 }),
          marriageRecordsAPI.getRecords({ limit: 3 }),
          divorceRecordsAPI.getRecords({ limit: 3 })
        ]);
        
        console.log('API Responses:', { births, deaths, marriages, divorces });
        
        const allRecords = [
          ...(births?.birth_records || births?.births || []).map(r => ({ ...r, type: 'birth', icon: CakeIcon, color: 'pink' })),
          ...(deaths?.death_records || deaths?.deaths || []).map(r => ({ ...r, type: 'death', icon: FaceFrownIcon, color: 'gray' })),
          ...(marriages?.marriage_records || marriages?.marriages || []).map(r => ({ ...r, type: 'marriage', icon: HeartIcon, color: 'red' })),
          ...(divorces?.divorce_records || divorces?.divorces || []).map(r => ({ ...r, type: 'divorce', icon: XCircleIconOutline, color: 'orange' }))
        ];
        
        console.log('All records combined:', allRecords);
        
        // Sort by date and take most recent 5
        const sorted = allRecords
          .sort((a, b) => new Date(b.created_at || b.date_of_birth || b.date_of_death || b.marriage_date || b.divorce_date) - 
                         new Date(a.created_at || a.date_of_birth || a.date_of_death || a.marriage_date || a.divorce_date))
          .slice(0, 5);
        
        console.log('Sorted records:', sorted);
        return sorted;
      } catch (error) {
        console.error('Error fetching recent records:', error);
        return [];
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <PencilSquareIcon className="h-8 w-8 text-white" />
                </div>
                Clerk Dashboard
              </h1>
              <p className="text-teal-100 mt-2 text-lg">
                Data Entry & Record Management • {stats?.myRecords || 0} Records Created
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/births')}
                className="bg-white text-teal-700 hover:bg-teal-50 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <PlusCircleIcon className="h-5 w-5 mr-2 inline" />
                New Record
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Main Stats Overview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium uppercase tracking-wide">My Records</p>
                <p className="text-4xl font-bold mt-2">{stats?.myRecords || 0}</p>
                <p className="text-teal-100 text-xs mt-2">Total created</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <DocumentTextIcon className="h-10 w-10" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium uppercase tracking-wide">My Births</p>
                <p className="text-4xl font-bold mt-2">{stats?.myBirths || 0}</p>
                <p className="text-yellow-100 text-xs mt-2">Birth records created</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <CakeIcon className="h-10 w-10" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium uppercase tracking-wide">My Deaths</p>
                <p className="text-4xl font-bold mt-2">{stats?.myDeaths || 0}</p>
                <p className="text-green-100 text-xs mt-2">Death records created</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <FaceFrownIcon className="h-10 w-10" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">My Marriages</p>
                <p className="text-4xl font-bold mt-2">{stats?.myMarriages || 0}</p>
                <p className="text-blue-100 text-xs mt-2">Marriage records created</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <HeartIcon className="h-10 w-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Data Entry */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <PlusCircleIcon className="h-7 w-7 mr-3 text-teal-600" />
            Quick Actions - Create New Records
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => navigate('/births')}
              className="group relative inline-flex flex-col items-center justify-center px-6 py-8 border-2 border-pink-300 text-sm font-semibold rounded-xl shadow-md text-pink-700 bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-600 hover:to-pink-700 hover:text-white hover:border-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-200 transform hover:scale-105"
            >
              <CakeIcon className="h-12 w-12 mb-3" />
              <span className="text-base">Register Birth</span>
              <span className="text-xs mt-1 opacity-75">Create new birth record</span>
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/deaths')}
              className="group relative inline-flex flex-col items-center justify-center px-6 py-8 border-2 border-gray-300 text-sm font-semibold rounded-xl shadow-md text-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-600 hover:to-gray-700 hover:text-white hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 transform hover:scale-105"
            >
              <FaceFrownIcon className="h-12 w-12 mb-3" />
              <span className="text-base">Register Death</span>
              <span className="text-xs mt-1 opacity-75">Create new death record</span>
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/marriages')}
              className="group relative inline-flex flex-col items-center justify-center px-6 py-8 border-2 border-red-300 text-sm font-semibold rounded-xl shadow-md text-red-700 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-600 hover:to-red-700 hover:text-white hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105"
            >
              <HeartIcon className="h-12 w-12 mb-3" />
              <span className="text-base">Register Marriage</span>
              <span className="text-xs mt-1 opacity-75">Create new marriage record</span>
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/divorces')}
              className="group relative inline-flex flex-col items-center justify-center px-6 py-8 border-2 border-orange-300 text-sm font-semibold rounded-xl shadow-md text-orange-700 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-600 hover:to-orange-700 hover:text-white hover:border-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 transform hover:scale-105"
            >
              <XCircleIconOutline className="h-12 w-12 mb-3" />
              <span className="text-base">Register Divorce</span>
              <span className="text-xs mt-1 opacity-75">Create new divorce record</span>
            </button>
          </div>
        </div>

        {/* My Contribution Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Record Type Distribution */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-2 text-teal-600" />
              My Records by Type
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg border border-pink-200">
                <div className="flex items-center">
                  <CakeIcon className="h-5 w-5 text-pink-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Birth Records</span>
                </div>
                <span className="text-lg font-bold text-pink-600">{stats?.myBirths || 0}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <FaceFrownIcon className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Death Records</span>
                </div>
                <span className="text-lg font-bold text-gray-600">{stats?.myDeaths || 0}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center">
                  <HeartIcon className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Marriage Records</span>
                </div>
                <span className="text-lg font-bold text-red-600">{stats?.myMarriages || 0}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center">
                  <XCircleIconOutline className="h-5 w-5 text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Divorce Records</span>
                </div>
                <span className="text-lg font-bold text-orange-600">{stats?.myDivorces || 0}</span>
              </div>
            </div>
          </Card>

          {/* Recent Tasks */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ClipboardDocumentCheckIcon className="h-6 w-6 mr-2 text-teal-600" />
              My Tasks & Responsibilities
            </h2>
            <div className="space-y-3">
              <div className="flex items-start p-3 bg-teal-50 rounded-lg border border-teal-200">
                <CheckCircleIcon className="h-5 w-5 text-teal-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Data Entry</p>
                  <p className="text-xs text-gray-600">Create and submit vital records</p>
                </div>
              </div>
              
              <div className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-200">
                <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">View My Records</p>
                  <p className="text-xs text-gray-600">Access records you created</p>
                </div>
              </div>
              
              <div className="flex items-start p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <ClockIcon className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Pending Approval</p>
                  <p className="text-xs text-gray-600">Wait for officer approval</p>
                </div>
              </div>
              
              <div className="flex items-start p-3 bg-purple-50 rounded-lg border border-purple-200">
                <PencilSquareIcon className="h-5 w-5 text-purple-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Update Profile</p>
                  <p className="text-xs text-gray-600">Manage your account settings</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Records & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Records */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <ClockIcon className="h-6 w-6 mr-2 text-teal-600" />
                Recent Records
              </div>
              <button
                onClick={() => navigate('/births')}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                View All →
              </button>
            </h2>
            <div className="space-y-3">
              {loadingRecords ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading records...</p>
                </div>
              ) : recordsError ? (
                <div className="text-center py-8 text-gray-500">
                  <XCircleIcon className="h-12 w-12 mx-auto mb-2 text-red-400" />
                  <p className="text-sm text-red-600">Error loading records</p>
                  <p className="text-xs mt-1 text-gray-500">{recordsError.message}</p>
                </div>
              ) : recentRecords && recentRecords.length > 0 ? (
                recentRecords.map((record, index) => {
                  const Icon = record.icon;
                  const colorClasses = {
                    pink: 'bg-pink-50 border-pink-200 text-pink-700',
                    gray: 'bg-gray-50 border-gray-200 text-gray-700',
                    red: 'bg-red-50 border-red-200 text-red-700',
                    orange: 'bg-orange-50 border-orange-200 text-orange-700'
                  };
                  
                  return (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${colorClasses[record.color]}`}>
                      <div className="flex items-center flex-1">
                        <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {record.type === 'birth' && `${record.child_first_name || ''} ${record.child_father_name || ''}`}
                            {record.type === 'death' && `${record.deceased_first_name || ''} ${record.deceased_father_name || ''}`}
                            {record.type === 'marriage' && `${record.spouse1_full_name || 'Spouse 1'} & ${record.spouse2_full_name || 'Spouse 2'}`}
                            {record.type === 'divorce' && `${record.spouse1_full_name || 'Spouse 1'} & ${record.spouse2_full_name || 'Spouse 2'}`}
                          </p>
                          <p className="text-xs text-gray-600 capitalize">{record.type} Record</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/${record.type}s`)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                        title="View Record"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No records created yet</p>
                  <p className="text-xs mt-1">Start by creating your first record</p>
                </div>
              )}
            </div>
          </Card>

          {/* Performance Metrics */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrophyIcon className="h-6 w-6 mr-2 text-teal-600" />
              My Performance
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200">
                <div className="flex items-center">
                  <div className="bg-teal-100 rounded-lg p-2 mr-3">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Total Contribution</p>
                    <p className="text-xs text-gray-600">All-time records</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-teal-600">{stats?.myRecords || 0}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-lg p-2 mr-3">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">This Week</p>
                    <p className="text-xs text-gray-600">Last 7 days</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600">{stats?.myRecords || 0}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-lg p-2 mr-3">
                    <SparklesIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Quality Score</p>
                    <p className="text-xs text-gray-600">Approval rate</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-purple-600">100%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick View Records */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <EyeIcon className="h-7 w-7 mr-3 text-teal-600" />
            Quick View - My Records
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => navigate('/births')}
              className="group relative inline-flex flex-col items-center justify-center px-6 py-6 border-2 border-pink-200 text-sm font-semibold rounded-xl shadow-md text-pink-700 bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 hover:border-pink-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-200 transform hover:scale-105"
            >
              <CakeIcon className="h-10 w-10 mb-2" />
              <span className="text-base font-bold">{stats?.myBirths || 0}</span>
              <span className="text-xs mt-1 opacity-75">Birth Records</span>
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/deaths')}
              className="group relative inline-flex flex-col items-center justify-center px-6 py-6 border-2 border-gray-200 text-sm font-semibold rounded-xl shadow-md text-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 transform hover:scale-105"
            >
              <FaceFrownIcon className="h-10 w-10 mb-2" />
              <span className="text-base font-bold">{stats?.myDeaths || 0}</span>
              <span className="text-xs mt-1 opacity-75">Death Records</span>
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/marriages')}
              className="group relative inline-flex flex-col items-center justify-center px-6 py-6 border-2 border-red-200 text-sm font-semibold rounded-xl shadow-md text-red-700 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105"
            >
              <HeartIcon className="h-10 w-10 mb-2" />
              <span className="text-base font-bold">{stats?.myMarriages || 0}</span>
              <span className="text-xs mt-1 opacity-75">Marriage Records</span>
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/divorces')}
              className="group relative inline-flex flex-col items-center justify-center px-6 py-6 border-2 border-orange-200 text-sm font-semibold rounded-xl shadow-md text-orange-700 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 transform hover:scale-105"
            >
              <XCircleIconOutline className="h-10 w-10 mb-2" />
              <span className="text-base font-bold">{stats?.myDivorces || 0}</span>
              <span className="text-xs mt-1 opacity-75">Divorce Records</span>
            </button>
          </div>
        </div>

        {/* Data Entry Tips */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <SparklesIcon className="h-7 w-7 mr-3 text-teal-600" />
            Data Entry Tips & Best Practices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-200">
              <CheckCircleIcon className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Double-Check Information</p>
                <p className="text-xs text-gray-600 mt-1">Verify all names, dates, and ID numbers before submitting</p>
              </div>
            </div>

            <div className="flex items-start p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Use Proper Formatting</p>
                <p className="text-xs text-gray-600 mt-1">Follow Ethiopian naming conventions and date formats</p>
              </div>
            </div>

            <div className="flex items-start p-4 bg-purple-50 rounded-lg border border-purple-200">
              <CheckCircleIcon className="h-6 w-6 text-purple-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Complete All Required Fields</p>
                <p className="text-xs text-gray-600 mt-1">Ensure no mandatory information is missing</p>
              </div>
            </div>

            <div className="flex items-start p-4 bg-orange-50 rounded-lg border border-orange-200">
              <CheckCircleIcon className="h-6 w-6 text-orange-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Save Drafts Regularly</p>
                <p className="text-xs text-gray-600 mt-1">Don't lose your work - save progress frequently</p>
              </div>
            </div>
          </div>
        </div>

        {/* Access Note */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl shadow-lg p-6 border-l-4 border-teal-500">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="bg-teal-100 rounded-lg p-3">
                <InformationCircleIcon className="h-8 w-8 text-teal-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Clerk Role - Data Entry Access</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong className="text-teal-700">Your Permissions:</strong> You can create new vital records in draft status. 
                All records you create will be submitted for approval by VMS Officers or Administrators. 
                You can view and edit only the records you have created. You cannot approve, delete, or access user management features.
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

export default ClerkDashboard;
