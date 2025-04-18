import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import ContactForm from '@/components/forms/ContactForm';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaTwitter, FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

interface ContactPageProps {
  inHomePage?: boolean;
}

const ContactPage = ({ inHomePage = false }: ContactPageProps) => {
  const { t } = useTranslation();
  const { direction } = useLanguage();

  return (
    <>
      {!inHomePage && (
        <Helmet>
          <title>{t('contact.title')} | {t('common.appName')}</title>
          <meta 
            name="description" 
            content={t('contact.subtitle')} 
          />
        </Helmet>
      )}

      <section id="contact" className="py-16 bg-white fade-in">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-neutral-800 mb-4">
                  {t('contact.title')}
                </h2>
                <p className="text-lg text-neutral-800 mb-6">
                  {t('contact.subtitle')}
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <div className="text-primary text-xl mr-4">
                      <FaMapMarkerAlt />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{t('contact.addressTitle')}</h3>
                      <p className="text-neutral-800">{t('contact.address')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-primary text-xl mr-4">
                      <FaPhone />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{t('contact.phoneTitle')}</h3>
                      <p className="text-neutral-800">+966 12 345 6789</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="text-primary text-xl mr-4">
                      <FaEnvelope />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{t('contact.emailTitle')}</h3>
                      <p className="text-neutral-800">info@shamsak.sa</p>
                    </div>
                  </div>
                </div>
                
                <div className={`flex space-x-4 ${direction === 'rtl' ? 'space-x-reverse' : ''}`}>
                  <a href="#" className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 w-10 h-10 rounded-full flex items-center justify-center transition-colors" aria-label="Twitter">
                    <FaTwitter />
                  </a>
                  <a href="#" className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 w-10 h-10 rounded-full flex items-center justify-center transition-colors" aria-label="Facebook">
                    <FaFacebookF />
                  </a>
                  <a href="#" className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 w-10 h-10 rounded-full flex items-center justify-center transition-colors" aria-label="Instagram">
                    <FaInstagram />
                  </a>
                  <a href="#" className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 w-10 h-10 rounded-full flex items-center justify-center transition-colors" aria-label="LinkedIn">
                    <FaLinkedinIn />
                  </a>
                </div>
              </div>
              
              <div>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
