import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sun } from 'lucide-react';
import { FaTwitter, FaFacebookF, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const { t } = useTranslation();
  const { direction } = useLanguage();

  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-2xl font-bold mb-4">
              <Link href="/" className="flex items-center">
                <Sun className="text-yellow-500 mr-2 h-6 w-6" />
                <span>{t('common.appName')}</span>
              </Link>
            </div>
            <p className="text-neutral-300 mb-4">
              {t('footer.tagline')}
            </p>
            <div className={`flex space-x-4 ${direction === 'rtl' ? 'space-x-reverse' : ''}`}>
              <a href="#" className="text-neutral-300 hover:text-white transition-colors" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white transition-colors" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white transition-colors" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white transition-colors" aria-label="LinkedIn">
                <FaLinkedinIn />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.services')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/request-service?service=installation" className="text-neutral-300 hover:text-white transition-colors">
                  {t('serviceForm.installation')}
                </Link>
              </li>
              <li>
                <Link href="/request-service?service=maintenance" className="text-neutral-300 hover:text-white transition-colors">
                  {t('serviceForm.maintenance')}
                </Link>
              </li>
              <li>
                <Link href="/request-service?service=assessment" className="text-neutral-300 hover:text-white transition-colors">
                  {t('serviceForm.assessment')}
                </Link>
              </li>
              <li>
                <Link href="/request-service" className="text-neutral-300 hover:text-white transition-colors">
                  {t('services.requestService')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-neutral-300 hover:text-white transition-colors">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link href="/technicians" className="text-neutral-300 hover:text-white transition-colors">
                  {t('navigation.technicians')}
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-neutral-300 hover:text-white transition-colors">
                  {t('footer.becomeTech')}
                </Link>
              </li>
              <li>
                <Link href="/" className="text-neutral-300 hover:text-white transition-colors">
                  {t('footer.faq')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-2">
              <li className={`flex items-start ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <FaMapMarkerAlt className={`mt-1 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                <span className="text-neutral-300">
                  {t('contact.address')}
                </span>
              </li>
              <li className={`flex items-start ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <FaPhone className={`mt-1 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                <span dir="ltr" className="text-neutral-300">+966 12 345 6789</span>
              </li>
              <li className={`flex items-start ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <FaEnvelope className={`mt-1 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                <span dir="ltr" className="text-neutral-300">info@shamsak.sa</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-300 text-sm mb-4 md:mb-0">
              {t('footer.rights')}
            </p>
            <div className={`flex space-x-6 ${direction === 'rtl' ? 'space-x-reverse' : ''}`}>
              <Link href="/" className="text-neutral-300 hover:text-white text-sm transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link href="/" className="text-neutral-300 hover:text-white text-sm transition-colors">
                {t('footer.terms')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
