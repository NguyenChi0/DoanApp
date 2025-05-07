import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { fetchOrders } from '../api';

type RevenueReportScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RevenueReport'>;

type Props = {
  navigation: RevenueReportScreenNavigationProp;
};

type RevenueData = {
  date: string;
  total: number;
};

const RevenueReportScreen = ({ navigation }: Props) => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRevenueData = async () => {
      try {
        const orders = await fetchOrders();
        const dailyRevenue: { [key: string]: number } = orders.reduce((acc: { [key: string]: number }, order: { created_at: string; total_price: number }) => {
          const date = order.created_at.split('T')[0];
          acc[date] = (acc[date] || 0) + order.total_price;
          return acc;
        }, {});
        const formattedData: RevenueData[] = Object.entries(dailyRevenue).map(([date, total]) => ({
          date,
          total,
        }));
        setRevenueData(formattedData);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRevenueData();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Báo cáo Doanh thu</Text>
      {revenueData.length === 0 ? (
        <Text style={styles.noData}>Không có dữ liệu doanh thu</Text>
      ) : (
        revenueData.map((item, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.total}>{item.total} VND</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  noData: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  date: {
    fontSize: 16,
    color: '#333',
  },
  total: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
  },
});

export default RevenueReportScreen;