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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const groupedProducts = filteredProducts.reduce((acc: { [key: string]: Product[] }, product) => {
    const category = product.category_name || 'Chưa phân loại';
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {});

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

  const renderCategorySection = (category: string, items: Product[]) => (
    <View key={category} style={styles.categorySection}>
      <Text style={styles.categoryHeader}>{category}</Text>
      <FlatList
        data={items}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Tìm kiếm sản phẩm..."
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
  container: { flex: 1, backgroundColor: '#F0F8FF' },
  searchInput: {
    height: 45,
    backgroundColor: '#E6E6FA',
    borderRadius: 25,
    paddingHorizontal: 15,
    margin: 15,
    elevation: 4,
    fontSize: 16,
    color: '#4B0082',
  },
  categorySection: { marginBottom: 25 },
  categoryHeader: { fontSize: 24, fontWeight: 'bold', margin: 15, color: '#4B0082' },
  productItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginHorizontal: 10,
    padding: 12,
    width: 170,
    alignItems: 'center',
    elevation: 5,
    borderColor: '#ff00ff',
    borderWidth: 2,
  },
  productImage: { width: 150, height: 120, borderRadius: 15 },
  productInfo: { marginTop: 10, alignItems: 'center' },
  productName: { fontSize: 16, fontWeight: '600', textAlign: 'center', color: '#333' },
  productPrice: { fontSize: 16, color: '#FF4500', marginTop: 5, fontWeight: 'bold' },
});

export default HomeScreen;
