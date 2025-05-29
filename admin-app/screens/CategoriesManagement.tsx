import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { fetchCategories, addCategory, updateCategory, deleteCategory } from '../api';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../App';
import Icon from 'react-native-vector-icons/FontAwesome';

type CategoriesManagementNavigationProp = BottomTabNavigationProp<TabParamList, 'CategoriesManagement'>;

type Props = {
  navigation: CategoriesManagementNavigationProp;
};

type Category = {
  id: number;
  name: string;
};

const CategoriesManagement = ({ navigation }: Props) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');

  const loadCategories = async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else if (!isRefreshing) {
      setIsLoading(true);
    }

    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách danh mục');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Lỗi', 'Tên danh mục không được để trống');
      return;
    }

    try {
      await addCategory({ name: categoryName });
      Alert.alert('Thành công', 'Thêm danh mục thành công');
      setCategoryName('');
      setModalVisible(false);
      loadCategories();
    } catch (error: any) {
      Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại để thêm danh mục');
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory || !categoryName.trim()) {
      Alert.alert('Lỗi', 'Tên danh mục không được để trống');
      return;
    }

    try {
      await updateCategory(selectedCategory.id, { name: categoryName });
      Alert.alert('Thành công', 'Cập nhật danh mục thành công');
      setCategoryName('');
      setSelectedCategory(null);
      setModalVisible(false);
      loadCategories();
    } catch (error: any) {
      Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại để cập nhật danh mục');
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa danh mục "${name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(id);
              Alert.alert('Thành công', 'Đã xóa danh mục');
              loadCategories();
            } catch (error: any) {
              Alert.alert('Không xóa được', 'Hết thời gian đăng nhập hoặc danh mục đang chứa sản phẩm, không thể xóa');
            }
          },
        },
      ]
    );
  };

  const openAddModal = () => {
    setSelectedCategory(null);
    setCategoryName('');
    setModalVisible(true);
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setCategoryName(category.name);
    setModalVisible(true);
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <View style={styles.categoryContainer}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryName}>{item.name}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
          activeOpacity={0.7}
        >
          <Icon name="edit" size={20} color="#fff" />
          <Text style={styles.buttonText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteCategory(item.id, item.name)}
          activeOpacity={0.7}
        >
          <Icon name="trash" size={20} color="#fff" />
          <Text style={styles.buttonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="list" size={50} color="#999" />
      <Text style={styles.emptyText}>Không có danh mục nào</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quản lý Danh mục</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : categories.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshing={isRefreshing}
          onRefresh={() => loadCategories(true)}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
            </Text>
            <TextInput
              style={styles.input}
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="Tên danh mục"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={selectedCategory ? handleUpdateCategory : handleAddCategory}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#E3F2FD',
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
  categoryContainer: {
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
  categoryHeader: {
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    elevation: 2,
    marginRight: 10,
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
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: '#F44336',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
});

export default CategoriesManagement;