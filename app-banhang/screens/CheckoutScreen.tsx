import React, { useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';

type RootStackParamList = {
  CheckoutScreen: undefined;
  HomeScreen: undefined;
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
  const [userName, setUserName] = useState('');
  const [address, setAddress] = useState('');

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!userName || !address) {
      alert('Please fill in your name and address.');
      return;
    }

    try {
      const orderData = {
        user_name: userName,
        address,
        cartItems,
      };

      await axios.post('http://192.168.52.114:3000/orders', orderData);
      alert('Order placed successfully!');
      setCartItems([]);
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
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
          placeholder="Your Name"
          value={userName}
          onChangeText={setUserName}
        />
        <TextInput
          style={styles.input}
          placeholder="Your Address"
          value={address}
          onChangeText={setAddress}
        />
        <Text style={styles.totals}>Total: ${total}</Text>
        <Button title="Confirm Order" onPress={handleCheckout} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', padding: 20 },
  item: { marginBottom: 10 },
  quantity: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  price: { fontSize: 16, color: 'green' }, // Ensure this is defined
  totals: { fontSize: 20, marginVertical: 10 },
  form: { padding: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
});

export default CheckoutScreen;