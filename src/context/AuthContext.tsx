import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthContextType, SyncStatus } from '../types';
import { User } from '../models/User';
import { authService } from '../services/AuthService';
import { initializeDatabase } from '../database/schema';
import { subscribeConnectivity } from '../utils/connectivity';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext debe usarse dentro de AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    isSyncing: false,
    lastSyncTime: null,
  });

  useEffect(() => {
    const init = async () => {
      try {
        await initializeDatabase();
        await authService.seedDemoUser();
        const storedUserId = await AsyncStorage.getItem('@conexioncorp_user_id');
        if (storedUserId) {
          const storedUser = await authService.getUserById(parseInt(storedUserId, 10));
          if (storedUser) setUser(storedUser);
        }
      } catch (err) {
        console.error('❌ Error inicializando:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeConnectivity((state) => {
      setSyncStatus((prev) => ({ ...prev, isOnline: state.isInternetReachable }));
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);
      await AsyncStorage.setItem('@conexioncorp_user_id', String(loggedUser.id));
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesion');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName: string, department?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const newUser = await authService.register(email, password, displayName, department);
        setUser(newUser);
        await AsyncStorage.setItem('@conexioncorp_user_id', String(newUser.id));
      } catch (err: any) {
        setError(err.message || 'Error al registrarse');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem('@conexioncorp_user_id');
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    syncStatus,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
