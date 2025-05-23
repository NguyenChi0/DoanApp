import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useIsFocused } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { addProduct, fetchCategories, isAuthenticated } from '../api'; // No need for getToken here
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

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
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    const loadData = async () => {
      if (!(await isAuthenticated())) {
        navigation.navigate('Login');
        return;
      }
      try {
        const categoryData = await fetchCategories();
        setCategories(categoryData);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải danh mục');
      } finally {
        setInitialLoading(false);
      }
    };
    if (isFocused) loadData();
  }, [isFocused, navigation]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh để chọn hình ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      Alert.alert('Thành công', 'Ảnh đã được chọn');
    }
  };

  const handleAdd = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Lỗi', 'Tên và giá sản phẩm là bắt buộc');
      return;
    }

    if (!(await isAuthenticated())) {
      Alert.alert(
        'Phiên đăng nhập hết hạn',
        'Vui lòng đăng nhập lại để tiếp tục',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
      return;
    }

    const newProduct = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      category_id: categoryId ? categoryId : undefined,
      image: image || undefined,
    };

    setIsLoading(true);
    try {
      await addProduct(newProduct);
      Alert.alert('Thành công', 'Thêm sản phẩm thành công');
      navigation.goBack();
    } catch (error: any) {
      if (error.message.includes('token') || error.message.includes('đăng nhập')) {
        Alert.alert(
          'Phiên đăng nhập hết hạn',
          'Vui lòng đăng nhập lại để tiếp tục',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Lỗi', error.message || 'Không thể thêm sản phẩm');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thêm sản phẩm mới</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Text style={styles.imagePickerText}>
          {image ? 'Thay đổi ảnh' : 'Chọn ảnh sản phẩm'}
        </Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.previewImage} />}
      <Text style={styles.mota}>Tên sản phẩm</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Tên sản phẩm"
      />
      <Text style={styles.mota}>Mô tả sản phẩm</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Mô tả"
        multiline
      />
      <Text style={styles.mota}>Giá</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Giá"
        keyboardType="numeric"
      />
      <Text style={styles.mota}>Số lượng</Text>
      <TextInput
        style={styles.input}
        value={stock}
        onChangeText={setStock}
        placeholder="Số lượng tồn kho"
        keyboardType="numeric"
      />
      <Text style={styles.mota}>Danh mục</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={categoryId}
          onValueChange={(itemValue) => setCategoryId(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Chọn danh mục" value="" />
          {categories.map((cat) => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.id.toString()} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAdd} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.addButtonText}>Thêm sản phẩm</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor:'#E3F2FD' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign:'center'},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
  },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginBottom: 12 },              
  picker: { height: 50 },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold'},
  imagePicker: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePickerText: { color: '#333', fontSize: 16 },
  previewImage: { width: 200, height: 200, alignSelf: 'center', marginBottom: 10 },
  mota: {color:'#2162d4', fontSize:18,margin:5,fontWeight:'bold'}
});

export default AddProductScreen;