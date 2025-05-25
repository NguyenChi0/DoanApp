import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
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

type RootStackParamList = {
  CheckoutScreen: undefined;
  Tabs: undefined;
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
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState<number>(0); // Explicitly type as number

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal - discount;

  const handleCheckout = async () => {
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

    if (!address) {
      Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ giao hàng.');
      return;
    }
   
    if (!phoneNumber) {
      Alert.alert('Thông báo', 'Vui lòng nhập số điện thoại.');
      return;
    }

    try {
      const response = await createOrder(address, phoneNumber, cartItems, voucherCode);
      // Ensure discount is a number, default to 0 if undefined or null
      const discountApplied = Number(response.discountApplied) || 0;
      setDiscount(discountApplied);
      Alert.alert(
        'Thành công', 
        `Đặt hàng thành công!${discountApplied > 0 ? ` (Giảm giá: $${discountApplied.toFixed(2)})` : ''}`, 
        [
          { 
            text: 'OK', 
            onPress: () => {
              setCartItems([]);
              navigation.navigate('Tabs');
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error placing order:', error);
      Alert.alert('Lỗi', error.response?.data?.error || 'Đặt hàng thất bại. Vui lòng thử lại.');
    }
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemQuantity}>Số lượng: {item.quantity}</Text>
        <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromCart(item.id)}
      >
        <Text style={styles.removeButtonText}>✕</Text>
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
        <TextInput
          style={styles.input}
          placeholder="Mã voucher (6 ký tự)"
          value={voucherCode}
          onChangeText={setVoucherCode}
          maxLength={6}
          autoCapitalize="characters"
        />
        <Text style={styles.totals}>Tổng phụ: ${subtotal.toFixed(2)}</Text>
        {discount > 0 && <Text style={styles.discount}>Giảm giá: ${(Number(discount) || 0).toFixed(2)}</Text>}
        <Text style={styles.totals}>Tổng cộng: ${total.toFixed(2)}</Text>
        <TouchableOpacity
          style={[styles.checkoutButton, cartItems.length === 0 && styles.checkoutButtonDisabled]}
          onPress={handleCheckout}
          disabled={cartItems.length === 0}
        >
          <Text style={styles.checkoutButtonText}>Xác Nhận Đơn Hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles remain unchanged
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  cartList: {
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 16,
    color: '#16a34a',
    fontWeight: '600',
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  removeButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    fontSize: 16,
    color: '#1f2937',
  },
  totals: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginVertical: 8,
  },
  discount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#dc2626',
    marginVertical: 4,
  },
  checkoutButton: {
    backgroundColor: '#4B0082',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4B0082',
  },
  checkoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#d1d5db',
    borderColor: '#d1d5db',
  },
});

export default CheckoutScreen;