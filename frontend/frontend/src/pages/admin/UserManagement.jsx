import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, EyeIcon, PencilIcon, TrashIcon, UserPlusIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import UserForm from '../../components/admin/UserForm';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';

const UserManagement = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getUsers();
      
      if (response && response.users) {
        setUsers(response.users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(t('users.failedToLoad'));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm(t('users.deleteConfirm'))) {
      try {
        await usersAPI.deleteUser(id);
        toast.success(t('users.userDeleted'));
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error(t('users.failedToDelete'));
      }
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    fetchUsers();
    setSelectedUser(null);
    setIsFormOpen(false);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleExport = () => {
    try {
      const exportData = filteredUsers.map(user => ({
        'Full Name': user.full_name || 'N/A',
        'Email': user.email || 'N/A',
        'Badge Number': user.badge_number || 'N/A',
        'Role': user.role || 'N/A',
        'Department': user.department || 'N/A',
        'Region': user.region || 'N/A',
        'Zone': user.zone || 'N/A',
        'Woreda': user.woreda || 'N/A',
        'Kebele': user.kebele || 'N/A',
        'Phone': user.phone || 'N/A',
        'Status': user.is_active ? 'Active' : 'Inactive',
        'Created At': user.created_at ? format(new Date(user.created_at), 'MMM dd, yyyy') : 'N/A'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Users');
      const filename = `Users_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(wb, filename);
      
      toast.success(t('users.exportSuccess', { count: exportData.length }));
    } catch (error) {
      console.error('Error exporting users:', error);
      toast.error(t('users.exportFailed'));
    }
  };

  const clearRoleFilter = () => {
    setRoleFilter('');
    toast.info(t('users.filterCleared'));
  };

  const getRoleBadge = (role) => {
    const roleStyles = {
      admin: 'bg-red-100 text-red-800',
      vms_officer: 'bg-blue-100 text-blue-800',
      statistician: 'bg-green-100 text-green-800',
      clerk: 'bg-yellow-100 text-yellow-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleStyles[role] || 'bg-gray-100 text-gray-800'}`}>
        {role.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {isActive ? t('users.active') : t('users.inactive')}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.badge_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === '' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('users.accessDenied')}</h1>
          <p className="text-gray-600">{t('users.noPermission')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 shadow-xl border-b border-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-bold text-xl">👥</span>
                </div>
                {t('users.title')}
              </h1>
              <p className="text-purple-100 mt-2 text-lg">
                {t('users.description')} • {users.length} {t('users.totalUsers')}
              </p>
            </div>
            <Button 
              onClick={handleAddUser}
              className="bg-white text-purple-700 hover:bg-purple-50 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <UserPlusIcon className="h-5 w-5 mr-2" />
              {t('users.addUser')}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6 hover:shadow-xl transition-shadow duration-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder={t('users.searchPlaceholder')}
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-base"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowFilters(!showFilters)}
                variant="outline" 
                size="sm" 
                className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200"
              >
                <FunnelIcon className="h-4 w-4 mr-1" />
                {t('users.filterByRole')}
              </Button>
              <Button 
                onClick={handleExport}
                variant="outline" 
                size="sm" 
                className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                {t('users.exportUsers')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('users.filterByRole')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.role')}</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="">{t('users.allRoles')}</option>
                  <option value="admin">{t('users.admin')}</option>
                  <option value="vms_officer">{t('users.vmsOfficer')}</option>
                  <option value="clerk">{t('users.clerk')}</option>
                  <option value="statistician">{t('users.statistician')}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={clearRoleFilter}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg"
              >
                {t('users.clearFilter')}
              </Button>
            </div>
          </Card>
        )}

        {/* Users Table */}
        <Card className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
              <p className="mt-4 text-gray-600 font-medium">{t('users.loadingUsers')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {t('users.user')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('users.email')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('users.role')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('users.region')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('users.status')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('users.lastLogin')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('users.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-4 shadow-md">
                            <span className="text-4xl">👥</span>
                          </div>
                          <p className="text-xl font-bold text-gray-900 mb-2">{searchTerm ? t('users.noUsersMatchingSearch') : t('users.noUsersFound')}</p>
                          <p className="text-sm text-gray-500 mb-4">{t('users.startByAdding')}</p>
                          <Button onClick={handleAddUser} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md">
                            <UserPlusIcon className="h-5 w-5 mr-2 inline" />
                            {t('users.addFirstUser')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.user_id} className="hover:bg-purple-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.profile_photo ? (
                                <img
                                  src={user.profile_photo}
                                  alt={user.full_name}
                                  className="h-10 w-10 rounded-full object-cover shadow-md border-2 border-purple-200"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className={`h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md ${user.profile_photo ? 'hidden' : ''}`}>
                                <span className="text-sm font-bold text-white">
                                  {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.full_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.badge_number}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.region || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(user.is_active)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.last_login)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => handleViewUser(user)}
                              className="text-green-600 hover:text-white hover:bg-green-600 p-2 rounded-lg transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-md"
                              title="View"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-white hover:bg-blue-600 p-2 rounded-lg transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-md"
                              title="Edit"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.user_id)}
                              className="text-red-600 hover:text-white hover:bg-red-600 p-2 rounded-lg transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-md"
                              title="Delete"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* User Form Modal */}
      <UserForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={handleFormSuccess}
      />

      {/* View User Modal */}
      {isViewOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{t('users.userDetails')}</h3>
              <button
                onClick={() => setIsViewOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            {/* User Profile Photo */}
            {selectedUser.profile_photo && (
              <div className="flex justify-center mb-6">
                <img
                  src={selectedUser.profile_photo}
                  alt={selectedUser.full_name}
                  className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-purple-200"
                />
              </div>
            )}
            
            {/* User Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('users.fullName')}</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{selectedUser.full_name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('users.email')}</label>
                <p className="mt-1 text-lg text-gray-900">{selectedUser.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('users.role')}</label>
                <p className="mt-1">{getRoleBadge(selectedUser.role)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('users.badgeNumber')}</label>
                <p className="mt-1 text-lg text-gray-900">{selectedUser.badge_number || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('users.department')}</label>
                <p className="mt-1 text-lg text-gray-900">{selectedUser.department || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('users.phone')}</label>
                <p className="mt-1 text-lg text-gray-900">{selectedUser.phone || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('users.region')}</label>
                <p className="mt-1 text-lg text-gray-900">{selectedUser.region || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('users.zone')}</label>
                <p className="mt-1 text-lg text-gray-900">{selectedUser.zone || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('users.woreda')}</label>
                <p className="mt-1 text-lg text-gray-900">{selectedUser.woreda || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('users.kebele')}</label>
                <p className="mt-1 text-lg text-gray-900">{selectedUser.kebele || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('users.officeName')}</label>
                <p className="mt-1 text-lg text-gray-900">{selectedUser.office_name || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('users.status')}</label>
                <p className="mt-1">{getStatusBadge(selectedUser.is_active)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('users.lastLogin')}</label>
                <p className="mt-1 text-lg text-gray-900">{formatDate(selectedUser.last_login)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">{t('users.createdAt')}</label>
                <p className="mt-1 text-lg text-gray-900">{formatDate(selectedUser.created_at)}</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                {t('users.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
