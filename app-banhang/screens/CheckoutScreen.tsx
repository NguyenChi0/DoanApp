import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Button, 
  StyleSheet, 
  TextInput, 
  Alert,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder } from '../services/api';

// Updated RootStackParamList to include all necessary screens
type RootStackParamList = {
  CheckoutScreen: undefined;
  Tabs: undefined;  // This is important - navigate to the Tabs navigator 
  Login: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { cartItems, removeFromCart, setCartItems } = useCart();
  const { token } = useAuth();
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    // Kiểm tra nếu chưa đăng nhập
    if (!token) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần đăng nhập để đặt hàng. Đăng nhập ngay?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng Nhập', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    // Nếu đã đăng nhập, tiếp tục kiểm tra địa chỉ và số điện thoại
    if (!address) {
      Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ giao hàng.');
      return;
    }
   
    if (!phoneNumber) {
      Alert.alert('Thông báo', 'Vui lòng nhập số điện thoại.');
      return;
    }

    try {
      await createOrder(address, phoneNumber, cartItems);
      Alert.alert('Thành công', 'Đặt hàng thành công!', [
        { text: 'OK', onPress: () => {
          setCartItems([]);
          // Navigate back to the main tabs navigator
          navigation.navigate('Tabs');
        }}
      ]);
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Lỗi', 'Đặt hàng thất bại. Vui lòng thử lại.');
    }
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemQuantity}>x{item.quantity}</Text>
        <Text style={styles.itemPrice}>${item.price}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromCart(item.id)}
      >
        <Text style={styles.removeButtonText}>X</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.cartList}
      />
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Địa chỉ giao hàng"
          value={address}
          onChangeText={setAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        <Text style={styles.totals}>Tổng tiền: ${total.toFixed(2)}</Text>
        <TouchableOpacity
          style={[styles.checkoutButton, cartItems.length === 0 && styles.checkoutButtonDisabled]}
          onPress={handleCheckout}
          disabled={cartItems.length === 0}
        >
          <Text style={styles.checkoutButtonText}>Xác nhận Đơn hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  cartList: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: 'bold',
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 30,
    backgroundColor: '#dc3545',
    borderRadius: 15,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  totals: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#333',
  },
  checkoutButton: {
    backgroundColor: '#4B0082',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#aaa',
  },
});

export default CheckoutScreen;