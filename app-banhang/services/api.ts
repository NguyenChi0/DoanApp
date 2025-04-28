import axios from 'axios';

const API_URL = 'http://192.168.43.49:3000';

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

export const fetchProducts = async () => {
  const response = await axios.get(`${API_URL}/products`);
  return response.data;
};

export const fetchProductById = async (id: number) => {
  const response = await axios.get(`${API_URL}/products/${id}`);
  return response.data;
};

export const createOrder = async (address: string, cartItems: CartItem[]) => {
  const response = await axios.post(`${API_URL}/orders`, { address, cartItems });
  return response.data;
};

export const fetchOrders = async () => {
  const response = await axios.get(`${API_URL}/orders`);
  return response.data;
};

export const fetchOrderById = async (id: number) => {
  const response = await axios.get(`${API_URL}/orders/${id}`);
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