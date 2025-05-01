import React from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.item}>{item.name}</Text>
      <Text style={styles.quantity}>x{item.quantity}</Text>
      <Text style={styles.price}>${item.price}</Text>
      <Button title="X" onPress={() => removeFromCart(item.id)} />
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        style={styles.container}
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
      <Text style={styles.totals}>Total: ${total}</Text>
      <Button
        title="Thanh toán"
        onPress={() => navigation.navigate('CheckoutScreen')}
        disabled={cartItems.length === 0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flexDirection: 'row', padding: 20 },
  item: { marginBottom: 10 },
  quantity: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  price: { fontSize: 16, color: 'green' }, // Ensure this is defined
  totals: { fontSize: 20, margin: 20, textAlign: 'center' },
});

export default CartScreen;