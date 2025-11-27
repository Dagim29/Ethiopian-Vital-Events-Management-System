import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, UserIcon, LanguageIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
    { code: 'om', name: 'Afaan Oromoo', flag: '🇪🇹' },
    { code: 'ti', name: 'ትግርኛ', flag: '🇪🇹' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setLangMenuOpen(false);
    localStorage.setItem('language', langCode);
  };

  const navigation = [
    { name: t('header.home'), href: '#home' },
    { name: t('header.features'), href: '#features' },
    { name: t('header.about'), href: '#about' },
    { name: t('header.contact'), href: '#contact' },
  ];

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const handleLoginSuccess = () => {
    setLoginModalOpen(false);
    navigate('/dashboard');
  };

  return (
    <>
      <header className="bg-white shadow-xl sticky top-0 z-50 border-b-2 border-gray-100">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
          <div className="flex w-full items-center justify-between py-5">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <div className="flex-shrink-0">
                <div className="h-14 w-14 bg-gradient-to-br from-green-600 via-yellow-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 transform group-hover:scale-105">
                  <span className="text-2xl font-black text-white">VMS</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">{t('header.title')}</h1>
                <p className="text-xs text-gray-600 font-medium">🇪🇹 {t('header.subtitle')}</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-green-700 hover:bg-green-50 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex md:items-center md:space-x-3">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all duration-200"
                  title={t('header.changeLanguage')}
                >
                  <LanguageIcon className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-700">{currentLanguage.flag} {currentLanguage.name}</span>
                </button>

                {/* Language Dropdown */}
                {langMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                          i18n.language === lang.code
                            ? 'bg-green-50 text-green-700 font-bold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border-2 border-blue-200 transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                  >
                    <div className="h-10 w-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                      <UserIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-bold text-gray-900 block">{user?.full_name}</span>
                      <span className="text-xs text-gray-600">{user?.role}</span>
                    </div>
                  </button>

                  {/* User Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 py-2 z-50 animate-in slide-in-from-top-2">
                      <div className="px-5 py-4 border-b-2 border-gray-100 bg-gradient-to-r from-blue-50 to-green-50">
                        <p className="text-base font-bold text-gray-900">{user?.full_name}</p>
                        <p className="text-xs text-gray-600 mt-1">{user?.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">{user?.role}</span>
                      </div>
                      <Link
                        to="/dashboard"
                        className="block px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        📊 {t('header.dashboard')}
                      </Link>
                      {/* <Link
                        to="/births"
                        className="block px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        📋 Birth Records
                      </Link> */}
                      <div className="border-t-2 border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors rounded-b-2xl"
                        >
                          🚪 {t('header.signOut')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => setLoginModalOpen(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  {t('header.signIn')}
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="text-gray-700 hover:text-primary-600"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">{t('header.openMenu')}</span>
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                
                {/* Mobile Language Selector */}
                <div className="pt-4 pb-2 border-t border-gray-200">
                  <p className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">{t('header.language')}</p>
                  <div className="space-y-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang.code);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          i18n.language === lang.code
                            ? 'bg-green-50 text-green-700 font-bold'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 space-y-2 border-t border-gray-200">
                  {isAuthenticated ? (
                    <>
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('header.dashboard')}
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        {t('header.signOut')}
                      </button>
                    </>
                  ) : (
                    <button 
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      onClick={() => {
                        setLoginModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                    >
                      {t('header.signIn')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Modals */}
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
        onSwitchToRegister={() => {
          setLoginModalOpen(false);
          setRegisterModalOpen(true);
        }}
      />
      <RegisterModal 
        isOpen={registerModalOpen} 
        onClose={() => setRegisterModalOpen(false)} 
        onSwitchToLogin={() => {
          setRegisterModalOpen(false);
          setLoginModalOpen(true);
        }}
      />
    </>
  );
};

export default Header;