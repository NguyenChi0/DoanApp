import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.87:3000';

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
export const createOrder = async (address: string, phoneNumber: string, cartItems: CartItem[]) => {
  const response = await authAxios.post(`/orders`, { address, phoneNumber, cartItems });
  return response.data;
};

export const fetchOrders = async () => {
  // Use the authenticated axios instance
  const response = await authAxios.get(`/orders`);
  return response.data;
};

export const fetchOrderDetails = async (id: number) => {
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

// New function for customer order cancellation
export const cancelOrder = async (orderId: number) => {
  const response = await authAxios.put(`/orders/${orderId}/cancel`);
  return response.data;
};

// Function to update order status (admin only)
export const updateOrderStatus = async (orderId: number, status: number) => {
  const response = await authAxios.put(`/orders/${orderId}/status`, { status });
  return response.data;
};

// Helper function to get text representation of order status
export const getOrderStatusText = (status: number): string => {
  switch (status) {
    case 0:
      return 'Chờ xác nhận';
    case 1:
      return 'Đang vận chuyển';
    case 2:
      return 'Đã giao hàng';
    case 3:
      return 'Đã huỷ';
    default:
      return 'Không xác định';
  }
};

// Helper function to get order status filter options
export const getOrderStatusOptions = () => {
  return [
    { label: 'Tất cả đơn hàng', value: -1 },
    { label: 'Chờ xác nhận', value: 0 },
    { label: 'Đang vận chuyển', value: 1 },
    { label: 'Đã giao hàng', value: 2 },
    { label: 'Đã huỷ', value: 3 },
  ];
};