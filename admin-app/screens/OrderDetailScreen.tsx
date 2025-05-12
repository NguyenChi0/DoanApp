import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native'; // Add this import
import { RootStackParamList } from '../App';
import { fetchOrderDetails, updateOrderStatus, getOrderStatusText } from '../api';

// Define navigation and route types
type OrderDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OrderDetail'>;
type OrderDetailScreenRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;

// Define Props type
type Props = {
  navigation: OrderDetailScreenNavigationProp;
  route: OrderDetailScreenRouteProp;
};

// Define OrderDetail type
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

const OrderDetailScreen = ({ navigation, route }: Props) => {
  const { orderId } = route.params;
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadOrderDetail = async () => {
      try {
        setIsLoading(true);
        const data = await fetchOrderDetails(orderId);
        setOrderDetail(data);
      } catch (error) {
        console.error('Error fetching order details:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
      } finally {
        setIsLoading(false);
      }
    };
    loadOrderDetail();
  }, [orderId]);

  const handleUpdateStatus = async (newStatus: number) => {
    try {
      setIsLoading(true);
      await updateOrderStatus(orderId, newStatus);
      setOrderDetail((prev) => (prev ? { ...prev, order: { ...prev.order, status: newStatus } } : null));
      Alert.alert('Thành công', 'Đã cập nhật trạng thái đơn hàng');
    } catch (error: any) {
      console.error('Error updating order status:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật trạng thái đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmCancelOrder = () => {
    Alert.alert(
      'Xác nhận huỷ đơn',
      'Bạn có chắc chắn muốn huỷ đơn hàng này?',
      [
        { text: 'Không', style: 'cancel' },
        { text: 'Huỷ đơn', style: 'destructive', onPress: () => handleUpdateStatus(3) },
      ]
    );
  };

  if (!orderDetail) return <Text style={styles.loadingText}>Đang tải...</Text>;

  const { status } = orderDetail.order;
  const canChangeToShipping = status === 0;
  const canChangeToDelivered = status === 0 || status === 1;
  const canCancel = status !== 2 && status !== 3;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Chi tiết đơn hàng #{orderDetail.order.id}</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Khách hàng: {orderDetail.order.user_name}</Text>
        <Text style={styles.infoText}>Địa chỉ: {orderDetail.order.address}</Text>
        <Text style={styles.infoText}>SĐT: {orderDetail.order.phone_number || 'Không có'}</Text>
        <Text style={styles.infoText}>Tổng giá: {orderDetail.order.total_price.toLocaleString('vi-VN')}₫</Text>
        <Text style={styles.infoText}>
          Trạng thái: <Text style={getStatusStyle(orderDetail.order.status)}>
            {getOrderStatusText(orderDetail.order.status)}
          </Text>
        </Text>
      </View>

      <Text style={styles.subtitle}>Danh sách sản phẩm:</Text>
      {orderDetail.items.map((item, index) => (
        <View key={index} style={styles.item}>
          <Text style={styles.itemText}>{item.product_name}</Text>
          <Text style={styles.itemDetail}>
            Số lượng: {item.quantity} - Giá: {item.price.toLocaleString('vi-VN')}₫
          </Text>
        </View>
      ))}

      <View style={styles.buttonContainer}>
        {canChangeToShipping && (
          <TouchableOpacity
            style={[styles.button, styles.shippingButton]}
            onPress={() => handleUpdateStatus(1)}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Đánh dấu đang vận chuyển</Text>
          </TouchableOpacity>
        )}

        {canChangeToDelivered && (
          <TouchableOpacity
            style={[styles.button, styles.deliveredButton]}
            onPress={() => handleUpdateStatus(2)}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Đánh dấu đã giao hàng</Text>
          </TouchableOpacity>
        )}

        {canCancel && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={confirmCancelOrder}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Huỷ đơn hàng</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const getStatusStyle = (status: number) => {
  switch (status) {
    case 0:
      return styles.statusPending;
    case 1:
      return styles.statusShipping;
    case 2:
      return styles.statusDelivered;
    case 3:
      return styles.statusCancelled;
    default:
      return {};
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  item: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    marginBottom: 8,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  shippingButton: {
    backgroundColor: '#2196F3',
  },
  deliveredButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusPending: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  statusShipping: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  statusDelivered: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  statusCancelled: {
    color: '#F44336',
    fontWeight: 'bold',
  },
});

export default OrderDetailScreen;