import axios from 'axios';

const API_URL = 'http://192.168.52.114:3000'; // Nếu chạy điện thoại thật thì sửa localhost thành IP máy tính

// Lấy tất cả sản phẩm
export const fetchProducts = async () => {
  const response = await axios.get(`${API_URL}/products`);
  return response.data;
};

// Lấy chi tiết sản phẩm
export const fetchProductById = async (id: number) => {
  const response = await axios.get(`${API_URL}/products/${id}`);
  return response.data;
};

// Tạo đơn hàng
export const createOrder = async (user_name: string, address: string, cartItems: any[]) => {
  const response = await axios.post(`${API_URL}/orders`, {
    user_name,
    address,
    cartItems,
  });
  return response.data;
};

// Lấy tất cả đơn hàng
export const fetchOrders = async () => {
  const response = await axios.get(`${API_URL}/orders`);
  return response.data;
};

// Lấy chi tiết 1 đơn hàng
export const fetchOrderById = async (id: number) => {
  const response = await axios.get(`${API_URL}/orders/${id}`);
  return response.data;
};