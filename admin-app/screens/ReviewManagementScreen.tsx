import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { fetchReviews, deleteReview } from '../api';
import Icon from 'react-native-vector-icons/FontAwesome';

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user_id: number;
  username: string;
  full_name: string;
  product_id: number;
  product_name: string;
}

const ReviewManagementScreen: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all reviews
  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await fetchReviews();
      setReviews(data);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // Handle delete review
  const handleDeleteReview = async (reviewId: number) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa đánh giá này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReview(reviewId);
              setReviews(reviews.filter((review) => review.id !== reviewId));
              Alert.alert('Thành công', 'Đánh giá đã được xóa');
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa đánh giá');
            }
          },
        },
      ]
    );
  };

  // Format created_at date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render each review item
  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewContainer}>
      <View style={styles.reviewHeader}>
        <Text style={styles.productName}>{item.product_name}</Text>
        <Text style={styles.createdAt}>{formatDate(item.created_at)}</Text>
      </View>
      <View style={styles.userRow}>
        <Icon name="user" size={18} color="#666" style={styles.icon} />
        <Text style={styles.userText}>{item.full_name} ({item.username})</Text>
      </View>
      <View style={styles.ratingRow}>
        <Icon name="star" size={18} color="#FFD700" style={styles.icon} />
        <Text style={styles.ratingText}>{item.rating} sao</Text>
      </View>
      <Text style={styles.commentText}>
        Bình luận: {item.comment || 'Không có bình luận'}
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteReview(item.id)}
          activeOpacity={0.7}
        >
          <Icon name="trash" size={20} color="#fff" />
          <Text style={styles.buttonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="comment-o" size={50} color="#999" />
      <Text style={styles.emptyText}>Không có đánh giá nào</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quản lý Đánh giá</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : reviews.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderReview}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#E3F2FD', // Single color background
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E88E5',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  reviewContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  createdAt: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  userText: {
    fontSize: 16,
    color: '#555',
  },
  ratingText: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '500',
  },
  commentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 5,
  },
  list: {
    paddingBottom: 20,
  },
});

export default ReviewManagementScreen;