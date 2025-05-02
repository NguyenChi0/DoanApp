import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

type RootStackParamList = {
  AdminDashboard: undefined;
  CategoryManagement: undefined;
  ProductManagement: undefined;
  Login: undefined;
  Tabs: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AdminDashboard: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { logout, userRole, user } = useAuth();
  
  // Check if user has admin privileges
  useEffect(() => {
    if (userRole !== 'admin') {
      Alert.alert(
        'Truy cập bị từ chối', 
        'Bạn không có quyền truy cập vào trang quản trị.',
        [{ text: 'OK', onPress: () => navigation.navigate('Tabs') }]
      );
    }
  }, [userRole, navigation]);

  const handleLogout = () => {
    logout();
    navigation.navigate('Login');
  };

  if (userRole !== 'admin') {
    return null; // Don't render anything if not admin
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Xin chào, {user?.full_name || user?.username}</Text>
      <Text style={styles.title}>Bảng điều khiển Admin</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Quản lý Danh mục" 
          color="#4B0082"
          onPress={() => navigation.navigate('CategoryManagement')} 
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Quản lý Sản phẩm" 
          color="#4B0082"
          onPress={() => navigation.navigate('ProductManagement')} 
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Về trang chính" 
          onPress={() => navigation.navigate('Tabs')}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Đăng xuất" 
          color="#FF6347"
          onPress={handleLogout}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  welcome: {
    fontSize: 18,
    marginBottom: 10,
    color: '#555'
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 40,
    color: '#4B0082'
  },
  buttonContainer: {
    width: '80%',
    marginVertical: 10
  }
});

export default AdminDashboard;