import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { fetchOrders, getOrderStatusText, getOrderStatusOptions } from '../api';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
      setFilteredOrders(ordersData);
    } else {
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

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 0:
        return 'hourglass-empty';
      case 1:
        return 'local-shipping';
      case 2:
        return 'check-circle';
      case 3:
        return 'cancel';
      default:
        return 'info';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="shopping-cart" size={50} color="#999" />
      <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quản lý Đơn hàng</Text>
      
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2196F3']}
              tintColor="#2196F3"
            />
          }
          ListEmptyComponent={renderEmptyState}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.orderItem}
              onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
              activeOpacity={0.7}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
                <View style={[styles.orderStatus, getStatusStyle(item.status)]}>
                  <Icon
                    name={getStatusIcon(item.status)}
                    size={16}
                    color="#fff"
                    style={styles.statusIcon}
                  />
                  <Text style={styles.orderStatusText}>
                    {getOrderStatusText(item.status)}
                  </Text>
                </View>
              </View>
              <View style={styles.orderInfo}>
                <Text style={styles.customerName}>{item.user_name}</Text>
                <Text style={styles.orderDetail}>Địa chỉ: {item.address}</Text>
                <Text style={styles.orderDetail}>SĐT: {item.phone_number || 'Không có'}</Text>
                <Text style={styles.orderPrice}>
                  Tổng tiền: {item.total_price.toLocaleString('vi-VN')}₫
                </Text>
                <Text style={styles.orderDate}>
                  Ngày đặt: {formatDate(item.created_at)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#E3F2FD',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E88E5',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E88E5',
    flex: 0.4,
  },
  pickerContainer: {
    flex: 0.6,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  picker: {
    height: 40,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 24,
  },
  orderItem: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 6,
  },
  orderStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  orderInfo: {
    marginTop: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  orderDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  orderPrice: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2196F3',
    marginBottom: 6,
  },
  orderDate: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  list: {
    paddingBottom: 20,
  },
  statusPending: {
    backgroundColor: '#FF9800',
  },
  statusShipping: {
    backgroundColor: '#2196F3',
  },
  statusDelivered: {
    backgroundColor: '#4CAF50',
  },
  statusCancelled: {
    backgroundColor: '#F44336',
  },
});

export default OrderManagementScreen;