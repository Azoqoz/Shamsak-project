import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
// Enhanced Lucide icons for solar services
import { PanelTop, Wrench, Gauge, ArrowRight } from 'lucide-react';

const ServicesSection = () => {
  const { t } = useTranslation();
  const { direction } = useLanguage();

  const services = [
    {
      icon: <PanelTop className="h-8 w-8" />,
      titleKey: 'services.installTitle',
      descriptionKey: 'services.installDesc',
      type: 'installation'
    },
    {
      icon: <Wrench className="h-8 w-8" />,
      titleKey: 'services.maintenanceTitle',
      descriptionKey: 'services.maintenanceDesc',
      type: 'maintenance'
    },
    {
      icon: <Gauge className="h-8 w-8" />,
      titleKey: 'services.assessmentTitle',
      descriptionKey: 'services.assessmentDesc',
      type: 'assessment'
    }
  ];

  return (
    <section id="services" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-800 mb-4">
            {t('services.title')}
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all hover:transform hover:-translate-y-1 group"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-sunny-yellow bg-opacity-20 rounded-lg transform group-hover:scale-110 transition-transform"></div>
                <div className="bg-eco-green text-white p-5 rounded-xl w-20 h-20 flex items-center justify-center shadow-md relative z-10 transform group-hover:rotate-3 transition-transform">
                  {service.icon}
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-eco-green transition-colors">
                {t(service.titleKey)}
              </h3>
              <div className="bg-gray-50 p-4 rounded-md my-4 min-h-[100px] flex items-center">
                <p className="text-neutral-600">
                  {t(service.descriptionKey)}
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <Link 
                  href={`/request-service?service=${service.type}`} 
                  className="bg-sunny-yellow text-neutral-900 font-medium px-5 py-2 rounded-md inline-flex items-center hover:bg-opacity-90 transition-all group-hover:shadow-md"
                >
                  {t('services.requestService')}
                  <ArrowRight className={`${direction === 'rtl' ? 'mr-2 transform rotate-180' : 'ml-2'} h-4 w-4 transform group-hover:translate-x-1 transition-transform`} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
