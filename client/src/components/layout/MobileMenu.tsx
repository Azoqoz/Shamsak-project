import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { t } = useTranslation();
  const [location] = useLocation();

  if (!isOpen) return null;

  const isActive = (path: string) => {
    return location === path;
  };

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <div className="md:hidden mt-4 pb-2 animate-in fade-in">
      <ul className="space-y-2">
        <li>
          <Link 
            href="/" 
            className={`block py-2 ${isActive('/') ? 'text-primary' : 'text-neutral-800'} hover:text-primary transition-colors`}
            onClick={handleLinkClick}
          >
            {t('navigation.home')}
          </Link>
        </li>
        <li>
          <Link 
            href="/request-service" 
            className={`block py-2 ${isActive('/request-service') ? 'text-primary' : 'text-neutral-800'} hover:text-primary transition-colors`}
            onClick={handleLinkClick}
          >
            {t('navigation.services')}
          </Link>
        </li>
        <li>
          <Link 
            href="/technicians" 
            className={`block py-2 ${isActive('/technicians') ? 'text-primary' : 'text-neutral-800'} hover:text-primary transition-colors`}
            onClick={handleLinkClick}
          >
            {t('navigation.technicians')}
          </Link>
        </li>
        <li>
          <Link 
            href="/contact" 
            className={`block py-2 ${isActive('/contact') ? 'text-primary' : 'text-neutral-800'} hover:text-primary transition-colors`}
            onClick={handleLinkClick}
          >
            {t('navigation.contact')}
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default MobileMenu;
