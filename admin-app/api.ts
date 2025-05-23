import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.52.114:3000';

export const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

export const setToken = async (token: string) => {
  return await AsyncStorage.setItem('token', token);
};

export const clearToken = async () => {
  return await AsyncStorage.removeItem('token');
};

export const isAuthenticated = async () => {
  const token = await getToken();
  return !!token;
};

export const loginAdmin = async (username: string, password: string) => {
  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Đăng nhập thất bại');
    }
    
    if (data.user?.role !== 1) {
      throw new Error('Tài khoản không có quyền admin');
    }
    
    await setToken(data.token);
    
    return data;
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
};

//Quản lý sản phẩm
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
  category_id?: number | string;
  stock?: number;
  image?: string;
}) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Phiên đăng nhập hết hạn');
    }

    const formData = new FormData();
    formData.append('name', product.name);
    if (product.description) formData.append('description', product.description);
    formData.append('price', product.price.toString());
    if (product.stock) formData.append('stock', product.stock.toString());
    if (product.category_id) {
      const categoryId = typeof product.category_id === 'string' ? parseInt(product.category_id) : product.category_id;
      formData.append('category_id', categoryId.toString());
    }
    if (product.image) {
      const filename = product.image.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      formData.append('image', {
        uri: product.image,
        name: filename,
        type,
      } as any);
    }

    const res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
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

export const updateProduct = async (
  id: number,
  product: {
    name: string;
    price: number;
    description?: string;
    category_id?: number | string;
    stock?: number;
    image?: string;
  },
  newImageSelected: boolean = false
) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Phiên đăng nhập hết hạn');
    }

    const formData = new FormData();
    formData.append('name', product.name);
    if (product.description) formData.append('description', product.description);
    formData.append('price', product.price.toString());
    if (product.stock !== undefined) formData.append('stock', product.stock.toString());
    if (product.category_id) {
      const categoryId = typeof product.category_id === 'string' ? parseInt(product.category_id) : product.category_id;
      formData.append('category_id', categoryId.toString());
    }
    
    if (newImageSelected && product.image) {
      const filename = product.image.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      
      formData.append('image', {
        uri: product.image,
        name: filename,
        type,
      } as any);
    }

    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Không thể cập nhật sản phẩm');
    }

    return data;
  } catch (error: any) {
    console.error('Update product error:', error);
    throw error;
  }
};

export const hideProduct = async (id: number) => {
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
      throw new Error(data.error || 'Không thể ẩn sản phẩm');
    }
    
    return data;
  } catch (error: any) {
    console.error('Hide product error:', error);
    throw error;
  }
};


//Quản lý danh mục
export const fetchCategories = async () => {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/categories`, {
      headers: { 
        Authorization: token ? `Bearer ${token}` : '' 
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Không thể tải danh mục');
    }
    
    return data;
  } catch (error: any) {
    console.error('Fetch categories error:', error);
    throw error;
  }
};

export const addCategory = async (category: { name: string }) => {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(category),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Không thể thêm danh mục');
    }
    
    return data;
  } catch (error: any) {
    console.error('Add category error:', error);
    throw error;
  }
};

export const updateCategory = async (id: number, category: { name: string }) => {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(category),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Không thể cập nhật danh mục');
    }
    
    return data;
  } catch (error: any) {
    console.error('Update category error:', error);
    throw error;
  }
};

export const deleteCategory = async (id: number) => {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Không thể xóa danh mục');
    }
    
    return data;
  } catch (error: any) {
    console.error('Delete category error:', error);
    throw error;
  }
};

//Quản lý đơn hàng
export const fetchOrders = async () => {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Không thể tải danh sách đơn hàng');
    }
    
    return data;
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    throw error;
  }
};

export const fetchOrderDetails = async (orderId: number) => {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Không thể tải chi tiết đơn hàng');
    }
    
    return data;
  } catch (error: any) {
    console.error('Fetch order details error:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: number, status: number) => {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Không thể cập nhật trạng thái đơn hàng');
    }
    
    return data;
  } catch (error: any) {
    console.error('Update order status error:', error);
    throw error;
  }
};

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

export const getOrderStatusOptions = (): Array<{label: string, value: number}> => {
  return [
    { label: 'Tất cả', value: -1 },
    { label: 'Chờ xác nhận', value: 0 },
    { label: 'Đang vận chuyển', value: 1 },
    { label: 'Đã giao hàng', value: 2 },
    { label: 'Đã huỷ', value: 3 }
  ];
};
//Quản lý người dùng
export const fetchUsers = async () => {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Không thể tải danh sách user');
    }
    
    return data;
  } catch (error: any) {
    console.error('Fetch users error:', error);
    throw error;
  }
};

export const addUser = async (user: {
  username: string;
  password: string;
  email: string;
  full_name?: string;
  address?: string;
  role?: number;
}) => {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(user),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Không thể thêm user');
    }
    
    return data;
  } catch (error: any) {
    console.error('Add user error:', error);
    throw error;
  }
};

export const updateUser = async (id: number, user: {
  username?: string;
  email?: string;
  full_name?: string;
  address?: string;
  password?: string;
  role?: number;
}) => {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(user),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Không thể cập nhật user');
    }
    
    return data;
  } catch (error: any) {
    console.error('Update user error:', error);
    throw error;
  }
};

export const deleteUser = async (id: number) => {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      if (data.hasOrders) {
        const error = new Error(data.error || 'Không thể xóa user');
        (error as any).hasOrders = true;
        throw error;
      } else {
        throw new Error(data.error || 'Không thể xóa user');
      }
    }
    
    return data;
  } catch (error: any) {
    console.error('Delete user error:', error);
    throw error;
  }
};

// API quản lý đánh giá
export const fetchReviews = async () => {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/admin/reviews`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Không thể tải danh sách đánh giá');
    }
    
    return data;
  } catch (error: any) {
    console.error('Fetch reviews error:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId: number) => {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Không thể xóa đánh giá');
    }
    
    return data;
  } catch (error: any) {
    console.error('Delete review error:', error);
    throw error;
  }
};



//Báo cáo
export const fetchMonthlyRevenue = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Phiên đăng nhập hết hạn');
    }
    
    const res = await fetch(`${BASE_URL}/revenue/monthly`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Không thể tải dữ liệu doanh thu');
    }
    
    return data;
  } catch (error: any) {
    console.error('Fetch monthly revenue error:', error);
    throw error;
  }
};

export const logout = async () => {
  await clearToken();
};