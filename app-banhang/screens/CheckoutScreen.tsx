import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder } from '../services/api';
import Icon from 'react-native-vector-icons/FontAwesome';

type RootStackParamList = {
  CheckoutScreen: undefined;
  HomeScreen: undefined;
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
  const { cartItems, removeFromCart } = useCart();
  const { token } = useAuth();
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
      await createOrder(address, phoneNumber, cartItems);
      Alert.alert('Thành công', 'Đặt hàng thành công!', [
        { text: 'OK', onPress: () => navigation.navigate('HomeScreen') },
      ]);
      // Sau khi đặt hàng thành công, có thể bạn muốn làm trống giỏ hàng
      // setCartItems([]); // Đảm bảo setCartItems được import từ CartContext
    } catch (error) {
      console.error('Lỗi khi đặt hàng:', error);
      Alert.alert('Lỗi', 'Đặt hàng thất bại. Vui lòng thử lại.');
    }
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.listItem}>
      <Text style={styles.itemName}>{item.name}</Text>
      <View style={styles.itemDetails}>
        <Text style={styles.itemQuantity}>x{item.quantity}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeButton}>
          <Icon name="trash" size={20} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {!token ? (
        <View style={styles.loginPrompt}>
          <Icon name="user-circle" size={60} color="#007bff" style={styles.loginIcon} />
          <Text style={styles.loginText}>Bạn cần đăng nhập để thực hiện thanh toán.</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
            <Icon name="sign-in" size={20} color="white" style={styles.loginButtonIcon} />
            <Text style={styles.loginButtonText}>Đăng Nhập</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            style={styles.cartList}
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListHeaderComponent={<Text style={styles.cartTitle}>Giỏ hàng của bạn</Text>}
            ListEmptyComponent={<Text style={styles.emptyCart}>Giỏ hàng trống.</Text>}
          />
          <View style={styles.checkoutForm}>
            <View style={styles.inputContainer}>
              <Icon name="map-marker" size={20} color="#555" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Địa chỉ giao hàng"
                value={address}
                onChangeText={setAddress}
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon name="phone" size={20} color="#555" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
            <Text style={styles.totals}>
              <Icon name="money" size={20} color="green" /> Tổng tiền: ${total.toFixed(2)}
            </Text>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Icon name="check-circle" size={20} color="white" style={styles.checkoutButtonIcon} />
              <Text style={styles.checkoutButtonText}>Xác nhận Đơn hàng</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 10,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginIcon: {
    marginBottom: 20,
  },
  loginText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },
  loginButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButtonIcon: {
    marginRight: 10,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartList: {
    flex: 1,
  },
  cartTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  emptyCart: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    marginBottom: 10,
    borderRadius: 8,
    elevation: 1,
  },
  itemName: {
    fontSize: 16,
    flex: 1,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#333',
  },
  itemPrice: {
    fontSize: 16,
    color: 'green',
    marginRight: 10,
  },
  removeButton: {
    padding: 5,
  },
  checkoutForm: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 10,
    elevation: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
  totals: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  checkoutButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  checkoutButtonIcon: {
    marginRight: 10,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;