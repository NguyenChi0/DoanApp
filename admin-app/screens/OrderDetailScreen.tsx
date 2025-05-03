import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { fetchOrderDetails, updateOrderStatus } from '../api';

type OrderDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OrderDetail'>;

type Props = {
  navigation: OrderDetailScreenNavigationProp;
  route: { params: { orderId: number } };
};

type OrderDetail = {
  order: {
    id: number;
    user_name: string;
    address: string;
    phone_number: string;
    total_price: number;
    status: number;
    created_at: string;
  };
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
};

const OrderDetailScreen = ({ route }: Props) => {
  const { orderId } = route.params;
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);

  useEffect(() => {
    const loadOrderDetail = async () => {
      try {
        const data = await fetchOrderDetails(orderId);
        setOrderDetail(data);
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    };
    loadOrderDetail();
  }, [orderId]);

  const handleUpdateStatus = async (newStatus: number) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrderDetail((prev) => prev ? { ...prev, order: { ...prev.order, status: newStatus } } : null);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (!orderDetail) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chi tiết đơn hàng #{orderDetail.order.id}</Text>
      <Text>Khách hàng: {orderDetail.order.user_name}</Text>
      <Text>Địa chỉ: {orderDetail.order.address}</Text>
      <Text>SĐT: {orderDetail.order.phone_number || 'Không có'}</Text>
      <Text>Tổng giá: {orderDetail.order.total_price.toLocaleString('vi-VN')}₫</Text>
      <Text>Trạng thái: {orderDetail.order.status === 0 ? 'Chờ xác nhận' : orderDetail.order.status === 1 ? 'Đang vận chuyển' : 'Đã giao hàng'}</Text>
      <Text style={styles.subtitle}>Danh sách sản phẩm:</Text>
      {orderDetail.items.map((item, index) => (
        <View key={index} style={styles.item}>
          <Text>{item.product_name} - Số lượng: {item.quantity} - Giá: {item.price.toLocaleString('vi-VN')}₫</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.button} onPress={() => handleUpdateStatus(1)}>
        <Text style={styles.buttonText}>Đánh dấu đang vận chuyển</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handleUpdateStatus(2)}>
        <Text style={styles.buttonText}>Đánh dấu đã giao hàng</Text>
      </TouchableOpacity>
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
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  item: {
    paddingVertical: 4,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default OrderDetailScreen;