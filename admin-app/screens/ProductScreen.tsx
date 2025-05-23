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
  StyleProp,
  TextStyle,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '../App';
import { fetchProducts, hideProduct, logout, fetchCategories } from '../api';
import Icon from 'react-native-vector-icons/FontAwesome';
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
  status: number;
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
          item.description?.toLowerCase().includes(query.toLowerCase())
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

  const handleHide = async (id: number, name: string) => {
    Alert.alert(
      'Xác nhận XÓA?',
      `Bạn có chắc chắn muốn XÓA sản phẩm "${name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'XÓA',
          style: 'destructive',
          onPress: async () => {
            try {
              await hideProduct(id);
              Alert.alert('Thành công', 'Đã XÓA sản phẩm');
              loadData();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể XÓA sản phẩm');
            }
          },
        },
      ]
    );
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productContainer}>
      <View style={styles.productHeader}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.price}>{item.price.toLocaleString('vi-VN')}₫</Text>
      </View>
      <View style={styles.infoRow}>
        <Icon name="info-circle" size={18} color="#666" style={styles.icon} />
        <Text style={styles.description} numberOfLines={2}>
          {item.description || 'Không có mô tả'}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Icon name="cubes" size={18} color="#666" style={styles.icon} />
        <Text style={styles.stock}>Còn lại: {item.stock} sản phẩm</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('ProductEdit', { product: item })}
          activeOpacity={0.7}
        >
          <Icon name="edit" size={20} color="#fff" />
          <Text style={styles.buttonText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleHide(item.id, item.name)}
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
      <Icon name="shopping-cart" size={50} color="#999" />
      <Text style={styles.emptyText}>
        {searchQuery.length > 0 || selectedCategory !== 0
          ? 'Không tìm thấy sản phẩm phù hợp'
          : 'Không có sản phẩm nào'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.header}>
          Quản lý Sản phẩm
        </Text>
        <TouchableOpacity style={styles.headerLogoutButton} onPress={handleLogout}>
          <Icon name="sign-out" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearButtonText as StyleProp<TextStyle>}>✕</Text>
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : filteredProducts.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshing={isRefreshing}
          onRefresh={() => loadData(true)}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#E3F2FD',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E88E5',
    textAlign: 'center',
    textTransform: 'uppercase',
    flex: 1,
  },
  headerLogoutButton: {
    backgroundColor: '#F44336',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    borderRadius: 12,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  productContainer: {
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
  productHeader: {
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
  price: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFD700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  stock: {
    fontSize: 14,
    color: '#666',
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
});

export default ProductScreen;