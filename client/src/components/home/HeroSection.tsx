import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';

const HeroSection = () => {
  const { t } = useTranslation();
  const { direction } = useLanguage();

  return (
    <section id="home" className="relative bg-gradient-to-r from-primary to-secondary text-white py-16 md:py-24">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <img
          src="https://images.unsplash.com/photo-1611365892117-bede7a4f1651?auto=format&fit=crop&w=1200&q=80"
          alt="Solar panels on rooftop"
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = 'https://images.pexels.com/photos/9875441/pexels-photo-9875441.jpeg?auto=compress&cs=tinysrgb&w=1200';
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('hero.title')}
          </h1>
          <p className="text-lg mb-8">
            {t('hero.subtitle')}
          </p>
          <div className={`flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 ${direction === 'rtl' ? 'sm:space-x-reverse' : ''}`}>
            <Link 
              href="/request-service" 
              className="bg-yellow-500 text-neutral-800 font-bold py-3 px-6 rounded-md text-center hover:bg-opacity-90 transition-colors"
            >
              {t('hero.exploreServices')}
            </Link>
            <Link 
              href="/technicians" 
              className="bg-white text-primary font-bold py-3 px-6 rounded-md text-center hover:bg-opacity-90 transition-colors"
            >
              {t('hero.findTechnicians')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
