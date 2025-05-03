import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { fetchOrders } from '../api';

type OrderManagementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OrderManagement'>;

type Props = {
  navigation: OrderManagementScreenNavigationProp;
};

type Order = {
  id: number;
  user_name: string;
  address: string;
  phone_number: string;
  total_price: number;
  status: number;
  created_at: string;
};

const OrderManagementScreen = ({ navigation }: Props) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchOrders();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
    loadOrders();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý đơn hàng</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
            <View style={styles.orderItem}>
              <Text>ID: {item.id}</Text>
              <Text>Khách hàng: {item.user_name}</Text>
              <Text>Địa chỉ: {item.address}</Text>
              <Text>SĐT: {item.phone_number || 'Không có'}</Text>
              <Text>Tổng giá: {item.total_price.toLocaleString('vi-VN')}₫</Text>
              <Text>Trạng thái: {item.status === 0 ? 'Chờ xác nhận' : item.status === 1 ? 'Đang vận chuyển' : 'Đã giao hàng'}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  orderItem: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
    borderRadius: 8,
  },
});

export default OrderManagementScreen;