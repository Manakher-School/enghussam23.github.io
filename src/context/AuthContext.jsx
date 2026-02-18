import React, { createContext, useState, useContext, useEffect } from 'react';
import { pb } from '../lib/pocketbase';

const AuthContext = createContext();

/**
 * AuthProvider Component
 * 
 * Manages authentication state for the entire application.
 * Integrates with PocketBase for user authentication.
 * 
 * Features:
 * - Auto-restore session from localStorage on mount
 * - Login/logout functionality
 * - Role-based access helpers (isStudent, isTeacher, isAdmin)
 * - Token management
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Initialize auth state on component mount
   * Restore session from PocketBase authStore if valid
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if PocketBase has a valid auth token
        if (pb.authStore.isValid && pb.authStore.model) {
          setUser(pb.authStore.model);
          setToken(pb.authStore.token);
        } else {
          // Clear any invalid session data
          pb.authStore.clear();
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        pb.authStore.clear();
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen to auth store changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setToken(token);
      setUser(model);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data
   */
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const authData = await pb.collection('users').authWithPassword(email, password);
      
      setUser(authData.record);
      setToken(authData.token);

      return {
        success: true,
        user: authData.record,
        role: authData.record.role,
      };
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err?.response?.message || err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout current user
   * Clears PocketBase authStore and local state
   */
  const logout = () => {
    pb.authStore.clear();
    setUser(null);
    setToken(null);
    setError(null);
  };

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  const isAuthenticated = () => {
    return pb.authStore.isValid && user !== null;
  };

  /**
   * Check if current user is a student
   * @returns {boolean}
   */
  const isStudent = () => {
    return user?.role === 'student';
  };

  /**
   * Check if current user is a teacher
   * @returns {boolean}
   */
  const isTeacher = () => {
    return user?.role === 'teacher';
  };

  /**
   * Check if current user is an admin
   * @returns {boolean}
   */
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  /**
   * Check if user has specific role
   * @param {string} role - Role to check ('student', 'teacher', 'admin')
   * @returns {boolean}
   */
  const hasRole = (role) => {
    return user?.role === role;
  };

  /**
   * Refresh auth token
   * Re-authenticates the current session
   */
  const refreshAuth = async () => {
    try {
      if (!pb.authStore.isValid) {
        throw new Error('No valid session to refresh');
      }

      // PocketBase auto-refreshes tokens, but we can manually trigger it
      const authData = await pb.collection('users').authRefresh();
      setUser(authData.record);
      setToken(authData.token);

      return authData;
    } catch (err) {
      console.error('Error refreshing auth:', err);
      logout();
      throw err;
    }
  };

  const value = {
    // State
    user,
    token,
    loading,
    error,
    
    // Methods
    login,
    logout,
    refreshAuth,
    
    // Helpers
    isAuthenticated,
    isStudent,
    isTeacher,
    isAdmin,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 * @throws {Error} If used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
