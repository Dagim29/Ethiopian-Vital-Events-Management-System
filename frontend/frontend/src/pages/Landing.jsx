import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';

const Landing = () => {
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
                  <span className="text-sm font-bold text-green-700">🇪🇹 About VMS</span>
                </div>
                <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Modernizing
                  <span className="block bg-gradient-to-r from-green-600 via-blue-600 to-green-700 bg-clip-text text-transparent mt-2">
                    Civil Registration
                  </span>
                </h2>
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                  The Ethiopian Vital Management System (VMS) is a government initiative to digitize 
                  and streamline civil registration services. This secure platform enables authorized 
                  officials to efficiently manage vital records while maintaining data integrity and privacy.
                </p>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Supporting birth registrations, death certifications, marriage licenses, and divorce 
                  proceedings, VMS provides a unified system for all vital statistics operations across 
                  Ethiopian regions, woredas, and kebeles.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl font-bold hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 shadow-lg">
                    Learn More
                  </button>
                  <button className="border-2 border-green-600 text-green-700 px-8 py-4 rounded-xl font-bold hover:bg-green-600 hover:text-white transition-all duration-200 shadow-md hover:shadow-lg">
                    View Documentation
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl opacity-20 blur-2xl"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-10 border-2 border-gray-200">
                  <div className="space-y-8">
                    <div className="text-center">
                      <h3 className="text-3xl font-bold text-gray-900">System Statistics</h3>
                      <p className="text-gray-600 mt-2">Real-time performance metrics</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center p-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200 border border-pink-400">
                        <div className="text-5xl font-black text-white">🎂</div>
                        <div className="text-sm font-semibold text-pink-50 mt-3">Birth Records</div>
                      </div>
                      <div className="text-center p-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200 border border-gray-400">
                        <div className="text-5xl font-black text-white">🕊️</div>
                        <div className="text-sm font-semibold text-gray-50 mt-3">Death Certificates</div>
                      </div>
                      <div className="text-center p-8 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200 border border-red-400">
                        <div className="text-5xl font-black text-white">💑</div>
                        <div className="text-sm font-semibold text-red-50 mt-3">Marriage Licenses</div>
                      </div>
                      <div className="text-center p-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-200 border border-orange-400">
                        <div className="text-5xl font-black text-white">📋</div>
                        <div className="text-sm font-semibold text-orange-50 mt-3">Divorce Records</div>
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
                <span className="text-sm font-bold text-white">✉️ Get In Touch</span>
              </div>
              <h2 className="text-5xl font-bold text-white mb-6">
                Get Started Today
              </h2>
              <p className="text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
                VMS is exclusively for authorized government officials. Contact your regional 
                administrator for system access credentials and training. Technical support 
                available 24/7 for all registered users.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button className="bg-white text-green-700 px-10 py-4 rounded-xl font-bold hover:bg-gray-50 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-200 text-lg">
                  Contact Support
                </button>
                <button className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold hover:bg-white hover:text-green-700 transition-all duration-200 shadow-xl hover:shadow-2xl text-lg">
                  Schedule Meeting
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

