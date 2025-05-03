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

// Điều hướng
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Tabs: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<NavigationProp>();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login(username, password);
      navigation.navigate('Tabs');
    } catch (error) {
      alert('Đăng nhập thất bại. Vui lòng kiểm tra thông tin.');
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
      <Text style={styles.title}>Đăng Nhập</Text>

      {renderInput('person-outline', 'Tên đăng nhập', username, setUsername)}
      {renderInput('lock-closed-outline', 'Mật khẩu', password, setPassword, true)}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng Nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Chưa có tài khoản? Đăng ký ngay</Text>
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

export default LoginScreen;
