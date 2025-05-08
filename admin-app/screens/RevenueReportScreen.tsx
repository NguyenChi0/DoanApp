import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { fetchMonthlyRevenue } from '../api';

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
        // Format data to match RevenueData structure
        const formattedData: RevenueData[] = data.map((item: { year: number; month: number; revenue: number }) => ({
          monthYear: `${item.month}/${item.year}`, // Format: MM/YYYY
          total: item.revenue,
        })).sort((a, b) => {
          const [aMonth, aYear] = a.monthYear.split('/').map(Number);
          const [bMonth, bYear] = b.monthYear.split('/').map(Number);
          return bYear - aYear || bMonth - aMonth; // Sort by year descending, then month descending
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
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.noData}>Lỗi: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Báo cáo Doanh thu Theo Tháng</Text>
      {revenueData.length === 0 ? (
        <Text style={styles.noData}>Không có dữ liệu doanh thu</Text>
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
  table: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
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