import { useState, useEffect } from 'react';
import authService from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = () => {
      try {
        const token = authService.getToken();
        const currentUser = authService.getCurrentUser();
        
        if (token && currentUser) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.login(credentials);
      
      if (result.success) {
        setUser(result.data.user);
        // Force redirect to dashboard after successful login
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
        return result;
      } else {
        setError(result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.register(userData);
      
      if (result.success) {
        setUser(result.data.user);
        return result;
      } else {
        setError(result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
    // Force navigation to login
    window.location.href = '/auth';
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.updateProfile(profileData);
      
      if (result.success) {
        setUser(result.data.user);
        return result;
      } else {
        setError(result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage = error.message || 'Profile update failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };
};