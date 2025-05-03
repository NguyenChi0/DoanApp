import React, { useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext'; // Thêm useAuth để kiểm tra đăng nhập
import { createOrder } from '../services/api';

// Cập nhật RootStackParamList để bao gồm Login
type RootStackParamList = {
  CheckoutScreen: undefined;
  HomeScreen: undefined;
  Login: undefined; // Thêm Login
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
  const { token } = useAuth(); // Lấy token để kiểm tra trạng thái đăng nhập
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
      alert('Vui lòng nhập địa chỉ giao hàng.');
      return;
    }
    
    if (!phoneNumber) {
      alert('Vui lòng nhập số điện thoại.');
      return;
    }

    try {
      await createOrder(address, phoneNumber, cartItems);
      alert('Đặt hàng thành công!');
      setCartItems([]);
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Đặt hàng thất bại. Vui lòng thử lại.');
    }
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.container}>
      <Text style={styles.item}>{item.name}</Text>
      <Text style={styles.quantity}>x{item.quantity}</Text>
      <Text style={styles.price}>${item.price}</Text>
      <Button title="X" onPress={() => removeFromCart(item.id)} />
    </View>
  );

  return (
    <>
      <FlatList
        style={styles.container}
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
        <Text style={styles.totals}>Tổng tiền: ${total}</Text>
        <Button title="Xác nhận Đơn hàng" onPress={handleCheckout} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', padding: 20 },
  item: { marginBottom: 10 },
  quantity: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  price: { fontSize: 16, color: 'green' },
  totals: { fontSize: 20, marginVertical: 10 },
  form: { padding: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
});

export default CheckoutScreen;