import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';

import LoginScreen from './screens/LoginScreen';
import ProductScreen from './screens/ProductScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import AddProductScreen from './screens/AddProductScreen';
import CategoriesManagement from './screens/CategoriesManagement';
import OrderManagementScreen from './screens/OrderManagementScreen';
import OrderDetailScreen from './screens/OrderDetailScreen';
import RevenueReportScreen from './screens/RevenueReportScreen';
import UserManagementScreen from './screens/UserManagementScreen';

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  ProductEdit: { product: any };
  AddProduct: undefined;
  OrderDetail: { orderId: number };
  OrderManagement: undefined;
  RevenueReport: undefined;
  UserManagement: undefined;
};

export type TabParamList = {
  Product: undefined;
  CategoriesManagement: undefined;
  OrderManagement: undefined;
  RevenueReport: undefined;
  UserManagement: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: { backgroundColor: '#fff' },
      }}
    >
      <Tab.Screen 
        name="Product" 
        component={ProductScreen} 
        options={{ 
          title: 'Sản phẩm', 
          tabBarIcon: ({ color, size }) => <Icon name="shopping-bag" color={color} size={size} />,
          headerShown: false,
        }} 
      />
      <Tab.Screen 
        name="CategoriesManagement" 
        component={CategoriesManagement} 
        options={{ 
          title: 'Danh mục', 
          tabBarIcon: ({ color, size }) => <Icon name="th-list" color={color} size={size} />,
          headerShown: false,
        }} 
      />
      <Tab.Screen 
        name="OrderManagement" 
        component={OrderManagementScreen} 
        options={{ 
          title: 'Đơn hàng', 
          tabBarIcon: ({ color, size }) => <Icon name="list-alt" color={color} size={size} />,
          headerShown: false,
        }} 
      />
      <Tab.Screen 
        name="RevenueReport" 
        component={RevenueReportScreen} 
        options={{ 
          title: 'Báo cáo', 
          tabBarIcon: ({ color, size }) => <Icon name="bar-chart" color={color} size={size} />,
          headerShown: false,
        }} 
      />
      <Tab.Screen 
        name="UserManagement" 
        component={UserManagementScreen} 
        options={{ 
          title: 'Quản lý user', 
          tabBarIcon: ({ color, size }) => <Icon name="users" color={color} size={size} />,
          headerShown: false,
        }} 
      />
    </Tab.Navigator>
  );
}

export default function App(): React.ReactElement {
  return (
    <NavigationContainer>
      <Stack.Navigator 
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
          name="MainTabs" 
          component={MainTabs} 
          options={{ headerShown: false }}
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
          name="OrderDetail" 
          component={OrderDetailScreen} 
          options={{
            title: 'Chi tiết đơn hàng',
          }}
        />
        <Stack.Screen 
          name="RevenueReport" 
          component={RevenueReportScreen} 
          options={{
            title: 'Báo cáo Doanh thu',
          }}
        />
        <Stack.Screen 
          name="UserManagement" 
          component={UserManagementScreen} 
          options={{
            title: 'Quản lý user',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}