import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  UserIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  CogIcon,
  KeyIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ImageUpload from '../components/common/ImageUpload';
import LanguageSelector from '../components/common/LanguageSelector';
import { usersAPI } from '../services/api';
import { toast } from 'react-toastify';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
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
    { id: 'profile', name: t('settings.profile'), icon: UserIcon },
    { id: 'security', name: t('settings.security'), icon: ShieldCheckIcon },
    { id: 'notifications', name: t('settings.notifications'), icon: BellIcon },
    { id: 'system', name: t('settings.system'), icon: CogIcon },
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
      
      const response = await usersAPI.updateProfile(updateData);
      
      // Update auth context with the returned user data
      if (updateUser && response.user) {
        updateUser(response.user);
      }
      
      toast.success(t('messages.profileUpdated'));
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || t('messages.profileUpdateFailed'));
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
        toast.error(t('messages.passwordMismatch'));
        setLoading(false);
        return;
      }
      
      if (passwordData.newPassword.length < 6) {
        toast.error(t('settings.passwordMinLength'));
        setLoading(false);
        return;
      }
      
      // Call password change API
      await usersAPI.changePassword(passwordData);
      
      toast.success(t('messages.passwordChanged'));
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.message || t('messages.passwordChangeFailed'));
    } finally {
      setLoading(false);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">{t('settings.personalInfo')}</h3>
        <p className="text-sm text-gray-500">{t('settings.personalInfoDesc')}</p>
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
            label={t('settings.profilePhoto')}
            value={profilePhotoPreview}
            onChange={(_file, preview) => {
              setProfilePhotoPreview(preview);
            }}
            helperText={t('settings.uploadPhoto')}
          />
        </div>
      </div>
      
      <form onSubmit={handleSaveProfile} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.fullName')}</label>
            <Input
              name="full_name"
              value={profileData.full_name}
              onChange={handleProfileChange}
              placeholder={t('settings.fullName')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.email')}</label>
            <Input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
              placeholder={t('common.email')}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.phone')}</label>
            <Input
              name="phone"
              value={profileData.phone}
              onChange={handleProfileChange}
              placeholder={t('settings.phone')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.badgeNumber')}</label>
            <Input
              name="badge_number"
              value={profileData.badge_number}
              onChange={handleProfileChange}
              placeholder={t('settings.badgeNumber')}
              disabled
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.department')}</label>
            <Input
              name="department"
              value={profileData.department}
              onChange={handleProfileChange}
              placeholder={t('settings.department')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.office')}</label>
            <Input
              name="office_name"
              value={profileData.office_name}
              onChange={handleProfileChange}
              placeholder={t('settings.office')}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" loading={loading}>
            {t('settings.saveChanges')}
          </Button>
        </div>
      </form>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">{t('settings.securitySettings')}</h3>
        <p className="text-sm text-gray-500">{t('settings.securityDesc')}</p>
      </div>
      
      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.currentPassword')}</label>
          <Input
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            placeholder={t('settings.currentPassword')}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.newPassword')}</label>
          <Input
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            placeholder={t('settings.newPassword')}
            required
          />
          <p className="mt-1 text-xs text-gray-500">{t('settings.passwordMinLength')}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.confirmPassword')}</label>
          <Input
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            placeholder={t('settings.confirmPassword')}
            required
          />
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" loading={loading}>
            {t('settings.changePassword')}
          </Button>
        </div>
      </form>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">{t('settings.notificationPreferences')}</h3>
        <p className="text-sm text-gray-500">{t('settings.notificationDesc')}</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">{t('settings.emailNotifications')}</h4>
            <p className="text-sm text-gray-500">{t('settings.emailNotificationsDesc')}</p>
          </div>
          <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">{t('settings.smsNotifications')}</h4>
            <p className="text-sm text-gray-500">{t('settings.smsNotificationsDesc')}</p>
          </div>
          <input type="checkbox" className="h-4 w-4 text-blue-600" />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">{t('settings.systemAlerts')}</h4>
            <p className="text-sm text-gray-500">{t('settings.systemAlertsDesc')}</p>
          </div>
          <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600" />
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">{t('settings.systemSettings')}</h3>
        <p className="text-sm text-gray-500">{t('settings.systemDesc')}</p>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.language')}</label>
        <LanguageSelector />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <Card className="p-4">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">{t('settings.reports')}</h4>
              <p className="text-sm text-gray-500">{t('settings.reportsDesc')}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">{t('settings.analytics')}</h4>
              <p className="text-sm text-gray-500">{t('settings.analyticsDesc')}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <KeyIcon className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">{t('settings.apiKeys')}</h4>
              <p className="text-sm text-gray-500">{t('settings.apiKeysDesc')}</p>
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
            <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
            <p className="text-gray-600 mt-1">
              {t('settings.subtitle')}
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
