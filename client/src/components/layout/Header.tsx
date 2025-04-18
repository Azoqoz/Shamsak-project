import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import MobileMenu from './MobileMenu';
import { Sun } from 'lucide-react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { toggleLanguage } = useLanguage();
  const [location] = useLocation();

  const handleMobileMenuToggle = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-primary text-3xl font-bold">
              <Link href="/" className="flex items-center">
                <Sun className={`text-yellow-500 ${useLanguage().direction === 'rtl' ? 'ml-2' : 'mr-2'} h-6 w-6`} />
                <span>{t('common.appName')}</span>
              </Link>
            </div>
          </div>
          
          <nav className="hidden md:block">
            <ul className="flex space-x-6 rtl:space-x-reverse">
              <li>
                <Link 
                  href="/" 
                  className={`${isActive('/') ? 'text-primary' : 'text-neutral-800'} hover:text-primary transition-colors`}
                >
                  {t('navigation.home')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/request-service" 
                  className={`${isActive('/request-service') ? 'text-primary' : 'text-neutral-800'} hover:text-primary transition-colors`}
                >
                  {t('navigation.services')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/technicians" 
                  className={`${isActive('/technicians') ? 'text-primary' : 'text-neutral-800'} hover:text-primary transition-colors`}
                >
                  {t('navigation.technicians')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className={`${isActive('/contact') ? 'text-primary' : 'text-neutral-800'} hover:text-primary transition-colors`}
                >
                  {t('navigation.contact')}
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <Button 
              onClick={toggleLanguage} 
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1"
            >
              {t('common.language')}
            </Button>
            <Link href="/login" className="text-primary hover:underline">
              {t('common.login')}
            </Link>
            <button 
              className="md:hidden text-neutral-800" 
              onClick={handleMobileMenuToggle}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18"></path>
                  <path d="M6 6L18 18"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h18"></path>
                  <path d="M3 6h18"></path>
                  <path d="M3 18h18"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <MobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </div>
    </header>
  );
};

export default Header;
