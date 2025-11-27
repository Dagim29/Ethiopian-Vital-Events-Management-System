import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';

const Landing = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      <Header />
      <main>
        <Hero />
        <Features />
        
        {/* About Section */}
        <section id="about" className="py-24 bg-gradient-to-br from-gray-50 via-blue-50/40 to-green-50/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-blue-100 border border-green-200 mb-6">
                  <span className="text-sm font-bold text-green-700" role="img" aria-label="Ethiopian flag">🇪🇹 {t('landing.about.badge')}</span>
                </div>
                <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {t('landing.about.title1')}
                  <span className="block bg-gradient-to-r from-green-600 via-blue-600 to-green-700 bg-clip-text text-transparent mt-2">
                    {t('landing.about.title2')}
                  </span>
                </h2>
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                  {t('landing.about.description1')}
                </p>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {t('landing.about.description2')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl font-bold hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 shadow-lg">
                    {t('landing.about.learnMore')}
                  </button>
                  <a 
                    href="https://github.com/Dagim29/Ethiopian-Vital-Events-Management-System"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center border-2 border-green-600 text-green-700 px-8 py-4 rounded-xl font-bold hover:bg-green-600 hover:text-white transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    {t('landing.about.viewDocs')}
                  </a>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl opacity-20 blur-2xl"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-10 border-2 border-gray-200">
                  <div className="space-y-8">
                    <div className="text-center">
                      <h3 className="text-3xl font-bold text-gray-900">{t('landing.about.statsTitle')}</h3>
                      <p className="text-gray-600 mt-2">{t('landing.about.statsSubtitle')}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center p-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200 border border-pink-400">
                        <div className="text-5xl font-black text-white" role="img" aria-label="Birth">🎂</div>
                        <div className="text-sm font-semibold text-pink-50 mt-3">{t('landing.hero.dashboard.births')}</div>
                      </div>
                      <div className="text-center p-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200 border border-gray-400">
                        <div className="text-5xl font-black text-white" role="img" aria-label="Death">🕊️</div>
                        <div className="text-sm font-semibold text-gray-50 mt-3">{t('landing.hero.dashboard.deaths')}</div>
                      </div>
                      <div className="text-center p-8 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200 border border-red-400">
                        <div className="text-5xl font-black text-white" role="img" aria-label="Marriage">💑</div>
                        <div className="text-sm font-semibold text-red-50 mt-3">{t('landing.hero.dashboard.marriages')}</div>
                      </div>
                      <div className="text-center p-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200 border border-orange-400">
                        <div className="text-5xl font-black text-white" role="img" aria-label="Divorce">📋</div>
                        <div className="text-sm font-semibold text-orange-50 mt-3">{t('landing.hero.dashboard.divorces')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 bg-gradient-to-br from-green-600 via-blue-600 to-green-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 mb-6">
                <span className="text-sm font-bold text-white" role="img" aria-label="Contact">✉️ {t('landing.contact.badge')}</span>
              </div>
              <h2 className="text-5xl font-bold text-white mb-6">
                {t('landing.contact.title')}
              </h2>
              <p className="text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
                {t('landing.contact.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button className="bg-white text-green-700 px-10 py-4 rounded-xl font-bold hover:bg-gray-50 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-200 text-lg">
                  {t('landing.contact.support')}
                </button>
                <button className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold hover:bg-white hover:text-green-700 transition-all duration-200 shadow-xl hover:shadow-2xl text-lg">
                  {t('landing.contact.meeting')}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;

