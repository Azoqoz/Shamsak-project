import { useTranslation } from 'react-i18next';
import { FaCertificate, FaMapMarkerAlt, FaLeaf } from 'react-icons/fa';

const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <FaCertificate className="text-3xl text-yellow-500" />,
      titleKey: 'features.certifiedTitle',
      descriptionKey: 'features.certifiedDesc'
    },
    {
      icon: <FaMapMarkerAlt className="text-3xl text-yellow-500" />,
      titleKey: 'features.localTitle',
      descriptionKey: 'features.localDesc'
    },
    {
      icon: <FaLeaf className="text-3xl text-yellow-500" />,
      titleKey: 'features.sustainableTitle',
      descriptionKey: 'features.sustainableDesc'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-800 mb-4">
            {t('features.title')}
          </h2>
          <p className="text-lg text-neutral-800 max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-neutral-100 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-accent text-3xl mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">
                {t(feature.titleKey)}
              </h3>
              <p className="text-neutral-800">
                {t(feature.descriptionKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
