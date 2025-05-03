import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchProductById } from '../services/api';
import { useCart } from '../contexts/CartContext';
import Icon from 'react-native-vector-icons/FontAwesome';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchProductById(Number(productId));
        setProduct(response);
      } catch (err) {
        console.error('Lỗi khi tải sản phẩm:', err);
        setError('Không thể tải sản phẩm. Vui lòng kiểm tra kết nối internet và thử lại.');
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Đang tải thông tin sản phẩm...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="exclamation-triangle" size={50} color="#dc3545" style={styles.errorIcon} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => {
          setLoading(true);
          setError(null);
          fetchProductById(Number(productId))
            .then(setProduct)
            .catch((err) => {
              console.error('Lỗi khi tải lại sản phẩm:', err);
              setError('Không thể tải lại sản phẩm. Vui lòng thử lại sau.');
            })
            .finally(() => setLoading(false));
        }}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!product) {
    return <Text>Không tìm thấy sản phẩm.</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="#333" />
          <Text style={styles.backButtonText}>Trở lại</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{product.name}</Text>
        <View style={styles.priceStockContainer}>
          <Text style={styles.price}>${product.price}</Text>
          <View style={styles.stockContainer}>
            <Icon
              name={product.stock > 0 ? 'check-circle' : 'times-circle'}
              size={16}
              color={product.stock > 0 ? '#28a745' : '#dc3545'}
              style={styles.stockIcon}
            />
            <Text style={styles.stockText}>{product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}</Text>
          </View>
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.addToCartButton, product.stock <= 0 && styles.disabledButton]}
        onPress={handleAddToCart}
        disabled={product.stock <= 0}
      >
        <Icon name="shopping-cart" size={20} color="white" style={styles.cartIcon} />
        <Text style={styles.addToCartText}>{product.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#333',
  },
  imageContainer: {
    backgroundColor: 'white',
    padding: 15,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
  detailsContainer: {
    padding: 20,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  priceStockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  price: {
    fontSize: 22,
    color: '#e44d26',
    fontWeight: 'bold',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockIcon: {
    marginRight: 5,
  },
  stockText: {
    fontSize: 16,
    color: '#777',
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  addToCartButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  addToCartText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  cartIcon: {
    marginRight: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#777',
  },
});

export default ProductDetailScreen;