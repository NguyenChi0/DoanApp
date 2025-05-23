import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchProductById } from '../services/api';
import { useCart } from '../contexts/CartContext';
import Icon from 'react-native-vector-icons/FontAwesome';
import ProductReviews from '../components/ProductReview'; // Import ProductReview component

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
        <ActivityIndicator size="large" color="#6A5ACD" />
        <Text style={styles.loadingText}>Đang tải thông tin sản phẩm...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="exclamation-circle" size={70} color="#FF6347" style={styles.errorIcon} />
        <Text style={styles.errorTitle}>Đã xảy ra lỗi!</Text>
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
    return (
      <View style={styles.emptyContainer}>
        <Icon name="search" size={60} color="#AAAAAA" />
        <Text style={styles.emptyText}>Không tìm thấy sản phẩm.</Text>
        <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
          <Text style={styles.goBackButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6A5ACD" barStyle="light-content" />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{product.name}</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{product.price.toLocaleString('vi-VN')}₫</Text>
            <View style={styles.stockContainer}>
              {product.stock > 0 ? (
                <View style={styles.inStockBadge}>
                  <Icon name="check" size={12} color="#FFFFFF" />
                  <Text style={styles.stockText}>Còn hàng</Text>
                </View>
              ) : (
                <View style={styles.outOfStockBadge}>
                  <Icon name="times" size={12} color="#FFFFFF" />
                  <Text style={styles.stockTextOut}>Hết hàng</Text>
                </View>
              )}
            </View>
          </View>
          
          {product.stock > 0 && (
            <View style={styles.quantityInfoContainer}>
              <Icon name="cube" size={16} color="#666666" />
              <Text style={styles.quantityText}>Còn {product.stock} sản phẩm</Text>
            </View>
          )}
          
          <View style={styles.divider} />
          
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.deliveryInfoContainer}>
            <Text style={styles.sectionTitle}>Thông tin vận chuyển</Text>
            <View style={styles.deliveryItem}>
              <Icon name="truck" size={16} color="#6A5ACD" style={styles.deliveryIcon} />
              <Text style={styles.deliveryText}>Giao hỏa tốc nội thành trong 3h</Text>
            </View>
            <View style={styles.deliveryItem}>
              <Icon name="refresh" size={16} color="#6A5ACD" style={styles.deliveryIcon} />
              <Text style={styles.deliveryText}>Đổi trả trong vòng 7 ngày</Text>
            </View>
            <View style={styles.deliveryItem}>
              <Icon name="shield" size={16} color="#6A5ACD" style={styles.deliveryIcon} />
              <Text style={styles.deliveryText}>Bảo hành chính hãng 12 tháng</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.addToCartButtonInline, product.stock <= 0 && styles.disabledButton]}
            onPress={handleAddToCart}
            disabled={product.stock <= 0}
          >
            <Icon name="shopping-cart" size={20} color="white" style={styles.cartIcon} />
            <Text style={styles.addToCartText}>
              {product.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          {/* Tích hợp component ProductReviews */}
          <ProductReviews productId={product.id} />
          
          <View style={styles.spacer} />
        </View>
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContainer: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  nameContainer: {
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 28,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6A5ACD',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inStockBadge: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  outOfStockBadge: {
    backgroundColor: '#FF6347',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  stockText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  stockTextOut: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  quantityInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  quantityText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 15,
  },
  descriptionContainer: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555555',
  },
  deliveryInfoContainer: {
    marginBottom: 20,
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryIcon: {
    marginRight: 10,
  },
  deliveryText: {
    fontSize: 14,
    color: '#555555',
  },
  addToCartButtonInline: {
    backgroundColor: '#6A5ACD',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 2,
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  cartIcon: {
    marginRight: 5,
  },
  disabledButton: {
    backgroundColor: '#D3D3D3',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
  },
  errorIcon: {
    marginBottom: 15,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#777777',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#6A5ACD',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 2,
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
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    fontSize: 18,
    color: '#777777',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  goBackButton: {
    backgroundColor: '#6A5ACD',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    elevation: 2,
  },
  goBackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spacer: {
    height: 40,
  },
});

export default ProductDetailScreen;