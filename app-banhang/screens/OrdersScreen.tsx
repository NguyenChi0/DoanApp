import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Button,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchOrders, cancelOrder, getOrderStatusText } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  OrdersScreen: undefined;
  OrderDetailScreen: { orderId: string };
  Login: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Order {
  id: number;
  user_name: string;
  address: string;
  total_price: number | string | undefined;
  created_at: string;
  status: number;
}

const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelLoadingOrderId, setCancelLoadingOrderId] = useState<number | null>(null);

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

  const handleCancelOrder = async (orderId: number) => {
    // Show confirmation dialog before cancelling
    Alert.alert(
      'Xác nhận hủy đơn hàng',
      'Bạn có chắc chắn muốn hủy đơn hàng này không?',
      [
        {
          text: 'Không',
          style: 'cancel'
        },
        {
          text: 'Xác Nhận',
          style: 'destructive',
          onPress: async () => {
            setCancelLoadingOrderId(orderId);
            try {
              const response = await cancelOrder(orderId);
              Alert.alert('Thành công', response.message);
              // Refresh orders after cancellation
              const updatedData = await fetchOrders();
              setOrders(updatedData);
            } catch (err: any) {
              console.error('Error cancelling order:', err);
              Alert.alert('Lỗi', err.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại.');
            } finally {
              setCancelLoadingOrderId(null);
            }
          }
        }
      ]
    );
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

  const getStatusColor = (status: number): string => {
    switch (status) {
      case 0:
        return '#f39c12';
      case 1:
        return '#3498db';
      case 2:
        return '#2ecc71';
      case 3:
        return '#e74c3c';
      default:
        return '#95a5a6';
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
        
        <View style={[styles.statusContainer, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getOrderStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>Tổng tiền: ${formatPrice(item.total_price)}</Text>
        {item.status === 0 && (
          <TouchableOpacity
            style={[styles.cancelButton, cancelLoadingOrderId === item.id && styles.disabledButton]}
            onPress={() => handleCancelOrder(item.id)}
            disabled={cancelLoadingOrderId === item.id}
          >
            {cancelLoadingOrderId === item.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  if (!token) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="cart-outline" size={80} color="#4B0082" />
        <Text style={styles.errorText}>Vui lòng đăng nhập để xem đơn hàng</Text>
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Đăng Nhập</Text>
        </TouchableOpacity>
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
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
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
    marginBottom: 8,
  },
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#c0392b',
    opacity: 0.7,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  errorText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
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
  },
  loginButton: {
    backgroundColor: '#4B0082',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrdersScreen;