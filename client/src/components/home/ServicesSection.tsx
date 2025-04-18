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
    <section id="services" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-800 mb-4">
            {t('services.title')}
          </h2>
          <p className="text-lg text-neutral-800 max-w-2xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="bg-green-600 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 shadow-md">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">
                {t(service.titleKey)}
              </h3>
              <p className="text-neutral-800 mb-4">
                {t(service.descriptionKey)}
              </p>
              <Link 
                href={`/request-service?service=${service.type}`} 
                className="text-primary hover:underline flex items-center"
              >
                {t('services.requestService')}
                <ArrowRight className={`${direction === 'rtl' ? 'mr-2 transform rotate-180' : 'ml-2'} h-4 w-4`} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
