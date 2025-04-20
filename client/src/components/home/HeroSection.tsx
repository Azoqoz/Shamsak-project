import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';

const HeroSection = () => {
  const { t } = useTranslation();
  const { direction } = useLanguage();

  return (
    <section id="home" className="relative bg-gradient-to-r from-primary to-secondary text-white py-16 md:py-28 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <img
          src="https://images.unsplash.com/photo-1611365892117-bede7a4f1651?auto=format&fit=crop&w=1200&q=80"
          alt="Solar panels on rooftop"
          className="w-full h-full object-cover transform scale-105 hover:scale-100 transition-transform duration-10000"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = 'https://images.pexels.com/photos/9875441/pexels-photo-9875441.jpeg?auto=compress&cs=tinysrgb&w=1200';
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-7/12 lg:w-6/12 mb-10 md:mb-0 md:pr-8">
            <div className="bg-black bg-opacity-25 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-white border-opacity-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                {t('hero.title')}
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-100">
                {t('hero.subtitle')}
              </p>
              <div className={`flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 ${direction === 'rtl' ? 'sm:space-x-reverse' : ''}`}>
                <Link 
                  href="/request-service" 
                  className="bg-yellow-500 text-neutral-800 font-bold py-4 px-8 rounded-md text-center hover:bg-yellow-400 transition-colors hover:shadow-lg transform hover:-translate-y-1 transition-transform"
                >
                  {t('hero.exploreServices')}
                </Link>
                <Link 
                  href="/technicians" 
                  className="bg-white text-primary font-bold py-4 px-8 rounded-md text-center hover:bg-gray-100 transition-colors hover:shadow-lg transform hover:-translate-y-1 transition-transform"
                >
                  {t('hero.findTechnicians')}
                </Link>
              </div>
            </div>
          </div>
          <div className="md:w-5/12 lg:w-6/12 flex justify-center items-center">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-5 rounded-xl shadow-2xl border border-white border-opacity-20 transform rotate-3 hover:rotate-0 transition-transform">
              <div className="bg-white rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1566093097221-ac2335b09e70?auto=format&fit=crop&w=600&q=80" 
                  alt="Solar energy" 
                  className="w-full h-64 object-cover transform hover:scale-105 transition-transform"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://images.pexels.com/photos/159397/solar-panel-array-power-sun-electricity-159397.jpeg?auto=compress&cs=tinysrgb&w=600';
                  }}
                />
                <div className="p-4">
                  <h3 className="text-primary text-xl font-bold">{t('hero.sustainableEnergy')}</h3>
                  <p className="text-gray-800">{t('hero.solarAdvantage')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-20 opacity-40"></div>
    </section>
  );
};

export default HeroSection;
