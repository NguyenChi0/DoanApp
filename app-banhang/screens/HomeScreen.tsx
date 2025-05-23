import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchProducts } from '../services/api';

const { width } = Dimensions.get('window');

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
  const [currentBannerIndex, setCurrentBannerIndex] = useState<number>(0);
  const scrollViewRef = useRef<ScrollView>(null); // Ref for ScrollView

  // Array of banner images
  const bannerImages = [
    require('../images/image1.png'),
    require('../images/image2.png'),
    require('../images/image3.png'),
  ];

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

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % bannerImages.length; // Loop back to 0
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            x: nextIndex * width,
            animated: true,
          });
        }
        return nextIndex;
      });
    }, 3000); // Change every 3 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [bannerImages.length]);

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
      <View style={styles.imageContainer}>
        {item.image && <Image source={{ uri: item.image }} style={styles.productImage} />}
        <View style={styles.bannerContainer}>
          <Text style={styles.bannerText}>Khuyến mãi lớn</Text>
        </View>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2} ellipsizeMode="tail">
          {item.name}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>${item.price}</Text>
          <Text style={styles.originalPrice}>${(item.price * 1.2).toFixed(2)}</Text>
        </View>
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

  // Handle scroll event to update the current banner index
  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentBannerIndex(index);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Tìm kiếm sản phẩm..."
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
      />
      <ScrollView>
        {/* Banner Carousel */}
        <View style={styles.mainBannerContainer}>
          <ScrollView
            ref={scrollViewRef} // Attach ref to ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {bannerImages.map((image, index) => (
              <Image
                key={index}
                source={image}
                style={styles.mainBannerImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          {/* Dot Indicators */}
          <View style={styles.dotContainer}>
            {bannerImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentBannerIndex === index ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        </View>

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
  mainBannerContainer: {
    width: width,
    height: 180,
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  mainBannerImage: {
    width: width,
    height: '100%',
  },
  dotContainer: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FF4500',
  },
  inactiveDot: {
    backgroundColor: '#FFFFFF',
    opacity: 0.5,
  },
  categorySection: { marginBottom: 25 },
  categoryHeader: { fontSize: 24, fontWeight: 'bold', margin: 15, color: '#4B0082' },
  productItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginHorizontal: 10,
    padding: 15,
    width: 200,
    alignItems: 'center',
    elevation: 5,
    borderColor: '#ff00ff',
    borderWidth: 2,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: 170,
    height: 140,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  bannerContainer: {
    position: 'absolute',
    top: 10,
    left: -45,
    backgroundColor: '#FF4500',
    paddingVertical: 5,
    paddingHorizontal: 30,
    transform: [{ rotate: '-45deg' }],
    elevation: 5,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  productInfo: { marginTop: 12, alignItems: 'center', width: '100%' },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
    width: '100%',
    paddingHorizontal: 5,
  },
  priceContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'center',
  },
  productPrice: {
    fontSize: 18,
    color: '#FF4500',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 14,
    color: '#888',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
});

export default HomeScreen;