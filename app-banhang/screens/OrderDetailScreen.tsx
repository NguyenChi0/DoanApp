import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  Image,
  TouchableOpacity,
  Alert,
  Linking,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchOrderDetails, cancelOrder, getOrderStatusText } from '../services/api';

type RootStackParamList = {
  OrdersScreen: undefined;
  OrderDetailScreen: { orderId: string };
  ReviewScreen: { productId: number };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderDetailScreen'>;
type RouteProps = RouteProp<RootStackParamList, 'OrderDetailScreen'>;

interface Order {
  id: number;
  user_name: string;
  address: string;
  phone_number: string;
  total_price: number | string | undefined;
  created_at: string;
  status: number;
}

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number | string | undefined;
  product_name: string;
  product_image: string | null;
}

const OrderDetailScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const { orderId } = route.params;
  const navigation = useNavigation<NavigationProp>();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchOrderDetails(Number(orderId));
        console.log('Order details:', data);
        setOrder(data.order);
        setItems(data.items);
        setError(null);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    loadOrderDetails();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!order) return;

    Alert.alert(
      'Xác nhận hủy đơn hàng',
      'Bạn có chắc chắn muốn hủy đơn hàng này không?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Xác Nhận',
          style: 'destructive',
          onPress: async () => {
            setCancelLoading(true);
            try {
              const response = await cancelOrder(order.id);
              Alert.alert('Thành công', response.message);
              const updatedData = await fetchOrderDetails(Number(orderId));
              setOrder(updatedData.order);
              setItems(updatedData.items);
            } catch (err: any) {
              console.error('Error cancelling order:', err);
              Alert.alert('Lỗi', err.response?.data?.message || 'Không thể hủy đơn hàng.');
            } finally {
              setCancelLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleReportOrder = () => {
    const phoneNumber = '0945932004';
    const url = `tel:${phoneNumber}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) return Linking.openURL(url);
        Alert.alert('Lỗi', 'Không thể thực hiện cuộc gọi trên thiết bị này.');
      })
      .catch((err) => {
        console.error('Error opening phone dialer:', err);
        Alert.alert('Lỗi', 'Không thể mở ứng dụng gọi điện.');
      });
  };

  const handleReviewProduct = (productId: number) => {
    navigation.navigate('ReviewScreen', { productId });
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

  const renderItem = ({ item }: { item: OrderItem }) => {
    if (!order) return null;
    
    return order.status === 2 ? (
      <Pressable
        onPress={() => handleReviewProduct(item.product_id)}
        style={[styles.itemContainer, styles.reviewableItem]}
      >
        {item.product_image ? (
          <Image source={{ uri: item.product_image }} style={styles.itemImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.product_name}</Text>
          <Text style={styles.itemQuantity}>Số lượng: {item.quantity}</Text>
          <Text style={styles.itemPrice}>Đơn giá: ${formatPrice(item.price)}</Text>
          <Text style={styles.itemTotal}>
            Tổng: ${(Number(item.quantity) * Number(formatPrice(item.price))).toFixed(2)}
          </Text>
          <View style={styles.reviewPrompt}>
            <Text style={styles.reviewPromptText}>👆 Nhấn để đánh giá sản phẩm</Text>
          </View>
        </View>
      </Pressable>
    ) : (
      <View style={styles.itemContainer}>
        {item.product_image ? (
          <Image source={{ uri: item.product_image }} style={styles.itemImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.product_name}</Text>
          <Text style={styles.itemQuantity}>Số lượng: {item.quantity}</Text>
          <Text style={styles.itemPrice}>Đơn giá: ${formatPrice(item.price)}</Text>
          <Text style={styles.itemTotal}>
            Tổng: ${(Number(item.quantity) * Number(formatPrice(item.price))).toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4B0082" />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Đơn hàng không tồn tại.'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Đơn hàng #{order.id}</Text>
        <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
      </View>
      
      <View style={styles.orderDetails}>
        <Text style={styles.userName}>Khách hàng: {order.user_name}</Text>
        <Text style={styles.orderAddress}>Địa chỉ: {order.address}</Text>
        <Text style={styles.orderPhone}>Số điện thoại: {order.phone_number}</Text>
        <Text style={styles.orderStatus}>Trạng thái: {getOrderStatusText(order.status)}</Text>
        <Text style={styles.orderTotal}>Tổng tiền: ${formatPrice(order.total_price)}</Text>
      </View>

      <View style={styles.buttonContainer}>
        {order.status === 0 && (
          <TouchableOpacity 
            style={[styles.cancelButton, cancelLoading && styles.disabledButton]} 
            onPress={handleCancelOrder}
            disabled={cancelLoading}
          >
            {cancelLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.reportButton}
          onPress={handleReportOrder}
        >
          <Text style={styles.reportButtonText}>Gặp vấn đề với đơn hàng? Liên hệ ngay</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.itemsHeader}>
        Sản phẩm trong đơn hàng:
        {order.status === 2 && (
          <Text style={styles.reviewHint}> (Nhấn vào sản phẩm để đánh giá)</Text>
        )}
      </Text>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.itemsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B0082',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  orderDetails: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 16,
    marginBottom: 8,
  },
  orderAddress: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  orderPhone: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  orderStatus: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: '#c0392b',
    opacity: 0.7,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reportButton: {
    backgroundColor: '#4B0082',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  reportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  reviewHint: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#4B0082',
    fontStyle: 'italic',
  },
  itemsList: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewableItem: {
    borderWidth: 2,
    borderColor: '#4B0082',
    borderStyle: 'dashed',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  placeholderText: {
    color: '#666',
    fontSize: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'green',
  },
  reviewPrompt: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  reviewPromptText: {
    fontSize: 12,
    color: '#4B0082',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default OrderDetailScreen;