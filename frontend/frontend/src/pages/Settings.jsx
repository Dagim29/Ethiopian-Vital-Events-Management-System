import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  UserIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  CogIcon,
  KeyIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ImageUpload from '../components/common/ImageUpload';
import { usersAPI } from '../services/api';
import { toast } from 'react-toastify';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    badge_number: user?.badge_number || '',
    department: user?.department || '',
    office_name: user?.office_name || '',
  });
  
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(user?.profile_photo || null);
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'system', name: 'System', icon: CogIcon },
  ];

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    if (!user || !user.user_id) {
      toast.error('User information not available. Please log in again.');
      return;
    }
    
    setLoading(true);
    
    try {
      const updateData = {
        ...profileData,
        profile_photo: profilePhotoPreview,
      };
      
      await usersAPI.updateUser(user.user_id, updateData);
      
      // Update auth context
      if (updateUser) {
        updateUser({ ...user, ...updateData });
      }
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('New passwords do not match');
        setLoading(false);
        return;
      }
      
      if (passwordData.newPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      
      // TODO: Implement password change API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Password changed successfully');
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
        <p className="text-sm text-gray-500">Update your personal details and contact information.</p>
      </div>
      
      {/* Profile Photo Section */}
      <div className="flex items-center space-x-6">
        <div className="flex-shrink-0">
          {profilePhotoPreview ? (
            <img
              src={profilePhotoPreview}
              alt={user?.full_name}
              className="h-24 w-24 rounded-full object-cover shadow-lg border-4 border-purple-200"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">
                {user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <ImageUpload
            label="Profile Photo"
            value={profilePhotoPreview}
            onChange={(file, preview) => {
              setProfilePhoto(file);
              setProfilePhotoPreview(preview);
            }}
            helperText="Upload your profile photo (PNG, JPG up to 5MB)"
          />
        </div>
      </div>
      
      <form onSubmit={handleSaveProfile} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <Input
              name="full_name"
              value={profileData.full_name}
              onChange={handleProfileChange}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
              placeholder="Enter your email"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <Input
              name="phone"
              value={profileData.phone}
              onChange={handleProfileChange}
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Badge Number</label>
            <Input
              name="badge_number"
              value={profileData.badge_number}
              onChange={handleProfileChange}
              placeholder="Enter your badge number"
              disabled
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <Input
              name="department"
              value={profileData.department}
              onChange={handleProfileChange}
              placeholder="Enter your department"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Office</label>
            <Input
              name="office_name"
              value={profileData.office_name}
              onChange={handleProfileChange}
              placeholder="Enter your office name"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
        <p className="text-sm text-gray-500">Manage your password and security preferences.</p>
      </div>
      
      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <Input
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            placeholder="Enter your current password"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <Input
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            placeholder="Enter your new password"
            required
          />
          <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <Input
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            placeholder="Confirm your new password"
            required
          />
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" loading={loading}>
            Change Password
          </Button>
        </div>
      </form>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
        <p className="text-sm text-gray-500">Choose how you want to be notified about system events.</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
            <p className="text-sm text-gray-500">Receive notifications via email</p>
          </div>
          <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
            <p className="text-sm text-gray-500">Receive notifications via SMS</p>
          </div>
          <input type="checkbox" className="h-4 w-4 text-blue-600" />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">System Alerts</h4>
            <p className="text-sm text-gray-500">Receive alerts for system updates</p>
          </div>
          <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
        <p className="text-sm text-gray-500">Configure system-wide settings and preferences.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <div className="flex items-center">
            <GlobeAltIcon className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Language</h4>
              <p className="text-sm text-gray-500">English</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Reports</h4>
              <p className="text-sm text-gray-500">Generate system reports</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Analytics</h4>
              <p className="text-sm text-gray-500">View system analytics</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <KeyIcon className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">API Keys</h4>
              <p className="text-sm text-gray-500">Manage API access</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'security':
        return renderSecurityTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'system':
        return renderSystemTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {renderTabContent()}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
