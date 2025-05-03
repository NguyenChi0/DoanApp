import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RegisterScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const navigation = useNavigation<NavigationProp>();
  const { register } = useAuth();

  const handleRegister = async () => {
    try {
      await register({ username, password, email, full_name: fullName, address });
      alert('Đăng ký thành công. Vui lòng đăng nhập.');
      navigation.navigate('Login');
    } catch (error) {
      alert('Đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  const renderInput = (
    icon: string,
    placeholder: string,
    value: string,
    setValue: (text: string) => void,
    secure?: boolean
  ) => (
    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={22} color="#007ACC" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#888"
        value={value}
        onChangeText={setValue}
        secureTextEntry={secure}
      />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tạo Tài Khoản</Text>

      {renderInput('person-outline', 'Tên đăng nhập', username, setUsername)}
      {renderInput('lock-closed-outline', 'Mật khẩu', password, setPassword, true)}
      {renderInput('mail-outline', 'Email', email, setEmail)}
      {renderInput('person-circle-outline', 'Họ và Tên', fullName, setFullName)}
      {renderInput('location-outline', 'Địa chỉ', address, setAddress)}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Đăng Ký</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Quay lại Đăng Nhập</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#F0F8FF',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#005B9F',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CCE6F6',
    marginBottom: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007ACC',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  link: {
    color: '#007ACC',
    fontSize: 15,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;
