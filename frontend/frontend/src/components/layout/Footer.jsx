import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-gradient-to-r from-ethiopian-green via-ethiopian-yellow to-ethiopian-red rounded-full flex items-center justify-center mr-3">
                <span className="text-lg font-bold text-white">VMS</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">{t('footer.title')}</h3>
                <p className="text-sm text-gray-400">{t('footer.subtitle')}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li><a href="#home" className="text-gray-400 hover:text-white transition-colors">{t('footer.home')}</a></li>
              <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">{t('footer.features')}</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">{t('footer.aboutUs')}</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">{t('footer.contact')}</a></li>
              <li><a href="#help" className="text-gray-400 hover:text-white transition-colors">{t('footer.helpCenter')}</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.services')}</h4>
            <ul className="space-y-2">
              <li><a href="#birth" className="text-gray-400 hover:text-white transition-colors">{t('footer.birthRegistration')}</a></li>
              <li><a href="#death" className="text-gray-400 hover:text-white transition-colors">{t('footer.deathRegistration')}</a></li>
              <li><a href="#marriage" className="text-gray-400 hover:text-white transition-colors">{t('footer.marriageRegistration')}</a></li>
              <li><a href="#divorce" className="text-gray-400 hover:text-white transition-colors">{t('footer.divorceRegistration')}</a></li>
              <li><a href="#certificates" className="text-gray-400 hover:text-white transition-colors">{t('footer.certificateGeneration')}</a></li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-primary-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-sm text-gray-400">{t('footer.address')}</p>
                <p className="text-sm">{t('footer.addressValue')}</p>
              </div>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-primary-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <p className="text-sm text-gray-400">{t('footer.phone')}</p>
                <p className="text-sm">{t('footer.phoneValue')}</p>
              </div>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-primary-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm text-gray-400">{t('footer.email')}</p>
                <p className="text-sm">{t('footer.emailValue')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © {currentYear} {t('footer.copyright')}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#privacy" className="text-sm text-gray-400 hover:text-white transition-colors">{t('footer.privacyPolicy')}</a>
            <a href="#terms" className="text-sm text-gray-400 hover:text-white transition-colors">{t('footer.termsOfService')}</a>
            <a href="#accessibility" className="text-sm text-gray-400 hover:text-white transition-colors">{t('footer.accessibility')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

