import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersAPI } from '../../services/api';
import StatCard from '../../components/dashboard/StatCard';
import { 
  DocumentTextIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  PlusCircleIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const VMSOfficerDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['officerStats'],
    queryFn: async () => {
      const response = await usersAPI.getOfficerStats();
      return response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold">{t('vmsOfficer.title')}</h1>
        <p className="mt-2 text-blue-100">{t('vmsOfficer.description')}</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('vmsOfficer.totalRecords')}
          value={stats?.totalRecords || 0}
          icon={DocumentTextIcon}
          color="bg-blue-500"
          subtitle={t('vmsOfficer.allVitalRecords')}
        />
        <StatCard
          title={t('birth.birthRecords')}
          value={stats?.totalBirths || 0}
          icon={UserGroupIcon}
          color="bg-green-500"
          subtitle={t('vmsOfficer.registeredBirths')}
        />
        <StatCard
          title={t('death.deathRecords')}
          value={stats?.totalDeaths || 0}
          icon={CalendarIcon}
          color="bg-red-500"
          subtitle={t('vmsOfficer.registeredDeaths')}
        />
        <StatCard
          title={t('marriage.marriageRecords')}
          value={stats?.totalMarriages || 0}
          icon={CheckCircleIcon}
          color="bg-pink-500"
          subtitle={t('vmsOfficer.registeredMarriages')}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('divorce.divorceRecords')}
          value={stats?.totalDivorces || 0}
          icon={ExclamationCircleIcon}
          color="bg-orange-500"
          subtitle={t('vmsOfficer.registeredDivorces')}
        />
        <StatCard
          title={t('vmsOfficer.myRecords')}
          value={stats?.myRecords || 0}
          icon={DocumentTextIcon}
          color="bg-indigo-500"
          subtitle={t('vmsOfficer.recordsICreated')}
        />
        <StatCard
          title={t('vmsOfficer.pendingApproval')}
          value={stats?.pendingApproval || 0}
          icon={ClockIcon}
          color="bg-yellow-500"
          subtitle={t('vmsOfficer.awaitingReview')}
        />
        <StatCard
          title={t('vmsOfficer.approvedToday')}
          value={stats?.approvedToday || 0}
          icon={CheckCircleIcon}
          color="bg-teal-500"
          subtitle={t('vmsOfficer.approvedRecords')}
        />
      </div>

      {/* Quick Actions - Simplified */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <PlusCircleIcon className="h-6 w-6 mr-2 text-blue-600" />
          {t('vmsOfficer.quickActions')}
        </h2>
        <p className="text-sm text-gray-600 mb-4">{t('vmsOfficer.registerQuickly')}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            onClick={() => navigate('/births')}
            className="group relative bg-white hover:bg-green-50 border-2 border-green-200 hover:border-green-400 rounded-xl p-4 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                <PlusCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-green-700">{t('common.birth')}</span>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/deaths')}
            className="group relative bg-white hover:bg-red-50 border-2 border-red-200 hover:border-red-400 rounded-xl p-4 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-red-100 rounded-full group-hover:bg-red-200 transition-colors">
                <PlusCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-red-700">{t('common.death')}</span>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/marriages')}
            className="group relative bg-white hover:bg-pink-50 border-2 border-pink-200 hover:border-pink-400 rounded-xl p-4 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-pink-100 rounded-full group-hover:bg-pink-200 transition-colors">
                <PlusCircleIcon className="h-6 w-6 text-pink-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-pink-700">{t('common.marriage')}</span>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/divorces')}
            className="group relative bg-white hover:bg-orange-50 border-2 border-orange-200 hover:border-orange-400 rounded-xl p-4 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-orange-100 rounded-full group-hover:bg-orange-200 transition-colors">
                <PlusCircleIcon className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-orange-700">{t('common.divorce')}</span>
            </div>
          </button>
        </div>
      </Card>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Contribution */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-blue-600" />
            {t('vmsOfficer.myContribution')}
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">{t('vmsOfficer.birthRecordsCreated')}</span>
              <span className="text-lg font-bold text-green-600">{stats?.myBirths || 0}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">{t('vmsOfficer.deathRecordsCreated')}</span>
              <span className="text-lg font-bold text-red-600">{stats?.myDeaths || 0}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">{t('vmsOfficer.marriageRecordsCreated')}</span>
              <span className="text-lg font-bold text-pink-600">{stats?.myMarriages || 0}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">{t('vmsOfficer.divorceRecordsCreated')}</span>
              <span className="text-lg font-bold text-orange-600">{stats?.myDivorces || 0}</span>
            </div>
          </div>
        </Card>

        {/* Record Type Distribution */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-indigo-600" />
            {t('vmsOfficer.recordDistribution')}
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{t('birth.birthRecords')}</span>
                <span className="text-sm font-medium text-gray-900">{stats?.totalBirths || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${((stats?.totalBirths || 0) / (stats?.totalRecords || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{t('death.deathRecords')}</span>
                <span className="text-sm font-medium text-gray-900">{stats?.totalDeaths || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-red-500 h-2.5 rounded-full" 
                  style={{ width: `${((stats?.totalDeaths || 0) / (stats?.totalRecords || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{t('marriage.marriageRecords')}</span>
                <span className="text-sm font-medium text-gray-900">{stats?.totalMarriages || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-pink-500 h-2.5 rounded-full" 
                  style={{ width: `${((stats?.totalMarriages || 0) / (stats?.totalRecords || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{t('divorce.divorceRecords')}</span>
                <span className="text-sm font-medium text-gray-900">{stats?.totalDivorces || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-orange-500 h-2.5 rounded-full" 
                  style={{ width: `${((stats?.totalDivorces || 0) / (stats?.totalRecords || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Access Note */}
      <Card className="p-4 bg-green-50 border-l-4 border-green-500">
        <div className="flex">
          <div className="flex-shrink-0">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-700">
              <strong>{t('vmsOfficer.fullAccess')}:</strong> {t('vmsOfficer.accessDescription')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VMSOfficerDashboard;
