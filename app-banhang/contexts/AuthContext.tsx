import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { login as apiLogin, register as apiRegister } from '../services/api';

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

  // Set up axios default authorization header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        
        if (storedToken) {
          setToken(storedToken);
          // Set axios default header here too
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
    const response = await apiLogin(username, password);
    const newToken = response.token;
    const newUser = response.user;

    // Update state
    setToken(newToken);
    setUser(newUser);

    // Store in AsyncStorage
    await AsyncStorage.setItem('token', newToken);
    await AsyncStorage.setItem('user', JSON.stringify(newUser));

    // Set axios default header
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

    return response;
  } catch (error: any) {
    // Không log lỗi chi tiết
    // Tùy chỉnh thông điệp lỗi
    if (error.response) {
      throw new Error('Tài khoản hoặc mật khẩu không đúng');
    } else if (error.request) {
      throw new Error('Không thể kết nối đến máy chủ');
    } else {
      throw new Error('Đã xảy ra lỗi không xác định');
    }
  }
};

  const registerUser = async (userData: any) => {
    try {
      await apiRegister(userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear state
      setToken(null);
      setUser(null);
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      // Clear axios default header
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      setUser, 
      login: loginUser, 
      register: registerUser, 
      logout, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);