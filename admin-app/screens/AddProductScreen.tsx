// screens/AddProductScreen.tsx
import React, { useState, useEffect } from 'react';
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
import { RootStackParamList } from '../App';
import { addProduct, fetchCategories, getToken } from '../api';
import { Picker } from '@react-native-picker/picker';

type AddProductScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddProduct'>;

type Props = {
  navigation: AddProductScreenNavigationProp;
};

type Category = {
  id: number;
  name: string;
};

const AddProductScreen = ({ navigation }: Props) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error: any) {
        Alert.alert('Lỗi', 'Không thể tải danh mục');
      }
    };
    loadCategories();
  }, []);

  const handleAdd = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Lỗi', 'Tên và giá sản phẩm là bắt buộc');
      return;
    }

    const newProduct = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      category_id: categoryId ? parseInt(categoryId) : null,
    };

    setIsLoading(true);
    try {
      await addProduct(newProduct);
      Alert.alert('Thành công', 'Thêm sản phẩm thành công');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể thêm sản phẩm');
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
      <Text style={styles.title}>Thêm sản phẩm mới</Text>

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

<Picker
  selectedValue={categoryId}
  onValueChange={(itemValue) => setCategoryId(itemValue)}
  style={styles.input}
>
  <Picker.Item label="Không chọn danh mục" value="" />
  {categories.map((cat) => (
    <Picker.Item key={cat.id} label={cat.name} value={cat.id.toString()} />
  ))}
</Picker>

      <Text style={styles.categoryListTitle}>Danh sách danh mục:</Text>
      {categories.map((cat) => (
        <Text key={cat.id} style={styles.categoryItem}>
          ID: {cat.id} - {cat.name}
        </Text>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.addButtonText}>Thêm sản phẩm</Text>
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
  categoryListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  categoryItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddProductScreen;