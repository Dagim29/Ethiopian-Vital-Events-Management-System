import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRightIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import LoginModal from '../auth/LoginModal';

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const features = [
    { text: t('landing.hero.features.automated'), icon: '📋' },
    { text: t('landing.hero.features.workflow'), icon: '✅' },
    { text: t('landing.hero.features.access'), icon: '🔐' },
    { text: t('landing.hero.features.analytics'), icon: '📊' },
    { text: t('landing.hero.features.storage'), icon: '☁️' },
    { text: t('landing.hero.features.language'), icon: '🌐' }
  ];

  const stats = [
    { number: "11", label: t('landing.hero.stats.regions'), icon: "🏛️", textColor: "text-blue-600", bgColor: "bg-blue-50" },
    { number: "4", label: t('landing.hero.stats.recordTypes'), icon: "📋", textColor: "text-green-600", bgColor: "bg-green-50" },
    { number: "24/7", label: t('landing.hero.stats.access'), icon: "🔒", textColor: "text-purple-600", bgColor: "bg-purple-50" }
  ];

  const dashboardStats = [
    { title: t('landing.hero.dashboard.births'), count: "2,847", textColor: "text-pink-700", bgColor: "bg-pink-50", borderColor: "border-pink-200", trend: "+12%", icon: "👶" },
    { title: t('landing.hero.dashboard.deaths'), count: "1,203", textColor: "text-gray-700", bgColor: "bg-gray-50", borderColor: "border-gray-200", trend: "+8%", icon: "🕊️" },
    { title: t('landing.hero.dashboard.marriages'), count: "956", textColor: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200", trend: "+15%", icon: "💑" },
    { title: t('landing.hero.dashboard.divorces'), count: "234", textColor: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200", trend: "+3%", icon: "📄" }
  ];

  const handleLoginSuccess = () => {
    setLoginModalOpen(false);
    navigate('/dashboard');
  };

  return (
    <section 
      id="home" 
      className="relative bg-gradient-to-br from-green-50/80 via-yellow-50/40 to-red-50/30 overflow-hidden"
      aria-label="Hero section - Ethiopian Vital Management System"
    >
      {/* Enhanced Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Ethiopian flag inspired gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-yellow-50/40 to-red-50/30"></div>
        
        {/* Geometric patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        {/* Floating elements - hidden on mobile for performance */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-full blur-xl animate-pulse hidden md:block"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-r from-yellow-400/20 to-red-500/20 rounded-full blur-xl animate-pulse hidden md:block" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/90 backdrop-blur-sm border-2 border-green-200 shadow-lg">
                <div className="w-6 h-6 mr-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold" aria-label="Ethiopian flag">🇪🇹</span>
                </div>
                <span className="text-sm font-bold text-green-800 tracking-wide">
                  {t('landing.hero.badge')}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-gray-900 leading-[0.9] tracking-tight">
                <span className="block text-gray-800">{t('landing.hero.title1')}</span>
                <span className="block bg-gradient-to-r from-green-600 via-blue-600 to-green-700 bg-clip-text text-transparent font-extrabold">
                  {t('landing.hero.title2')}
                </span>
                <span className="block text-gray-700 text-xl md:text-3xl lg:text-5xl font-bold mt-2">
                  {t('landing.hero.title3')}
                </span>
              </h1>
              
              <p className="text-xl text-gray-700 leading-relaxed max-w-2xl">
                {t('landing.hero.description')}
              </p>
            </div>

            {/* Enhanced Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {features.map((feature, index) => (
                <div key={index} className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-white/50 transition-all duration-300">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-sm" aria-hidden="true">{feature.icon}</span>
                  </div>
                  <span className="text-gray-800 font-semibold group-hover:text-green-700 transition-colors">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Enhanced CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Button 
                size="xl" 
                onClick={() => setLoginModalOpen(true)}
                className="group bg-gradient-to-r from-green-600 via-green-700 to-blue-700 hover:from-green-700 hover:via-green-800 hover:to-blue-800 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 font-bold text-lg px-8 py-4 rounded-2xl border-2 border-green-500/20 focus:ring-4 focus:ring-green-300 focus:outline-none"
                aria-label={t('landing.hero.cta')}
              >
                <span className="flex items-center">
                  {t('landing.hero.cta')}
                  <ArrowRightIcon className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              {stats.map((stat, index) => (
                <div key={index} className={`group text-center p-4 rounded-xl hover:${stat.bgColor} transition-all duration-300`}>
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform" aria-hidden="true">
                    {stat.icon}
                  </div>
                  <div className={`text-3xl font-black ${stat.textColor} mb-1`}>
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 font-semibold uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Right Content - Professional Dashboard */}
          <div className="relative mt-8 lg:mt-0">
            <div className="relative z-10">
              {/* Enhanced Main Card */}
              <div className="bg-white rounded-3xl shadow-2xl p-4 lg:p-6 border border-gray-200 overflow-hidden max-w-lg mx-auto lg:mx-0">
                {/* Header with Ethiopian colors */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-yellow-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">VMS</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{t('landing.dashboard.title')}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500 font-medium">{t('landing.hero.stats.live')}</span>
                  </div>
                </div>
                
                {/* Enhanced stats grid */}
                <div className="grid grid-cols-2 gap-2 lg:gap-3 mb-4">
                  {dashboardStats.map((item, index) => (
                    <div key={index} className={`${item.bgColor} ${item.borderColor} p-3 rounded-xl border group hover:shadow-md transition-all`}>
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg" aria-hidden="true">{item.icon}</span>
                          <div className={`text-lg font-black ${item.textColor}`}>{item.count}</div>
                        </div>
                        <div className="text-xs text-green-600 font-bold bg-green-100 px-2 py-1 rounded-full">
                          {item.trend}
                        </div>
                      </div>
                      <div className={`text-xs ${item.textColor} font-semibold`}>{item.title}</div>
                    </div>
                  ))}
                </div>
                
                {/* Enhanced mini chart */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-700 flex items-center">
                      <ChartBarIcon className="w-4 h-4 mr-1" />
                      {t('landing.dashboard.trends')}
                    </span>
                    <span className="text-xs text-gray-500">2024</span>
                  </div>
                  <div className="flex items-end space-x-1 h-8">
                    {[...Array(12)].map((_, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-gradient-to-t from-blue-400 to-green-500 rounded-sm opacity-70 hover:opacity-100 transition-opacity" 
                        style={{height: `${Math.random() * 70 + 30}%`}}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced Floating Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-green-400/30 to-blue-500/30 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-r from-yellow-400/30 to-red-500/30 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
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