import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaSolarPanel, FaTools, FaClipboardCheck } from 'react-icons/fa';
import { ArrowRight } from 'lucide-react';

const ServicesSection = () => {
  const { t } = useTranslation();
  const { direction } = useLanguage();

  const services = [
    {
      icon: <FaSolarPanel className="text-2xl" />,
      titleKey: 'services.installTitle',
      descriptionKey: 'services.installDesc',
      type: 'installation'
    },
    {
      icon: <FaTools className="text-2xl" />,
      titleKey: 'services.maintenanceTitle',
      descriptionKey: 'services.maintenanceDesc',
      type: 'maintenance'
    },
    {
      icon: <FaClipboardCheck className="text-2xl" />,
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
              <div className="bg-primary bg-opacity-10 text-primary text-2xl p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
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
                <ArrowRight className={`ml-2 h-4 w-4 ${direction === 'rtl' ? 'transform rotate-180' : ''}`} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
