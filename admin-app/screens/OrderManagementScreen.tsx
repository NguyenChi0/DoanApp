import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { fetchOrders, getOrderStatusText, getOrderStatusOptions } from '../api';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';

type OrderManagementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OrderManagement'>;

type Props = {
  navigation: OrderManagementScreenNavigationProp;
};

type Order = {
  id: number;
  user_name: string;
  address: string;
  phone_number: string;
  total_price: number;
  status: number;
  created_at: string;
};

const OrderManagementScreen = ({ navigation }: Props) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<number>(-1); // -1 means all orders

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await fetchOrders();
      setOrders(data);
      filterOrders(data, statusFilter);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const filterOrders = (ordersData: Order[], status: number) => {
    if (status === -1) {
      // Show all orders
      setFilteredOrders(ordersData);
    } else {
      // Filter by selected status
      setFilteredOrders(ordersData.filter(order => order.status === status));
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const handleStatusFilterChange = (value: number) => {
    setStatusFilter(value);
    filterOrders(orders, value);
  };

  const getStatusStyle = (status: number) => {
    switch (status) {
      case 0:
        return styles.statusPending;
      case 1:
        return styles.statusShipping;
      case 2:
        return styles.statusDelivered;
      case 3:
        return styles.statusCancelled;
      default:
        return {};
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý đơn hàng</Text>
      
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Lọc theo trạng thái:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={statusFilter}
            style={styles.picker}
            onValueChange={handleStatusFilterChange}
          >
            {getOrderStatusOptions().map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
          </Picker>
        </View>
      </View>
      
      {isLoading && !refreshing ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.orderItem}
              onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
                <Text style={[styles.orderStatus, getStatusStyle(item.status)]}>
                  {getOrderStatusText(item.status)}
                </Text>
              </View>
              <View style={styles.orderInfo}>
                <Text style={styles.customerName}>{item.user_name}</Text>
                <Text style={styles.orderDetail}>Địa chỉ: {item.address}</Text>
                <Text style={styles.orderDetail}>SĐT: {item.phone_number || 'Không có'}</Text>
                <Text style={styles.orderPrice}>
                  Tổng tiền: {item.total_price.toLocaleString('vi-VN')}₫
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filterContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 16,
    marginRight: 10,
    flex: 0.4,
  },
  pickerContainer: {
    flex: 0.6,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  picker: {
    height: 40,
  },
  orderItem: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 5,
    borderLeftColor: '#2196F3',
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  orderInfo: {
    marginTop: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  orderDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  orderPrice: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 4,
  },
  loader: {
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 40,
  },
  statusPending: {
    color: '#FF9800',
  },
  statusShipping: {
    color: '#2196F3',
  },
  statusDelivered: {
    color: '#4CAF50',
  },
  statusCancelled: {
    color: '#F44336',
  },
});

export default OrderManagementScreen;