import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<User>;
  updateProfile: (id: number, userData: Partial<User>) => Promise<User>;
  changePassword: (id: number, currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Fetch the current user
  const { isLoading, error } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/user', {
          credentials: 'include',
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            return null;
          }
          throw new Error('Failed to fetch user');
        }
        
        return await res.json();
      } catch (err) {
        console.error('Error fetching user:', err);
        return null;
      }
    },
    onSuccess: (data) => {
      setCurrentUser(data);
    },
  });

  // Login function
  const login = async (username: string, password: string): Promise<User> => {
    try {
      const res = await apiRequest('POST', '/api/auth/login', { username, password });
      const user = await res.json();
      setCurrentUser(user);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      setCurrentUser(null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Register function
  const register = async (userData: any): Promise<User> => {
    try {
      const res = await apiRequest('POST', '/api/auth/register', userData);
      const user = await res.json();
      setCurrentUser(user);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (id: number, userData: Partial<User>): Promise<User> => {
    try {
      const res = await apiRequest('PATCH', `/api/auth/profile/${id}`, userData);
      const updatedUser = await res.json();
      setCurrentUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  // Change password function
  const changePassword = async (id: number, currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> => {
    try {
      await apiRequest('POST', `/api/auth/change-password/${id}`, {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        isLoading,
        error: error as Error,
        login,
        logout,
        register,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};