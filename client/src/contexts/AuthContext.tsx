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

  // Fetch current user on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiRequest('GET', '/api/auth/user');
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Not authenticated, that's okay
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    try {
      setError(null);
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const userData = await response.json();
      setUser(userData);
      
      // After successful login, re-fetch user data to ensure session is working
      setTimeout(async () => {
        try {
          const userCheckResponse = await apiRequest('GET', '/api/auth/user');
          if (userCheckResponse.ok) {
            const updatedUserData = await userCheckResponse.json();
            setUser(updatedUserData);
          }
        } catch (e) {
          console.error('Error validating session after login:', e);
        }
      }, 100);
      
      return userData;
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
        throw error;
      }
      const newError = new Error('Login failed');
      setError(newError);
      throw newError;
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