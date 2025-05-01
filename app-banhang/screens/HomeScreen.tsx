import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchProducts } from '../services/api';

type RootStackParamList = {
  HomeScreen: undefined;
  ProductDetailScreen: { productId: string };
  Login: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  category_name: string | null;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]); // Danh sách sản phẩm đã lọc
  const [searchQuery, setSearchQuery] = useState<string>(''); // Từ khóa tìm kiếm

  // Lấy danh sách sản phẩm khi component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
        setFilteredProducts(data); // Ban đầu hiển thị tất cả sản phẩm
      } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
      }
    };
    loadProducts();
  }, []);

  // Lọc sản phẩm khi searchQuery thay đổi
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products); // Nếu không có từ khóa, hiển thị tất cả
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  // Nhóm sản phẩm đã lọc theo category_name
  const groupedProducts = filteredProducts.reduce((acc: { [key: string]: Product[] }, product) => {
    const category = product.category_name || 'Chưa phân loại';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  // Hàm render mỗi sản phẩm
  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() =>
        navigation.navigate('ProductDetailScreen', { productId: item.id.toString() })
      }
    >
      {item.image && <Image source={{ uri: item.image }} style={styles.productImage} />}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  // Hàm render section cho danh mục
  const renderCategorySection = (category: string, items: Product[]) => (
    <View key={category} style={styles.categorySection}>
      <Text style={styles.categoryHeader}>{category}</Text>
      <FlatList
        data={items}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Ô nhập liệu tìm kiếm */}
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm sản phẩm..."
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
      />
      <ScrollView>
        {Object.entries(groupedProducts).map(([category, items]) =>
          renderCategorySection(category, items)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchInput: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  categorySection: { marginBottom: 20 },
  categoryHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingHorizontal: 15,
    color: '#333',
  },
  productItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 10,
    padding: 10,
    width: 160,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  productImage: { width: 100, height: 100, borderRadius: 10 },
  productInfo: { marginTop: 10, alignItems: 'center' },
  productName: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  productPrice: { fontSize: 14, color: '#4B0082', marginTop: 5 },
});

export default HomeScreen;