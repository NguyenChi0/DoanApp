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