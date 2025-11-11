import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import LoginModal from '../auth/LoginModal';

const Hero = () => {
  const navigate = useNavigate();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const features = [
    'Automated Certificate Generation',
    'Multi-Level Approval Workflow',
    'Regional Access Control',
    'Real-time Data Analytics',
    'Secure Cloud Storage',
    'Amharic & English Support'
  ];

  const handleLoginSuccess = () => {
    setLoginModalOpen(false);
    navigate('/dashboard');
  };

  return (
    <section id="home" className="relative bg-gradient-to-br from-green-50 via-blue-50/30 to-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-100/30 to-blue-100/30"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(7,137,48,0.15),transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      </div>
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-blue-100 border border-green-300">
                <span className="text-sm font-semibold text-green-700">🇪🇹 Ethiopian Government Initiative</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Ethiopia's
                <span className="block bg-gradient-to-r from-green-600 via-blue-600 to-green-700 bg-clip-text text-transparent">
                  National Vital Records
                </span>
                Management System
              </h1>
              
              <p className="text-xl text-gray-700 leading-relaxed max-w-2xl">
                A comprehensive digital platform for managing birth, death, marriage, and divorce records 
                across all Ethiopian regions. Empowering government officials with modern tools for efficient 
                civil registration and vital statistics.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-800 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={() => setLoginModalOpen(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-semibold"
              >
                Sign In to Dashboard
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">11</div>
                <div className="text-sm text-gray-600 font-medium">Regional Offices</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">4</div>
                <div className="text-sm text-gray-600 font-medium">Record Types</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-700">24/7</div>
                <div className="text-sm text-gray-600 font-medium">System Access</div>
              </div>
            </div>
          </div>

          {/* Right Content - Visual */}
          <div className="relative">
            <div className="relative z-10">
              {/* Main Card */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-gray-200">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">System Dashboard</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-danger-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200">
                      <div className="text-2xl font-bold text-pink-700">Births</div>
                      <div className="text-sm text-pink-600 font-medium">Registration</div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-gray-700">Deaths</div>
                      <div className="text-sm text-gray-600 font-medium">Certification</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                      <div className="text-2xl font-bold text-red-700">Marriages</div>
                      <div className="text-sm text-red-600 font-medium">Licensing</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                      <div className="text-2xl font-bold text-orange-700">Divorces</div>
                      <div className="text-sm text-orange-600 font-medium">Processing</div>
                    </div>
                  </div>
                  
                  {/* Chart Placeholder */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 h-32 flex items-center justify-center border border-gray-200">
                    <div className="text-gray-600 text-sm font-medium">📊 Real-time Analytics</div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-blue-400 to-green-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </section>
  );
};

export default Hero;