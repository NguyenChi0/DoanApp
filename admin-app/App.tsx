import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './screens/LoginScreen';
import ProductScreen from './screens/ProductScreen';
import ProductEditScreen from './screens/ProductEditScreen';

export type RootStackParamList = {
  Login: undefined;
  Product: undefined;
  ProductEdit: { product: any };
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
            headerLeft: () => null, // Disable back button
          }}
        />
        <Stack.Screen 
          name="ProductEdit" 
          component={ProductEditScreen} 
          options={{
            title: 'Chỉnh sửa sản phẩm',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}