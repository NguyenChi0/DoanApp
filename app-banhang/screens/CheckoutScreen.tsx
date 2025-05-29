import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView,
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
  const [discount, setDiscount] = useState<number>(0);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

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

    if (!isTermsAccepted) {
      Alert.alert('Thông báo', 'Vui lòng xác nhận đồng ý với điều khoản và điều kiện.');
      return;
    }

    try {
      const response = await createOrder(address, phoneNumber, cartItems, voucherCode);
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

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Xác Nhận Đơn Hàng</Text>
        <Text style={styles.headerSubtitle}>Kiểm tra thông tin và hoàn tất đơn hàng</Text>
      </View>

      {/* Cart Items Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sản phẩm đã chọn</Text>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.cartItem}>
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
        ))}
      </View>

      {/* Delivery Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
        <Text style={styles.sectionTitle1}>Địa chỉ giao hàng</Text>
        <TextInput
          style={styles.input}
          placeholder="Vui lòng nhập địa chỉ cụ thể"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={2}
        />
        <Text style={styles.sectionTitle1}>Số điện thoại người nhận</Text>
        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
      </View>

      {/* Voucher Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mã giảm giá</Text>
        <TextInput
          style={styles.input}
          placeholder="Vui lòng kiểm tra kĩ trước, sau khi nhập"
          value={voucherCode}
          onChangeText={setVoucherCode}
          maxLength={6}
          autoCapitalize="characters"
        />
        {discount > 0 && (
          <View style={styles.discountContainer}>
            <Text style={styles.discountText}>Giảm giá: -${discount.toFixed(2)}</Text>
          </View>
        )}
      </View>

      {/* Order Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tạm tính:</Text>
          <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
        </View>
        {discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Giảm giá:</Text>
            <Text style={styles.discountValue}>-${discount.toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Terms and Conditions */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => setIsTermsAccepted(!isTermsAccepted)}
        >
          <View style={[styles.checkbox, isTermsAccepted && styles.checkboxChecked]}>
            {isTermsAccepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxText}>
            Tôi đồng ý với <Text style={styles.linkText}>điều khoản và điều kiện</Text> của cửa hàng
          </Text>
        </TouchableOpacity>
      </View>

      {/* Checkout Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.checkoutButton, 
            (cartItems.length === 0 || !isTermsAccepted) && styles.checkoutButtonDisabled
          ]}
          onPress={handleCheckout}
          disabled={cartItems.length === 0 || !isTermsAccepted}
        >
          <Text style={styles.checkoutButtonText}>Xác Nhận Đơn Hàng</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '400',
  },
  section: {
    marginTop: 16,
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  sectionTitle1: {
    fontSize:16,
    paddingBottom:8,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 16,
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
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  removeButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#f9fafb',
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 12,
  },
  discountContainer: {
    backgroundColor: '#dcfce7',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  discountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#15803d',
  },
  summarySection: {
    marginTop: 16,
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4B0082',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  discountValue: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4B0082',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#4B0082',
    borderColor: '#4B0082',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  linkText: {
    color: '#4B0082',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    marginTop: 24,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  
  checkoutButton: {
    backgroundColor: '#4B0082',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4B0082',
    shadowColor: '#4B0082',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  checkoutButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#d1d5db',
    borderColor: '#d1d5db',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default CheckoutScreen;