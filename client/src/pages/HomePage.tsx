import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import ServicesSection from '@/components/home/ServicesSection';
import TechniciansSection from '@/components/home/TechniciansSection';
import ServiceRequestForm from '@/components/forms/ServiceRequestForm';
import ContactPage from '@/pages/ContactPage';

const HomePage = () => {
  const { t } = useTranslation();

  // Scroll to specific section if URL has hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const targetElement = document.getElementById(hash.substring(1));
      if (targetElement) {
        setTimeout(() => {
          window.scrollTo({
            top: targetElement.offsetTop - 80, // Account for fixed header
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>{t('common.appName')} | {t('common.tagline')}</title>
        <meta 
          name="description" 
          content={t('hero.subtitle')} 
        />
      </Helmet>

      <div className="fade-in">
        <HeroSection />
        <FeaturesSection />
        <ServicesSection />
        <TechniciansSection />
        <ServiceRequestForm />
        <ContactPage inHomePage={true} />
      </div>
    </>
  );
};

export default HomePage;
