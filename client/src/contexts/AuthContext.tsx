import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { User, InsertUser } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (userData: Omit<InsertUser, 'confirmPassword'>) => Promise<User>;
  updateProfile: (userId: number, userData: Partial<User>) => Promise<User>;
  changePassword: (userId: number, currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Fetch current user on mount and periodically check session
  useEffect(() => {
    let mounted = true;
    let sessionCheckInterval: NodeJS.Timeout | null = null;

    const fetchCurrentUser = async () => {
      if (!mounted) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
          cache: 'no-cache',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (mounted) setUser(userData);
          
          // Set up a periodic session check if user is logged in
          if (!sessionCheckInterval && mounted) {
            sessionCheckInterval = setInterval(() => {
              // Silently check session status every 5 minutes
              fetch('/api/auth/user', { 
                credentials: 'include',
                cache: 'no-cache',
                headers: { 'Accept': 'application/json' }
              }).then(res => {
                if (!res.ok && user !== null && mounted) {
                  // Session expired
                  setUser(null);
                  clearInterval(sessionCheckInterval!);
                  sessionCheckInterval = null;
                }
              }).catch(err => {
                console.warn("Session check error:", err);
              });
            }, 5 * 60 * 1000); // 5 minutes
          }
        } else {
          // Not authenticated, that's okay
          if (mounted) setUser(null);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        if (mounted) {
          setUser(null);
          setError(error instanceof Error ? error : new Error('Authentication error'));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCurrentUser();
    
    // Cleanup
    return () => {
      mounted = false;
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
    };
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      
      // Direct fetch for better control over the request
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || `Login failed (${response.status})`);
      }
      
      const userData = await response.json();
      setUser(userData);
      
      // After successful login, re-fetch user data to ensure session is working
      // Use a more robust approach with retries
      const validateSession = async (attempt = 1, maxAttempts = 3): Promise<void> => {
        if (attempt > maxAttempts) {
          console.error('Max session validation attempts reached');
          return;
        }
        
        try {
          const userCheckResponse = await fetch('/api/auth/user', {
            credentials: 'include',
            cache: 'no-cache',
            headers: { 'Accept': 'application/json' }
          });
          
          if (userCheckResponse.ok) {
            const updatedUserData = await userCheckResponse.json();
            setUser(updatedUserData);
            console.log('Session validated successfully');
          } else {
            // If session validation fails, retry after a delay
            console.warn(`Session validation failed (${userCheckResponse.status}), retrying...`);
            setTimeout(() => validateSession(attempt + 1, maxAttempts), 500 * attempt);
          }
        } catch (e) {
          console.error('Error validating session after login:', e);
          // Retry after a delay
          setTimeout(() => validateSession(attempt + 1, maxAttempts), 500 * attempt);
        }
      };
      
      // Start session validation after a short delay
      setTimeout(() => validateSession(), 300);
      
      return userData;
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
        console.error('Login error:', error);
        throw error;
      }
      const newError = new Error('Login failed due to an unexpected error');
      setError(newError);
      console.error('Login error (generic):', error);
      throw newError;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const response = await apiRequest('POST', '/api/auth/logout');
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      setUser(null);
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
        throw error;
      }
      const newError = new Error('Logout failed');
      setError(newError);
      throw newError;
    }
  };

  const register = async (userData: Omit<InsertUser, 'confirmPassword'>): Promise<User> => {
    try {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const newUser = await response.json();
      setUser(newUser);
      return newUser;
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
        throw error;
      }
      const newError = new Error('Registration failed');
      setError(newError);
      throw newError;
    }
  };

  const updateProfile = async (userId: number, userData: Partial<User>): Promise<User> => {
    try {
      const response = await apiRequest('PATCH', `/api/auth/profile/${userId}`, userData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Update profile failed');
      }
      
      const updatedUser = await response.json();
      
      // Update user state if it's the current user
      if (user && user.id === userId) {
        setUser(updatedUser);
      }
      
      return updatedUser;
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
        throw error;
      }
      const newError = new Error('Update profile failed');
      setError(newError);
      throw newError;
    }
  };

  const changePassword = async (userId: number, currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const response = await apiRequest('POST', `/api/auth/change-password/${userId}`, {
        currentPassword,
        newPassword,
        confirmPassword: newPassword
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Change password failed');
      }
      
      // Show success toast
      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
        throw error;
      }
      const newError = new Error('Change password failed');
      setError(newError);
      throw newError;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};