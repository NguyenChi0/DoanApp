import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCart } from '../contexts/CartContext';

type RootStackParamList = {
  CartScreen: undefined;
  CheckoutScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

const CartScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { cartItems, removeFromCart } = useCart();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Tổng cộng: ${total}</Text>
        <TouchableOpacity
          style={[styles.checkoutButton, cartItems.length === 0 && styles.checkoutButtonDisabled]}
          onPress={() => navigation.navigate('CheckoutScreen')}
          disabled={cartItems.length === 0}
        >
          <Text style={styles.checkoutButtonText}>Thanh toán</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f4f4',
  },
  cartList: {
    paddingBottom: 16,
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
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
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
  totalContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  checkoutButton: {
    backgroundColor: '#FF7F50',
    paddingVertical: 12,
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

export default CartScreen;
