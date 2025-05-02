// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './screens/LoginScreen';
import ProductScreen from './screens/ProductScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import AddProductScreen from './screens/AddProductScreen';
import CategoriesManagement from './screens/CategoriesManagement';

export type RootStackParamList = {
  Login: undefined;
  Product: undefined;
  ProductEdit: { product: any };
  AddProduct: undefined;
  CategoriesManagement: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App(): React.ReactElement {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        id={undefined}
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ 
            title: 'Đăng nhập Admin',
            headerShown: false 
          }}
        />
        <Stack.Screen 
          name="Product" 
          component={ProductScreen} 
          options={{
            title: 'Quản lý sản phẩm',
            headerLeft: () => null,
          }}
        />
        <Stack.Screen 
          name="ProductEdit" 
          component={ProductEditScreen} 
          options={{
            title: 'Chỉnh sửa sản phẩm',
          }}
        />
        <Stack.Screen 
          name="AddProduct" 
          component={AddProductScreen} 
          options={{
            title: 'Thêm sản phẩm',
          }}
        />
        <Stack.Screen 
          name="CategoriesManagement" 
          component={CategoriesManagement} 
          options={{
            title: 'Quản lý danh mục',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}