import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MobileMenu from './MobileMenu';
import { Sun, User, Settings, LogOut } from 'lucide-react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { toggleLanguage, direction } = useLanguage();
  const [location] = useLocation();
  const { user, logout } = useAuth();

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
                  href="/find-technicians" 
                  className={`${isActive('/find-technicians') ? 'text-primary' : 'text-neutral-800'} hover:text-primary transition-colors`}
                >
                  {t('navigation.findNearby')}
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
              className="bg-primary hover:bg-primary/90 text-white px-3 py-1"
            >
              {t('common.language')}
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9">
                      {user.profileImage ? (
                        <AvatarImage src={user.profileImage} alt={user.name} />
                      ) : (
                        <AvatarFallback className="bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align={direction === 'rtl' ? 'start' : 'end'}>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex w-full items-center">
                      <User className={`mr-2 h-4 w-4 ${direction === 'rtl' ? 'ml-2 mr-0' : 'mr-2'}`} />
                      <span>{t('profile.myProfile')}</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer flex w-full items-center">
                        <Settings className={`mr-2 h-4 w-4 ${direction === 'rtl' ? 'ml-2 mr-0' : 'mr-2'}`} />
                        <span>{t('admin.dashboard')}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => logout()}
                    className="cursor-pointer text-red-500 focus:text-red-500"
                  >
                    <LogOut className={`mr-2 h-4 w-4 ${direction === 'rtl' ? 'ml-2 mr-0' : 'mr-2'}`} />
                    <span>{t('common.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Link href="/login" className="text-primary hover:underline">
                  {t('common.login')}
                </Link>
                <span className="text-neutral-300">|</span>
                <Link href="/register" className="text-primary hover:underline">
                  {t('common.register')}
                </Link>
              </div>
            )}
            
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
