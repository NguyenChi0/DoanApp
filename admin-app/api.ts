// api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.1.7:3000'; // Thay bằng IP LAN máy bạn

export const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

export const setToken = async (token: string) => {
  return await AsyncStorage.setItem('token', token);
};

export const clearToken = async () => {
  return await AsyncStorage.removeItem('token');
};

export const loginAdmin = async (username: string, password: string) => {
  try {
    // Change from /admin/login to /login to match the server endpoint
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Đăng nhập thất bại');
    }
    
    // Check if user is admin (role === 1)
    if (data.user?.role !== 1) {
      throw new Error('Tài khoản không có quyền admin');
    }
    
    // Save token for future requests
    await setToken(data.token);
    
    return data;
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
};

export const fetchProducts = async () => {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/products`, {
      headers: { 
        Authorization: token ? `Bearer ${token}` : '' 
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Không thể tải sản phẩm');
    }
    
    return data;
  } catch (error: any) {
    console.error('Fetch products error:', error);
    throw error;
  }
};

export const addProduct = async (product: {
  name: string;
  price: number;
  description?: string;
  category_id?: number;
  stock?: number;
  image?: string;
}) => {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Không thể thêm sản phẩm');
    }
    
    return data;
  } catch (error: any) {
    console.error('Add product error:', error);
    throw error;
  }
};

export const deleteProduct = async (id: number) => {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Không thể xóa sản phẩm');
    }
    
    return data;
  } catch (error: any) {
    console.error('Delete product error:', error);
    throw error;
  }
};

export const logout = async () => {
  await clearToken();
};