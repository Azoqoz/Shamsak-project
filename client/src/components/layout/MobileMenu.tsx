import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { User, Settings, LogOut } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { user, logout } = useAuth();

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
            href="/find-technicians" 
            className={`block py-2 ${isActive('/find-technicians') ? 'text-primary' : 'text-neutral-800'} hover:text-primary transition-colors`}
            onClick={handleLinkClick}
          >
            {t('navigation.findNearby')}
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
      
      <Separator className="my-4" />
      
      {user ? (
        <div className="space-y-3">
          {user.name && (
            <div className="text-sm font-medium">
              {t('profile.welcome')}, {user.name}
            </div>
          )}
          
          <ul className="space-y-2">
            <li>
              <Link
                href="/profile"
                className="flex items-center py-2 text-neutral-800 hover:text-primary transition-colors"
                onClick={handleLinkClick}
              >
                <User className="h-4 w-4 mr-2" />
                <span>{t('profile.myProfile')}</span>
              </Link>
            </li>
            
            {user.role === 'admin' && (
              <li>
                <Link
                  href="/admin"
                  className="flex items-center py-2 text-neutral-800 hover:text-primary transition-colors"
                  onClick={handleLinkClick}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <span>{t('admin.dashboard')}</span>
                </Link>
              </li>
            )}
            

            
            <li>
              <button
                onClick={() => {
                  logout();
                  handleLinkClick();
                }}
                className="flex items-center py-2 text-red-500 hover:text-red-600 transition-colors w-full text-left"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>{t('common.logout')}</span>
              </button>
            </li>
          </ul>
        </div>
      ) : (
        <div className="flex flex-col space-y-2">
          <Link
            href="/login"
            className="py-2 text-primary hover:text-primary/80 transition-colors"
            onClick={handleLinkClick}
          >
            {t('common.login')}
          </Link>
          <Link
            href="/register"
            className="py-2 text-primary hover:text-primary/80 transition-colors"
            onClick={handleLinkClick}
          >
            {t('common.register')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
