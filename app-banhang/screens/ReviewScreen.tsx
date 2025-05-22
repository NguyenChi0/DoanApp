import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { submitProductReview, fetchProductById } from '../services/api';

type RootStackParamList = {
  ReviewScreen: { productId: number };
  OrderDetailScreen: { orderId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ReviewScreen'>;
type RouteProps = RouteProp<RootStackParamList, 'ReviewScreen'>;

interface Product {
  id: number;
  name: string;
  image: string | null;
  price: number | string | undefined;
  description?: string;
}

const ReviewScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { productId } = route.params;

  const [product, setProduct] = useState<Product | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const productData = await fetchProductById(productId);
        setProduct(productData);
      } catch (error) {
        console.error('Error fetching product:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, navigation]);

  const handleStarPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn số sao đánh giá');
      return;
    }

    if (comment.trim().length === 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập nhận xét về sản phẩm');
      return;
    }

    try {
      setSubmitting(true);
      const response = await submitProductReview(productId, rating, comment.trim());
      Alert.alert('Thành công', response.message || 'Đánh giá đã được gửi thành công', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      const errorMessage = error.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại sau.';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleStarPress(i)}
          style={styles.starButton}
        >
          <Text style={[styles.star, rating >= i && styles.starFilled]}>★</Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const getRatingText = (rating: number): string => {
    switch (rating) {
      case 1:
        return 'Rất tệ';
      case 2:
        return 'Tệ';
      case 3:
        return 'Bình thường';
      case 4:
        return 'Tốt';
      case 5:
        return 'Rất tốt';
      default:
        return '';
    }
  };

  // Helper function to format price safely
  const formatPrice = (price: number | string | undefined): string => {
    if (price === undefined || price === null) return '0.00';
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4B0082" />
        <Text style={styles.loadingText}>Đang tải thông tin sản phẩm...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Không thể tải thông tin sản phẩm</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Information */}
        <View style={styles.productContainer}>
          {product.image ? (
            <Image source={{ uri: product.image }} style={styles.productImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>${formatPrice(product.price)}</Text>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingContainer}>
          <Text style={styles.sectionTitle}>Đánh giá sản phẩm</Text>
          <Text style={styles.ratingLabel}>Chọn số sao:</Text>
          
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
          
          {rating > 0 && (
            <Text style={styles.ratingText}>
              {rating} sao - {getRatingText(rating)}
            </Text>
          )}
        </View>

        {/* Comment Section */}
        <View style={styles.commentContainer}>
          <Text style={styles.sectionTitle}>Nhận xét của bạn</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.characterCount}>
            {comment.length}/500 ký tự
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (rating === 0 || comment.trim().length === 0 || submitting) && styles.disabledButton
          ]}
          onPress={handleSubmitReview}
          disabled={rating === 0 || comment.trim().length === 0 || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={submitting}
        >
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
    textAlign: 'center',
  },
  productContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#EEE',
    marginRight: 16,
  },
  placeholderImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  placeholderText: {
    color: '#999',
    fontSize: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E88E5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  ratingContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  ratingLabel: {
    fontSize: 16,
    color: '#555',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  starButton: {
    padding: 6,
  },
  star: {
    fontSize: 36,
    color: '#DDD',
  },
  starFilled: {
    color: '#FFD700',
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#1E88E5',
    fontWeight: '600',
  },
  commentContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: '#FAFAFA',
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  submitButton: {
  backgroundColor: '#0000d2', // màu tím
  borderRadius: 30, // bo góc tròn
  padding: 16,
  alignItems: 'center',
  marginBottom: 12,
},

disabledButton: {
  backgroundColor: '#ccc',
  opacity: 0.6,
},

submitButtonText: {
  color: 'white',
  fontSize: 18,
  fontWeight: 'bold',
},

cancelButton: {
  backgroundColor: '#ba2a2f', // màu đỏ
  borderRadius: 30, // bo góc tròn
  padding: 16,
  alignItems: 'center',
  marginBottom: 20,
},

cancelButtonText: {
  color: 'white',
  fontSize: 16,
  fontWeight: '600',
},

});


export default ReviewScreen;