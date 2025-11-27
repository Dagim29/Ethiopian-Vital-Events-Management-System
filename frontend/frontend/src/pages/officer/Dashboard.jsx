import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { birthRecordsAPI } from '../../services/api';
import StatCard from '../../components/dashboard/StatCard';
import { DocumentTextIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const OfficerDashboard = () => {
  const { data: stats, isLoading } = useQuery(['officerStats'], async () => {
    const response = await birthRecordsAPI.getStats();
    return response.data;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ethiopia-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Vital Records Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Records"
          value={stats?.totalRecords || 0}
          icon={DocumentTextIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="Pending Review"
          value={stats?.pendingReview || 0}
          icon={ClockIcon}
          color="bg-yellow-500"
        />
        <StatCard
          title="Approved"
          value={stats?.approved || 0}
          icon={CheckCircleIcon}
          color="bg-green-500"
        />
        <StatCard
          title="Rejected"
          value={stats?.rejected || 0}
          icon={ExclamationCircleIcon}
          color="bg-red-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-ethiopia-green hover:bg-ethiopia-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ethiopia-green"
          >
            Register New Birth
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-ethiopia-blue hover:bg-ethiopia-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ethiopia-blue"
          >
            Register Death
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-ethiopia-yellow text-gray-900 hover:bg-ethiopia-yellow/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ethiopia-yellow"
          >
            Register Marriage
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-ethiopia-red hover:bg-ethiopia-red/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ethiopia-red"
          >
            Register Divorce
          </button>
        </div>
      </div>

      {/* Recent Records */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Records</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Record ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats?.recentRecords?.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      record.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      record.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
