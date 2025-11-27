import { 
  DocumentTextIcon, 
  UserGroupIcon, 
  ShieldCheckIcon, 
  ChartBarIcon,
  GlobeAltIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const Features = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: DocumentTextIcon,
      title: t('landing.features.feature1Title'),
      description: t('landing.features.feature1Description'),
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-600'
    },
    {
      icon: UserGroupIcon,
      title: t('landing.features.feature2Title'),
      description: t('landing.features.feature2Description'),
      color: 'from-success-500 to-success-600',
      bgColor: 'bg-success-50',
      textColor: 'text-success-600'
    },
    {
      icon: ShieldCheckIcon,
      title: t('landing.features.feature3Title'),
      description: t('landing.features.feature3Description'),
      color: 'from-danger-500 to-danger-600',
      bgColor: 'bg-danger-50',
      textColor: 'text-danger-600'
    },
    {
      icon: ChartBarIcon,
      title: t('landing.features.feature4Title'),
      description: t('landing.features.feature4Description'),
      color: 'from-warning-500 to-warning-600',
      bgColor: 'bg-warning-50',
      textColor: 'text-warning-600'
    },
    {
      icon: GlobeAltIcon,
      title: t('landing.features.feature5Title'),
      description: t('landing.features.feature5Description'),
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      icon: ClockIcon,
      title: t('landing.features.feature6Title'),
      description: t('landing.features.feature6Description'),
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('landing.features.sectionTitle1')}
            <span className="block bg-gradient-to-r from-green-600 via-blue-600 to-green-700 bg-clip-text text-transparent">
              {t('landing.features.sectionTitle2')}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('landing.features.sectionDescription')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-green-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`h-8 w-8 ${feature.textColor}`} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-green-700 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-green-50 via-blue-50/30 to-green-50 rounded-2xl p-8 border-2 border-green-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t('landing.features.ctaTitle')}
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              {t('landing.features.ctaDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                {t('landing.features.requestAccess')}
              </button>
              <button className="border-2 border-green-600 text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-green-600 hover:text-white transition-all duration-200">
                {t('landing.features.viewDocs')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;

