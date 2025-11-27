import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI, auditLogsAPI } from '../../services/api';
import StatCard from '../../components/dashboard/StatCard';
import UserForm from '../../components/admin/UserForm';
import { 
  UserGroupIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  TrashIcon,
  PencilIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  UserPlusIcon,
  UsersIcon,
  CakeIcon,
  FaceFrownIcon,
  BoltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isActiveUsersModalOpen, setIsActiveUsersModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch admin stats
  const { data: stats, isLoading: isLoadingStats, isError: isStatsError, error: statsError } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => {
      console.log('Fetching admin stats...');
      return usersAPI.getAdminStats();
    },
    onSuccess: (data) => {
      console.log('Admin stats fetched successfully:', data);
    },
    onError: (error) => {
      console.error('Error fetching admin stats:', error);
    }
  });

  // Fetch users list
  const { 
    data: usersData, 
    isLoading: isLoadingUsers, 
    isError: isUsersError,
    error: usersError
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => {
      console.log('Fetching users...');
      return usersAPI.getUsers();
    },
    select: (data) => {
      console.log('Users data received:', data);
      return data.users || [];
    },
    onSuccess: (data) => {
      console.log('Users fetched successfully:', data);
    },
    onError: (error) => {
      console.error('Error fetching users:', error);
    }
  });

  // Fetch audit stats
  const { data: auditStats } = useQuery({
    queryKey: ['auditStats'],
    queryFn: () => auditLogsAPI.getStats(),
    onError: (error) => {
      console.error('Error fetching audit stats:', error);
    }
  });

  // Update user status mutation
  const updateUserStatus = useMutation({
    mutationFn: ({ userId, status }) => usersAPI.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success('User status updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update user status');
    }
  });

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: (userId) => usersAPI.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      setIsDeleteModalOpen(false);
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete user');
    }
  });

  const handleStatusChange = (userId, newStatus) => {
    updateUserStatus.mutate({ userId, status: newStatus });
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteUser.mutate(selectedUser.user_id);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditing(true);
    setIsUserFormOpen(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setIsUserFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsUserFormOpen(false);
    setSelectedUser(null);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoadingStats || isLoadingUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ethiopia-green"></div>
        <p className="ml-4 text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  if (isStatsError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error loading dashboard stats: {statsError?.message || 'Unknown error'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isUsersError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {usersError.message || 'Failed to load users. Please try again.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('Admin Dashboard - Stats:', stats);
  console.log('Admin Dashboard - Users:', usersData);
  console.log('Admin Dashboard - Loading states:', { isLoadingStats, isLoadingUsers });
  console.log('Admin Dashboard - Error states:', { isStatsError, isUsersError });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <ShieldCheckIcon className="h-8 w-8 text-white" />
                </div>
                Admin Dashboard
              </h1>
              <p className="text-blue-100 mt-2 text-lg">
                System Overview & Management • {stats?.totalRecords?.toLocaleString() || 0} Total Records
              </p>
            </div>
            <Button 
              onClick={handleAddUser}
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <UserPlusIcon className="h-5 w-5 mr-2 inline" />
              Add New User
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Main Stats Overview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Total Users</p>
                <p className="text-4xl font-bold mt-2">{stats?.totalUsers || 0}</p>
                <p className="text-blue-100 text-xs mt-2">{stats?.activeUsers || 0} active</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <UsersIcon className="h-10 w-10" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium uppercase tracking-wide">Active Today</p>
                <p className="text-4xl font-bold mt-2">{stats?.activeToday || 0}</p>
                <p className="text-green-100 text-xs mt-2">Users logged in</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <BoltIcon className="h-10 w-10" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium uppercase tracking-wide">Pending</p>
                <p className="text-4xl font-bold mt-2">{stats?.pendingApprovals || 0}</p>
                <p className="text-yellow-100 text-xs mt-2">Awaiting approval</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <ClockIcon className="h-10 w-10" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">Total Records</p>
                <p className="text-4xl font-bold mt-2">{stats?.totalRecords?.toLocaleString() || 0}</p>
                <p className="text-purple-100 text-xs mt-2">All vital records</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <DocumentTextIcon className="h-10 w-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Record Type Breakdown */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <ChartBarIcon className="h-7 w-7 mr-3 text-purple-600" />
            Records Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-5 border-2 border-pink-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <CakeIcon className="h-8 w-8 text-pink-600" />
                <span className="text-3xl font-bold text-pink-700">{stats?.totalBirths?.toLocaleString() || 0}</span>
              </div>
              <h3 className="text-sm font-semibold text-pink-900 uppercase tracking-wide">Birth Records</h3>
              <div className="mt-2 bg-pink-200 rounded-full h-2">
                <div 
                  className="bg-pink-600 h-2 rounded-full" 
                  style={{ width: `${((stats?.totalBirths || 0) / (stats?.totalRecords || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-gray-300 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <FaceFrownIcon className="h-8 w-8 text-gray-600" />
                <span className="text-3xl font-bold text-gray-700">{stats?.totalDeaths?.toLocaleString() || 0}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Death Records</h3>
              <div className="mt-2 bg-gray-300 rounded-full h-2">
                <div 
                  className="bg-gray-600 h-2 rounded-full" 
                  style={{ width: `${((stats?.totalDeaths || 0) / (stats?.totalRecords || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border-2 border-red-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <HeartIcon className="h-8 w-8 text-red-600" />
                <span className="text-3xl font-bold text-red-700">{stats?.totalMarriages?.toLocaleString() || 0}</span>
              </div>
              <h3 className="text-sm font-semibold text-red-900 uppercase tracking-wide">Marriage Records</h3>
              <div className="mt-2 bg-red-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{ width: `${((stats?.totalMarriages || 0) / (stats?.totalRecords || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border-2 border-orange-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <XCircleIcon className="h-8 w-8 text-orange-600" />
                <span className="text-3xl font-bold text-orange-700">{stats?.totalDivorces?.toLocaleString() || 0}</span>
              </div>
              <h3 className="text-sm font-semibold text-orange-900 uppercase tracking-wide">Divorce Records</h3>
              <div className="mt-2 bg-orange-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full" 
                  style={{ width: `${((stats?.totalDivorces || 0) / (stats?.totalRecords || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Activity Stats */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <ClockIcon className="h-7 w-7 mr-3 text-teal-600" />
            Recent Activity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              onClick={() => navigate('/audit-logs')}
              className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-5 border-2 border-teal-200 hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <ClockIcon className="h-8 w-8 text-teal-600" />
                <span className="text-3xl font-bold text-teal-700">{auditStats?.total_logs?.toLocaleString() || 0}</span>
              </div>
              <h3 className="text-sm font-semibold text-teal-900 uppercase tracking-wide">Total Audit Logs</h3>
              <p className="text-xs text-teal-700 mt-2">All system activities tracked</p>
              <p className="text-xs text-teal-600 mt-2 font-medium">Click to view all →</p>
            </div>

            <div 
              onClick={() => navigate('/audit-logs')}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-200 hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <BoltIcon className="h-8 w-8 text-green-600" />
                <span className="text-3xl font-bold text-green-700">{auditStats?.recent_activity || 0}</span>
              </div>
              <h3 className="text-sm font-semibold text-green-900 uppercase tracking-wide">Last 24 Hours</h3>
              <p className="text-xs text-green-700 mt-2">Recent system actions</p>
              <p className="text-xs text-green-600 mt-2 font-medium">Click to view recent →</p>
            </div>

            <div 
              onClick={() => setIsActiveUsersModalOpen(true)}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200 hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
                <span className="text-3xl font-bold text-blue-700">{auditStats?.active_users || 0}</span>
              </div>
              <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wide">Active Users</h3>
              <p className="text-xs text-blue-700 mt-2">Users with recent activity</p>
              <p className="text-xs text-blue-600 mt-2 font-medium">Click to view details →</p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <UserGroupIcon className="h-7 w-7 mr-3 text-blue-600" />
              User Management
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usersData.map((user) => (
                  <tr key={user.user_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(user.is_active ? 'active' : 'inactive')}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          className="text-ethiopia-blue hover:text-ethiopia-green"
                          onClick={() => handleEditUser(user)}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteClick(user)}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <ClockIcon className="h-7 w-7 mr-3 text-green-600" />
              Recent Activity
            </h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {stats?.recentActivity?.map((activity, index) => (
              <li key={index} className="px-6 py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* User Form Modal */}
      <UserForm 
        isOpen={isUserFormOpen} 
        onClose={handleCloseForm} 
        user={isEditing ? selectedUser : null} 
      />

      {/* Active Users Modal */}
      <Modal
        isOpen={isActiveUsersModalOpen}
        onClose={() => setIsActiveUsersModalOpen(false)}
        title="Active Users"
        maxWidth="max-w-4xl"
      >
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Users who have logged in within the last 24 hours
            </p>
          </div>
          
          {usersData && usersData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usersData
                    .filter(user => {
                      if (!user.last_login) return false;
                      const lastLogin = new Date(user.last_login);
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      return lastLogin >= yesterday;
                    })
                    .map((user) => (
                      <tr key={user.user_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {user.full_name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'officer' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(user.is_active ? 'active' : 'pending')}`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              
              {usersData.filter(user => {
                if (!user.last_login) return false;
                const lastLogin = new Date(user.last_login);
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                return lastLogin >= yesterday;
              }).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No active users in the last 24 hours</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        maxWidth="max-w-md"
      >
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Delete User
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete {selectedUser?.full_name}? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <Button
            type="button"
            variant="danger"
            onClick={confirmDelete}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Delete
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsDeleteModalOpen(false)}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ethiopia-green sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
