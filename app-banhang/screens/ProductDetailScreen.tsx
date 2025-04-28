import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Button } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchProductById } from '../services/api';
import { useCart } from '../contexts/CartContext';

// Define the nested tab navigator param list
type TabParamList = {
  Home: undefined;
  Cart: undefined;
  Orders: undefined;
};

// Define the root stack navigator param list
type RootStackParamList = {
  Tabs: { screen?: keyof TabParamList };
  ProductDetailScreen: { productId: string };
  CheckoutScreen: undefined;
  OrderDetailScreen: { orderId: string };
  Login: undefined;
  Register: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'ProductDetailScreen'>;

// Define the Product type based on backend response
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  stock: number;
}

const ProductDetailScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const { productId } = route.params;
  const navigation = useNavigation<NavigationProp>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetchProductById(Number(productId));
        setProduct(response);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Không thể tải sản phẩm. Vui lòng thử lại.');
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id.toString(),
        name: product.name,
        price: product.price,
        quantity: 1,
      });
      navigation.navigate('Tabs', { screen: 'Cart' });
    }
  };

  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!product) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.description}>{product.description}</Text>
      <Text style={styles.price}>${product.price}</Text>
      <Text style={styles.stock}>In stock: {product.stock}</Text>
      <Button title="Add to Cart" onPress={handleAddToCart} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  image: { width: '100%', height: 250, resizeMode: 'contain' },
  name: { fontSize: 24, fontWeight: 'bold', marginVertical: 10 },
  description: { fontSize: 16, marginBottom: 10 },
  price: { fontSize: 20, color: 'green', marginBottom: 10 },
  stock: { fontSize: 16, marginBottom: 10 },
  error: { color: 'red', textAlign: 'center', marginTop: 20 },
});

export default ProductDetailScreen;