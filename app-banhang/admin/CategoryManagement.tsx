import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CategoryManagement: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý Danh mục</Text>
      <Text>Đây là màn hình quản lý danh mục sản phẩm.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20 
  },
});

export default CategoryManagement;