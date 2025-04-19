import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

// This component redirects technicians to their profile page automatically
export function TechnicianRedirect() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Only redirect after auth is loaded and user exists
    if (!loading && user && user.role === 'technician') {
      setLocation('/profile');
    }
  }, [user, loading, setLocation]);

  // This component doesn't render anything
  return null;
}