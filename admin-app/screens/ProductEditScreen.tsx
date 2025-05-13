import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { getToken, updateProduct, fetchCategories } from '../api';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';

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
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description || '');
  const [price, setPrice] = useState(product.price.toString());
  const [stock, setStock] = useState(product.stock.toString());
  const [categoryId, setCategoryId] = useState(product.category_id?.toString() || '');
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState<string | null>(product.image || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryData = await fetchCategories();
        setCategories(categoryData);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải danh mục');
      }
    };
    loadCategories();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Lỗi', 'Tên và giá sản phẩm là bắt buộc');
      return;
    }

    setIsLoading(true);
    try {
      await updateProduct(product.id, { name, description, price: parseFloat(price), stock: parseInt(stock), category_id: categoryId ? parseInt(categoryId) : undefined, image });
      Alert.alert('Thành công', 'Cập nhật sản phẩm thành công');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Chỉnh sửa sản phẩm</Text>

      {image && <Image source={{ uri: image }} style={styles.previewImage} />}

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Text style={styles.imagePickerText}>Chọn ảnh mới cho sản phẩm</Text>
      </TouchableOpacity>

      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Tên sản phẩm" />

      <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Mô tả" multiline />

      <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="Giá" keyboardType="numeric" />

      <TextInput style={styles.input} value={stock} onChangeText={setStock} placeholder="Số lượng tồn kho" keyboardType="numeric" />

      <View style={styles.pickerContainer}>
        <Picker selectedValue={categoryId} onValueChange={(itemValue) => setCategoryId(itemValue)} style={styles.input}>
          <Picker.Item label="Chọn danh mục" value="" />
          {categories.map((cat: any) => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.id.toString()} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 12, borderRadius: 4 },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginBottom: 12 },
  saveButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 4, alignItems: 'center',marginBottom:30 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  imagePicker: { backgroundColor: '#ddd', padding: 10, borderRadius: 5, alignItems: 'center', marginBottom: 10 },
  imagePickerText: { color: '#333', fontSize: 16 },
  previewImage: { width: 200, height: 200, alignSelf: 'center', marginBottom: 10 }
});

export default ProductEditScreen;