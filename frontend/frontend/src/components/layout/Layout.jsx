import React, { useState, Fragment } from 'react';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  CalendarIcon,
  UsersIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  UserCircleIcon,
  BellIcon,
  MagnifyingGlassIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import LanguageSelector from '../common/LanguageSelector';
import logo from '../../assets/ethiopia-flag.png';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Base navigation items available to all users
  const baseNavigation = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: HomeIcon, current: location.pathname === '/dashboard' },
    { name: t('nav.birthRecords'), href: '/births', icon: UserGroupIcon, current: location.pathname.startsWith('/births') },
    { name: t('nav.deathRecords'), href: '/deaths', icon: DocumentTextIcon, current: location.pathname.startsWith('/deaths') },
    { name: t('nav.marriageRecords'), href: '/marriages', icon: ChartBarIcon, current: location.pathname.startsWith('/marriages') },
    { name: t('nav.divorceRecords'), href: '/divorces', icon: CalendarIcon, current: location.pathname.startsWith('/divorces') },
  ];
  
  // Certificates - not available for statisticians (view-only role)
  const certificatesNavigation = user?.role !== 'statistician' ? [
    { name: t('nav.certificates'), href: '/certificates', icon: DocumentCheckIcon, current: location.pathname.startsWith('/certificates') },
  ] : [];

  // Admin-only navigation items
  const adminNavigation = [
    { name: t('nav.users'), href: '/users', icon: UsersIcon, current: location.pathname.startsWith('/users'), roles: ['admin'] },
    { name: t('nav.reports'), href: '/admin/reports', icon: DocumentCheckIcon, current: location.pathname.startsWith('/admin/reports'), roles: ['admin'] },
  ];

  // Settings available to all
  const settingsNavigation = [
    { name: t('nav.settings'), href: '/settings', icon: CogIcon, current: location.pathname.startsWith('/settings') },
  ];

  // Filter navigation based on user role
  const navigation = [
    ...baseNavigation,
    ...certificatesNavigation,
    ...(user?.role === 'admin' ? adminNavigation : []),
    ...settingsNavigation
  ];
  
  const userNavigation = [
    { name: t('nav.settings'), href: '/settings' },
    { name: t('nav.logout'), href: '#', onClick: logout },
  ];

  const handleLogout = () => {
    logout();
  };

  // Get role-specific branding
  const getRoleBranding = () => {
    switch (user?.role) {
      case 'admin':
        return {
          title: t('roles.adminPortal'),
          subtitle: t('roles.systemAdministration'),
          bgColor: 'bg-gradient-to-b from-red-600 to-red-700',
          accentColor: 'bg-red-500',
          badgeColor: 'bg-red-100 text-red-800'
        };
      case 'vms_officer':
        return {
          title: t('roles.vmsOfficer'),
          subtitle: t('roles.recordsManagement'),
          bgColor: 'bg-gradient-to-b from-blue-600 to-blue-700',
          accentColor: 'bg-blue-500',
          badgeColor: 'bg-blue-100 text-blue-800'
        };
      case 'statistician':
        return {
          title: t('roles.statistician'),
          subtitle: t('roles.dataAnalytics'),
          bgColor: 'bg-gradient-to-b from-purple-600 to-purple-700',
          accentColor: 'bg-purple-500',
          badgeColor: 'bg-purple-100 text-purple-800'
        };
      case 'clerk':
        return {
          title: t('roles.clerkPortal'),
          subtitle: t('roles.dataEntry'),
          bgColor: 'bg-gradient-to-b from-teal-600 to-teal-700',
          accentColor: 'bg-teal-500',
          badgeColor: 'bg-teal-100 text-teal-800'
        };
      default:
        return {
          title: t('roles.vitalRecords'),
          subtitle: t('roles.managementSystem'),
          bgColor: 'bg-gradient-to-b from-ethiopia-green to-green-700',
          accentColor: 'bg-ethiopia-yellow',
          badgeColor: 'bg-green-100 text-green-800'
        };
    }
  };

  const branding = getRoleBranding();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <div className={`fixed inset-0 z-40 flex ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)}></div>
          <div className={`relative flex w-80 flex-1 flex-col ${branding.bgColor}`}>
            <div className="absolute right-0 top-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
              <div className="flex flex-col px-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-shrink-0">
                    <img className="h-10 w-16 object-cover shadow-xl rounded-md border-2 border-white/30 ring-2 ring-white/10" src={logo} alt="Ethiopia Flag" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-bold text-white leading-tight">{branding.title}</h1>
                    <p className="text-xs text-white/70 font-medium mt-0.5">{branding.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-xs text-white/80 font-medium">{t('roles.systemActive')}</span>
                </div>
              </div>
              <nav className="mt-8 space-y-1.5 px-3">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      item.current
                        ? 'bg-gradient-to-r from-ethiopia-yellow/25 to-ethiopia-yellow/10 text-white shadow-lg border-l-4 border-ethiopia-yellow'
                        : 'text-white/80 hover:bg-white/10 hover:text-white border-l-4 border-transparent',
                      'group flex items-center rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 hover:shadow-md hover:translate-x-1'
                    )}
                  >
                    <item.icon
                      className={classNames(
                        item.current ? 'text-ethiopia-yellow' : 'text-white/70 group-hover:text-white',
                        'mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex flex-shrink-0 border-t border-white/10 p-4">
              <div className="group block w-full">
                <div className="flex items-center">
                  {user?.profile_photo ? (
                    <img
                      src={user.profile_photo}
                      alt={user?.full_name}
                      className="h-10 w-10 rounded-full object-cover border-2 border-white/20"
                    />
                  ) : (
                    <div className={`h-10 w-10 rounded-full ${branding.accentColor} flex items-center justify-center text-white font-medium shadow-lg`}>
                      {user?.full_name?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-white">
                      {user?.full_name || user?.fullName || 'User'}
                    </p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${branding.badgeColor}`}>
                      {user?.role === 'vms_officer' ? 'VMS Officer' : 
                       user?.role === 'admin' ? 'Administrator' : 
                       user?.role === 'statistician' ? 'Statistician' : 
                       user?.role === 'clerk' ? 'Clerk' : 
                       user?.role || 'User'}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="ml-2 flex items-center text-sm font-medium text-white/80 hover:text-white"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className={`flex min-h-0 flex-1 flex-col ${branding.bgColor}`}>
          <div className="flex flex-col px-6 py-6 border-b border-white/10 bg-gradient-to-b from-black/10 to-transparent">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-shrink-0">
                <img className="h-10 w-16 object-cover shadow-xl rounded-md border-2 border-white/30 ring-2 ring-white/10" src={logo} alt="Ethiopia Flag" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-white leading-tight">{branding.title}</h1>
                <p className="text-xs text-white/70 font-medium mt-0.5">{branding.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs text-white/80 font-medium">{t('roles.systemActive')}</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-1.5 px-3 py-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    item.current
                      ? 'bg-gradient-to-r from-ethiopia-yellow/25 to-ethiopia-yellow/10 text-white shadow-lg border-l-4 border-ethiopia-yellow'
                      : 'text-white/80 hover:bg-white/10 hover:text-white border-l-4 border-transparent',
                    'group flex items-center rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 hover:shadow-md hover:translate-x-1'
                  )}
                >
                  <item.icon
                    className={classNames(
                      item.current ? 'text-ethiopia-yellow' : 'text-white/70 group-hover:text-white',
                      'mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-white/10 p-4 bg-gradient-to-t from-black/10 to-transparent">
            <div className="group block w-full">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10 hover:border-white/20">
                {user?.profile_photo ? (
                  <img
                    src={user.profile_photo}
                    alt={user?.full_name}
                    className="h-12 w-12 rounded-xl object-cover border-2 border-white/30 shadow-lg ring-2 ring-white/10"
                  />
                ) : (
                  <div className={`h-12 w-12 rounded-xl ${branding.accentColor} flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white/20`}>
                    {user?.full_name?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {user?.full_name || user?.fullName || 'User'}
                  </p>
                  <span className={`inline-block mt-1 px-2.5 py-1 text-xs font-bold rounded-full ${branding.badgeColor} shadow-sm`}>
                    {user?.role === 'vms_officer' ? 'VMS Officer' : 
                     user?.role === 'admin' ? 'Administrator' : 
                     user?.role === 'statistician' ? 'Statistician' : 
                     user?.role === 'clerk' ? 'Clerk' : 
                     user?.role || 'User'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex h-20 flex-shrink-0 bg-white border-b border-gray-200 shadow-md">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 lg:hidden transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex flex-1 justify-between px-6 items-center">
            <div className="flex flex-1 items-center">
              <div className="flex w-full max-w-2xl">
                <label htmlFor="search" className="sr-only">
                  Search
                </label>
                <div className="relative w-full">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full rounded-xl border-0 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-500 focus:bg-white sm:text-sm transition-all"
                    placeholder="Search records, certificates, users..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            <div className="ml-6 flex items-center gap-3">
              {/* Language Selector */}
              <LanguageSelector />
              
              {/* Notifications */}
              <button
                type="button"
                className="relative rounded-xl bg-gray-50 p-2.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>

              {/* Profile dropdown */}
              <Menu as="div" className="relative">
                <div>
                  <Menu.Button className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-2.5 text-sm hover:from-purple-100 hover:to-indigo-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all border border-purple-100">
                    <span className="sr-only">Open user menu</span>
                    {user?.profile_photo ? (
                      <img
                        src={user.profile_photo}
                        alt={user?.full_name}
                        className="h-9 w-9 rounded-lg object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className={`h-9 w-9 rounded-lg ${branding.accentColor} text-white flex items-center justify-center font-semibold shadow-sm text-sm`}>
                        {user?.full_name?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.full_name || user?.fullName || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user?.role === 'vms_officer' ? 'VMS Officer' : user?.role?.replace('_', ' ')}
                      </p>
                    </div>
                    <ChevronDownIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-3 w-64 origin-top-right rounded-xl bg-white py-2 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                      <p className="text-sm font-semibold text-gray-900">{user?.full_name || user?.fullName}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{user?.email}</p>
                      <span className={`inline-block mt-2 px-2.5 py-1 text-xs font-semibold rounded-full ${branding.badgeColor}`}>
                        {user?.role === 'vms_officer' ? 'VMS Officer' : 
                         user?.role === 'admin' ? 'Administrator' : 
                         user?.role === 'statistician' ? 'Statistician' : 
                         user?.role === 'clerk' ? 'Clerk' : 
                         user?.role || 'User'}
                      </span>
                    </div>
                    
                    {/* Menu Items */}
                    {userNavigation.map((item) => (
                      <Menu.Item key={item.name}>
                        {({ active }) => (
                          <Link
                            to={item.href}
                            onClick={(e) => {
                              if (item.onClick) {
                                e.preventDefault();
                                item.onClick();
                              }
                            }}
                            className={classNames(
                              active ? 'bg-purple-50 text-purple-700' : 'text-gray-700',
                              item.name === 'Sign out' ? 'text-red-600 hover:bg-red-50 hover:text-red-700 border-t border-gray-100 mt-1' : '',
                              'block px-4 py-2.5 text-sm font-medium transition-colors'
                            )}
                          >
                            <span className="flex items-center gap-2">
                              {item.name === 'Settings' && <CogIcon className="h-4 w-4" />}
                              {item.name === 'Sign out' && <ArrowRightOnRectangleIcon className="h-4 w-4" />}
                              {item.name}
                            </span>
                          </Link>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>

        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;



