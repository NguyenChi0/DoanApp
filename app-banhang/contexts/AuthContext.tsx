import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { login, register } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  address: string | null;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  setUser: () => {},
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  isLoading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        if (storedToken) {
          setToken(storedToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading token or user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const loginUser = async (username: string, password: string) => {
    try {
      const response = await login(username, password);
      const newToken = response.token;
      const newUser = response.user;
      setToken(newToken);
      setUser(newUser);
      await AsyncStorage.setItem('token', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const registerUser = async (userData: any) => {
    try {
      await register(userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ token, user, setUser, login: loginUser, register: registerUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);