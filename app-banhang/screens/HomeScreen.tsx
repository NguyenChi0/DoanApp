import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCart } from '../contexts/CartContext';

type RootStackParamList = {
  HomeScreen: undefined;
  ProductDetailScreen: { productId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Product {
  id: number;
  name: string;
  price: number;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { products } = useCart();

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        navigation.navigate('ProductDetailScreen', { productId: item.id.toString() })
      }
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>${item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  name: { fontSize: 18, fontWeight: 'bold' },
  price: { fontSize: 16, color: 'green' }, // Ensure this is defined
});

export default HomeScreen;