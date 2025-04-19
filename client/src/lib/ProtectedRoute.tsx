import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { LoaderCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && !user) {
      // User is not authenticated, redirect to login
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('profile.notLoggedIn')
      });
      setLocation('/login');
    } else if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      // User is authenticated but doesn't have the required role, redirect to profile
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: t('profile.unauthorizedAccess')
      });
      setLocation('/profile');
    }
  }, [loading, user, setLocation, toast, t, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // This will only briefly show before the redirect happens
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If we have role restrictions but user role doesn't match
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // This will only briefly show before the redirect happens
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // User is authenticated and has the appropriate role, render the children
  return <>{children}</>;
};