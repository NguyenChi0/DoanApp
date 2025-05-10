import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '../App';
import { fetchProducts, deleteProduct, logout, fetchCategories } from '../api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';

type ProductScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Product'>,
  StackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: ProductScreenNavigationProp;
};

type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  category_id: number;
};

type Category = {
  id: number;
  name: string;
};

const ProductScreen = ({ navigation }: Props) => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<number>(0);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  React.useEffect(() => {
    navigation.setOptions({
      title: 'Quản lý sản phẩm',
    });
  }, [navigation]);

  const loadData = async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else if (!isRefreshing) {
      setIsLoading(true);
    }

    try {
      const [productsData, categoriesData] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
      ]);
      setProducts(productsData);
      setCategories([{ id: 0, name: 'Tất cả' }, ...categoriesData]);
      filterProducts(productsData, searchQuery, selectedCategory);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterProducts = (products: Product[], query: string, categoryId: number) => {
    let filtered = products;

    if (query.trim() !== '') {
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (categoryId !== 0) {
      filtered = filtered.filter(item => item.category_id === categoryId);
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterProducts(products, text, selectedCategory);
  };

  const clearSearch = () => {
    setSearchQuery('');
    filterProducts(products, '', selectedCategory);
  };

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId);
    filterProducts(products, searchQuery, categoryId);
  };

  const handleDelete = async (id: number, name: string) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(id);
              Alert.alert('Thành công', 'Đã xóa sản phẩm');
              loadData();
            } catch (error: any) {
              Alert.alert('Lỗi xóa', error.message || 'Không thể xóa sản phẩm');
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          onPress: async () => {
            await logout();
            navigation.navigate('Login');
          },
        },
      ]
    );
  };

  React.useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách sản phẩm ({filteredProducts.length})</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => handleCategorySelect(itemValue)}
          style={styles.picker}
        >
          {categories.map(category => (
            <Picker.Item
              key={category.id}
              label={category.name}
              value={category.id}
            />
          ))}
        </Picker>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.productInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>{item.price.toLocaleString('vi-VN')}₫</Text>
              <Text style={styles.description} numberOfLines={2}>
                {item.description || 'Không có mô tả'}
              </Text>
              <Text style={styles.stock}>Còn lại: {item.stock} sản phẩm</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.iconButton, styles.editButton]}
                onPress={() => navigation.navigate('ProductEdit', { product: item })}
              >
                <Icon name="edit" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, styles.deleteButton]}
                onPress={() => handleDelete(item.id, item.name)}
              >
                <Icon name="delete" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        refreshing={isRefreshing}
        onRefresh={() => loadData(true)}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery.length > 0 || selectedCategory !== 0
                ? 'Không tìm thấy sản phẩm phù hợp'
                : 'Không có sản phẩm nào'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutFab} onPress={handleLogout}>
        <Icon name="logout" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    width: '100%',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    width: '100%',
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  item: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e53935',
    marginBottom: 8,
  },
  description: {
    color: '#666',
    marginBottom: 8,
  },
  stock: {
    color: '#666',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    backgroundColor: '#4CAF50',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutFab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#f44336',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default ProductScreen;