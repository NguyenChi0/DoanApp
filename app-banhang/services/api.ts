import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.7:3000';

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface UserData {
  username: string;
  password: string;
  email: string;
  full_name?: string;
  address?: string;
}

// Helper function to get the auth token
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch (error) {
    console.error('Error getting token from AsyncStorage:', error);
    return null;
  }
};

// Create a custom axios instance for authenticated requests
const authAxios = axios.create({
  baseURL: API_URL,
});

// Add interceptor to add the token to every request
authAxios.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const fetchProducts = async (categoryId?: number) => {
  const response = await axios.get(`${API_URL}/products`, {
    params: categoryId ? { category_id: categoryId } : {},
  });
  return response.data;
};

export const fetchProductById = async (id: number) => {
  const response = await axios.get(`${API_URL}/products/${id}`);
  return response.data;
};

export const fetchCategories = async () => {
  const response = await axios.get(`${API_URL}/categories`);
  return response.data;
};

// Use authAxios for authenticated endpoints
export const createOrder = async (address: string, cartItems: CartItem[]) => {
  const response = await authAxios.post(`/orders`, { address, cartItems });
  return response.data;
};

export const fetchOrders = async () => {
  // Use the authenticated axios instance
  const response = await authAxios.get(`/orders`);
  return response.data;
};

export const fetchOrderById = async (id: number) => {
  const response = await authAxios.get(`/orders/${id}`);
  return response.data;
};

export const register = async (userData: UserData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

export const login = async (username: string, password: string) => {
  const response = await axios.post(`${API_URL}/login`, { username, password });
  return response.data;
};

export const updateUser = async (id: number, userData: Partial<UserData>) => {
  const response = await authAxios.put(`/users/${id}`, userData);
  return response.data;
};