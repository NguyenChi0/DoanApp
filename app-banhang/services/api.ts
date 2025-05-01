import axios from 'axios';

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

export const updateUser = async (id: number, userData: Partial<UserData>, token: string) => {
  const response = await axios.put(`${API_URL}/users/${id}`, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};