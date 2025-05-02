import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Button
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchOrders } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

type RootStackParamList = {
  OrdersScreen: undefined;
  OrderDetailScreen: { orderId: string };
  Login: undefined; // Thêm Login vào RootStackParamList
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Order {
  id: number;
  user_name: string;
  address: string;
  total_price: number | string | undefined;
  created_at: string;
  status: number; // Thêm trạng thái
}

const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchOrders();
      console.log('Orders data:', data);
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const formatPrice = (price: number | string | undefined): string => {
    if (price === undefined || price === null) return '0.00';
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2);
  };

  // Hàm để hiển thị trạng thái đơn hàng dựa trên số
  const getStatusText = (status: number): string => {
    switch (status) {
      case 0:
        return 'Chờ xác nhận';
      case 1:
        return 'Đang vận chuyển';
      case 2:
        return 'Đã giao hàng';
      default:
        return 'Không xác định';
    }
  };

  // Hàm để lấy màu sắc cho trạng thái
  const getStatusColor = (status: number): string => {
    switch (status) {
      case 0:
        return '#f39c12'; // Màu cam cho chờ xác nhận
      case 1:
        return '#3498db'; // Màu xanh dương cho đang vận chuyển
      case 2:
        return '#2ecc71'; // Màu xanh lá cho đã giao hàng
      default:
        return '#95a5a6'; // Màu xám cho không xác định
    }
  };

  const renderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => navigation.navigate('OrderDetailScreen', { orderId: item.id.toString() })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
        <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
      </View>
      
      <View style={styles.orderDetails}>
        <Text style={styles.userName}>Khách hàng: {item.user_name}</Text>
        <Text style={styles.orderAddress} numberOfLines={1}>
          Địa chỉ: {item.address}
        </Text>
        
        {/* Thêm hiển thị trạng thái đơn hàng */}
        <View style={[styles.statusContainer, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>Tổng tiền: ${formatPrice(item.total_price)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!token) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Bạn cần đăng nhập để xem đơn hàng</Text>
        <Button title="Đăng Nhập" onPress={() => navigation.navigate('Login')} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4B0082" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadOrders}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={loadOrders}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  orderItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B0082',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  orderDetails: {
    marginBottom: 10,
  },
  userName: {
    fontSize: 14,
    marginBottom: 4,
  },
  orderAddress: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8, // Thêm khoảng cách trước hiển thị trạng thái
  },
  // Thêm style cho phần hiển thị trạng thái
  statusContainer: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 4,
    marginBottom: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4B0082',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  }
});

export default OrdersScreen;