import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { updateUser } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  address: string | null;
}

const AccountScreen: React.FC = () => {
  const { token, user, setUser, logout } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setAddress(user.address || '');
    }
  }, [user]);

  const handleUpdate = async () => {
    if (!token || !user) return;

    // Validate email format
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    // Check if there are any changes
    const updateData: any = {};
    if (fullName) updateData.full_name = fullName;
    if (email) updateData.email = email;
    if (address) updateData.address = address;
    if (password) updateData.password = password;

    if (Object.keys(updateData).length === 0) {
      Alert.alert('Thông báo', 'Không có thay đổi để cập nhật');
      return;
    }

    setLoading(true);
    try {
      await updateUser(user.id, updateData, token);
      // Update user context with new data
      setUser({ ...user, full_name: fullName, email, address });
      Alert.alert('Thành công', 'Thông tin tài khoản đã được cập nhật');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setPassword('');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!token) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Vui lòng đăng nhập để chỉnh sửa thông tin</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chỉnh sửa thông tin tài khoản</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="Họ và tên"
      />
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Địa chỉ"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Mật khẩu mới (để trống nếu không đổi)"
        secureTextEntry
      />
      <Button
        title={loading ? "Đang cập nhật..." : "Cập nhật"}
        onPress={handleUpdate}
        disabled={loading}
      />
      <View style={styles.logoutContainer}>
        <Button title="Đăng Xuất" onPress={handleLogout} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  logoutContainer: {
    marginTop: 20,
  },
});

export default AccountScreen;