import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { fetchMonthlyRevenue } from '../api';
import Icon from 'react-native-vector-icons/FontAwesome';

type RevenueReportScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RevenueReport'>;

type Props = {
  navigation: RevenueReportScreenNavigationProp;
};

type RevenueData = {
  monthYear: string;
  total: number;
};

const RevenueReportScreen = ({ navigation }: Props) => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRevenueData = async () => {
      try {
        const data = await fetchMonthlyRevenue();
        const formattedData: RevenueData[] = data.map((item: { year: number; month: number; revenue: number }) => ({
          monthYear: `${item.month}/${item.year}`,
          total: item.revenue,
        })).sort((a, b) => {
          const [aMonth, aYear] = a.monthYear.split('/').map(Number);
          const [bMonth, bYear] = b.monthYear.split('/').map(Number);
          return bYear - aYear || bMonth - aMonth;
        });
        setRevenueData(formattedData);
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải dữ liệu doanh thu');
        console.error('Error fetching revenue data:', err);
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
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Icon name="warning" size={50} color="#999" />
        <Text style={styles.noData}>Lỗi: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>BÁO CÁO DOANH THU THEO THÁNG</Text>
      {revenueData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="bar-chart" size={50} color="#999" />
          <Text style={styles.noData}>Không có dữ liệu doanh thu</Text>
        </View>
      ) : (
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.monthColumn]}>Tháng</Text>
            <Text style={[styles.headerText, styles.totalColumn]}>Doanh thu (VND)</Text>
          </View>
          {revenueData.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.cellText, styles.monthColumn]}>{item.monthYear}</Text>
              <Text style={[styles.cellText, styles.totalColumn, styles.total]}>{item.total.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
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
  noData: {
    fontSize: 18,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  table: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    padding: 15,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cellText: {
    fontSize: 16,
    color: '#333',
  },
  monthColumn: {
    flex: 1,
  },
  totalColumn: {
    flex: 2,
    textAlign: 'right',
  },
  total: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
});

export default RevenueReportScreen;