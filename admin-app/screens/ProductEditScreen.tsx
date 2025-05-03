// screens/ProductEditScreen.tsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { getToken } from '../api';

type ProductEditScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProductEdit'>;
type ProductEditScreenRouteProp = RouteProp<RootStackParamList, 'ProductEdit'>;

type Props = {
  navigation: ProductEditScreenNavigationProp;
  route: ProductEditScreenRouteProp;
};

type Product = {
  id: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  stock: number;
  category_id?: number;
};

const ProductEditScreen = ({ navigation, route }: Props) => {
  const { product } = route.params;
  const [name, setName] = React.useState(product.name);
  const [description, setDescription] = React.useState(product.description || '');
  const [price, setPrice] = React.useState(product.price.toString());
  const [stock, setStock] = React.useState(product.stock.toString());
  const [categoryId, setCategoryId] = React.useState(product.category_id?.toString() || '');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSave = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Lỗi', 'Tên và giá sản phẩm là bắt buộc');
      return;
    }

    const updatedProduct = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      category_id: categoryId ? parseInt(categoryId) : undefined,
    };

    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`http://192.168.1.7:3000/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProduct),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Không thể cập nhật sản phẩm');
      }

      Alert.alert('Thành công', 'Cập nhật sản phẩm thành công');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Chỉnh sửa sản phẩm</Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Tên sản phẩm"
      />

      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Mô tả"
        multiline
      />

      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Giá"
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        value={stock}
        onChangeText={setStock}
        placeholder="Số lượng tồn kho"
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        value={categoryId}
        onChangeText={setCategoryId}
        placeholder="ID danh mục (nếu có)"
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductEditScreen;