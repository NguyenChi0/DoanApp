import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchProductReviews, submitProductReview, deleteReview, Review } from '../services/api';
import { useNavigation } from '@react-navigation/native';

interface ProductReviewsProps {
  productId: number;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const navigation = useNavigation();

  // Load reviews and check login status
  useEffect(() => {
    loadReviews();
    checkLoginStatus();
  }, [productId]);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        setIsLoggedIn(true);
        setUserId(user.id);
        console.log('User is logged in with ID:', user.id); // Debug log
      } else {
        setIsLoggedIn(false);
        setUserId(null);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    }
  };

  // Load reviews và check login status
  useEffect(() => {
    loadReviews();
    checkLoginStatus();
  }, [productId]);

  const loadReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProductReviews(productId);
      setReviews(data);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError('Không thể tải đánh giá. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần đăng nhập để viết đánh giá.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Login' as never) }
        ]
      );
      return;
    }

    if (userRating === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn số sao đánh giá');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitProductReview(productId, userRating, userComment);
      Alert.alert('Thành công', 'Đánh giá của bạn đã được gửi thành công');
      setUserRating(0);
      setUserComment('');
      loadReviews(); // Reload reviews to show the new one
    } catch (err) {
      console.error('Error submitting review:', err);
      Alert.alert('Lỗi', 'Không thể gửi đánh giá. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa đánh giá này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReview(reviewId);
              loadReviews(); // Reload reviews after deletion
            } catch (err) {
              console.error('Error deleting review:', err);
              Alert.alert('Lỗi', 'Không thể xóa đánh giá. Vui lòng thử lại sau.');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const renderReviewItem = ({ item }: { item: Review }) => {
    const isUserReview = userId === item.user_id;
    
    return (
      <View style={styles.reviewItem}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewUser}>
            <Icon name="user-circle" size={24} color="#6A5ACD" />
            <Text style={styles.userName}>{item.full_name || item.username}</Text>
          </View>
          <Text style={styles.reviewDate}>{formatDate(item.created_at)}</Text>
        </View>
        
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Icon
              key={star}
              name="star"
              size={16}
              color={star <= item.rating ? '#FFD700' : '#DDDDDD'}
              style={styles.starIcon}
            />
          ))}
        </View>
        
        {item.comment && (
          <Text style={styles.reviewComment}>{item.comment}</Text>
        )}
        
        {isUserReview && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteReview(item.id)}
          >
            <Icon name="trash" size={14} color="#FF6347" />
            <Text style={styles.deleteText}>Xóa</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderStarRating = () => {
    return (
      <View style={styles.starRatingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setUserRating(star)}
            disabled={isSubmitting}
          >
            <Icon
              name="star"
              size={30}
              color={star <= userRating ? '#FFD700' : '#DDDDDD'}
              style={styles.starSelectIcon}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#6A5ACD" />
        <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Đánh giá sản phẩm</Text>
      
      {/* Hiển thị thông tin đăng nhập để debug */}
      <Text style={{color: '#999', fontSize: 12, marginBottom: 5}}>
        Trạng thái: {isLoggedIn ? 'Đã đăng nhập' : 'Chưa đăng nhập'} 
        {userId ? ` (ID: ${userId})` : ''}
      </Text>
      
      {/* Review submission form */}
      <View style={styles.reviewFormContainer}>
        <Text style={styles.ratingLabel}>Đánh giá của bạn:</Text>
        {renderStarRating()}
        
        <TextInput
          style={styles.commentInput}
          placeholder="Nhập nhận xét của bạn (tùy chọn)"
          value={userComment}
          onChangeText={setUserComment}
          multiline
          maxLength={500}
          editable={!isSubmitting}
        />
        
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmitReview}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.reviewsHeaderContainer}>
        <Text style={styles.reviewsCountText}>
          {reviews.length > 0 ? `${reviews.length} đánh giá` : 'Chưa có đánh giá nào'}
        </Text>
        
        {error && (
          <TouchableOpacity onPress={loadReviews}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {reviews.length > 0 ? (
        <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.reviewsList}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false} // Let the parent ScrollView handle scrolling
        />
      ) : !loading && !error && (
        <View style={styles.emptyReviewsContainer}>
          <Icon name="comments-o" size={40} color="#CCCCCC" />
          <Text style={styles.emptyReviewsText}>
            Hãy là người đầu tiên đánh giá sản phẩm này!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 10,
    borderRadius: 8,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
  reviewFormContainer: {
    marginBottom: 20,
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 8,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 8,
  },
  starRatingContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  starSelectIcon: {
    marginRight: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#333333',
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#6A5ACD',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#B0B0B0',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  reviewsHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  reviewsCountText: {
    fontSize: 14,
    color: '#555555',
    fontWeight: 'bold',
  },
  retryText: {
    fontSize: 14,
    color: '#6A5ACD',
    fontWeight: 'bold',
  },
  reviewsList: {
    paddingBottom: 10,
  },
  reviewItem: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555555',
  },
  reviewDate: {
    fontSize: 12,
    color: '#888888',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starIcon: {
    marginRight: 3,
  },
  reviewComment: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 10,
    padding: 5,
  },
  deleteText: {
    fontSize: 12,
    color: '#FF6347',
    marginLeft: 4,
  },
  emptyReviewsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyReviewsText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginTop: 10,
  }
});

export default ProductReviews;