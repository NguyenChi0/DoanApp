import React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomeScreen from './screens/HomeScreen';
// Make sure the path matches the exact file name with correct casing
import ProductDetailScreen from './screens/ProductDetailScreen';
import CartScreen from './screens/CartScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import OrdersScreen from './screens/OrdersScreen';
import OrderDetailScreen from './screens/OrderDetailScreen';
import ReviewScreen from './screens/ReviewScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import AccountScreen from './screens/AccountScreen';
import ContactScreen from './screens/ContactScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Định nghĩa kiểu cho navigation - Thêm ReviewScreen vào RootStackParamList
type RootStackParamList = {
  Tabs: undefined;
  ProductDetailScreen: { productId: string };
  CheckoutScreen: undefined;
  OrderDetailScreen: { orderId: string };
  ReviewScreen: { productId: number }; // Thêm ReviewScreen với param productId
  Login: undefined;
  Register: undefined;
  Account: undefined;
  Contact: undefined;
};

// Thành phần con để hiển thị nút "Đăng Nhập" trong header
const LoginButton = () => {
  const { token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (token) return null; // Không hiển thị nút nếu đã đăng nhập

  return (
    <TouchableOpacity
      style={{ marginRight: 15 }}
      onPress={() => navigation.navigate('Login')}
    >
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
        Đăng Nhập
      </Text>
    </TouchableOpacity>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: '#4B0082',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#4B0082',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={size} 
              color={color} 
            />
          ),
          headerRight: () => <LoginButton />,
        }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{
          title: 'Giỏ hàng',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'cart' : 'cart-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen} 
        options={{
          title: 'Đơn hàng',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'receipt' : 'receipt-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Contact" 
        component={ContactScreen} 
        options={{
          title: 'Liên hệ',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'call' : 'call-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Account" 
        component={AccountScreen} 
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4B0082" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#4B0082' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="ProductDetailScreen" component={ProductDetailScreen} options={{ title: 'Chi tiết sản phẩm' }} />
      <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} options={{ title: 'Thanh toán' }} />
      <Stack.Screen name="OrderDetailScreen" component={OrderDetailScreen} options={{ title: 'Chi tiết đơn hàng' }} />
      <Stack.Screen name="ReviewScreen" component={ReviewScreen} options={{ title: 'Đánh giá sản phẩm' }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Đăng Nhập' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Đăng Ký' }} />
      <Stack.Screen name="Account" component={AccountScreen} options={{ title: 'Tài khoản' }} />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default App;