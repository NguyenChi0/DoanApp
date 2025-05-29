import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  Switch,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { fetchVouchers, addVoucher, updateVoucher, deleteVoucher } from '../api';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Voucher {
  id: number;
  code: string;
  discount: number;
  is_active: number;
  expires_at?: string;
}

const VoucherManagementScreen: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState<Voucher | null>(null);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Hàm random mã voucher
  const generateRandomVoucherCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = 6;
    let code = '';
    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
    return code;
  };

  const fetchData = async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else if (!isRefreshing) {
      setIsLoading(true);
    }

    try {
      const data = await fetchVouchers();
      setVouchers(data);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách voucher');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddVoucher = async () => {
    if (!code || !discount) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mã và giá trị giảm giá');
      return;
    }
    if (code.length !== 6) {
      Alert.alert('Lỗi', 'Mã voucher phải có đúng 6 ký tự');
      return;
    }
    const discountValue = parseFloat(discount);
    if (isNaN(discountValue) || discountValue <= 0) {
      Alert.alert('Lỗi', 'Giá trị giảm giá phải là số lớn hơn 0');
      return;
    }

    try {
      await addVoucher({
        code: code.toUpperCase(),
        discount: discountValue,
        expires_at: expiresAt || undefined,
      });
      Alert.alert('Thành công', 'Thêm voucher thành công');
      setModalVisible(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể thêm voucher');
    }
  };

  const handleUpdateVoucher = async () => {
    if (!currentVoucher || !code || !discount) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mã và giá trị giảm giá');
      return;
    }
    if (code.length !== 6) {
      Alert.alert('Lỗi', 'Mã voucher phải có đúng 6 ký tự');
      return;
    }
    const discountValue = parseFloat(discount);
    if (isNaN(discountValue) || discountValue <= 0) {
      Alert.alert('Lỗi', 'Giá trị giảm giá phải là số lớn hơn 0');
      return;
    }

    try {
      await updateVoucher(currentVoucher.id, {
        code: code.toUpperCase(),
        discount: discountValue,
        is_active: isActive ? 1 : 0,
        expires_at: expiresAt || undefined,
      });
      Alert.alert('Thành công', 'Cập nhật voucher thành công');
      setModalVisible(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật voucher');
    }
  };

  const handleDeleteVoucher = (id: number, code: string) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa voucher "${code}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVoucher(id);
              Alert.alert('Thành công', 'Đã xóa voucher');
              fetchData();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa voucher');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (voucher: Voucher) => {
    setEditMode(true);
    setCurrentVoucher(voucher);
    setCode(voucher.code);
    setDiscount(voucher.discount.toString());
    setIsActive(voucher.is_active === 1);
    if (voucher.expires_at) {
      const parsedDate = new Date(voucher.expires_at);
      setDate(parsedDate);
      setExpiresAt(parsedDate.toISOString().split('T')[0]);
    } else {
      setDate(new Date());
      setExpiresAt('');
    }
    setModalVisible(true);
  };

  const openAddModal = () => {
    setEditMode(false);
    setCurrentVoucher(null);
    resetForm();
    setCode(generateRandomVoucherCode());
    setDate(new Date());
    setExpiresAt('');
    setModalVisible(true);
  };

  const resetForm = () => {
    setCode('');
    setDiscount('');
    setIsActive(true);
    setExpiresAt('');
    setDate(new Date());
    setCurrentVoucher(null);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false); // Hide picker on Android after selection
    }
    if (selectedDate) {
      setDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setExpiresAt(formattedDate);
    }
  };

  const renderVoucher = ({ item }: { item: Voucher }) => (
    <View style={styles.voucherContainer}>
      <View style={styles.voucherHeader}>
        <Text style={styles.voucherCode}>Mã: {item.code}</Text>
        <View style={[styles.statusBadge, item.is_active ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={styles.statusText}>
            {item.is_active ? 'Kích hoạt' : 'Vô hiệu'}
          </Text>
        </View>
      </View>
      <View style={styles.voucherInfo}>
        <Text style={styles.voucherDiscount}>
          Giảm giá: ${typeof item.discount === 'number' ? item.discount.toFixed(2) : 'N/A'}
        </Text>
        <Text style={styles.voucherExpires}>
          Hết hạn: {item.expires_at ? new Date(item.expires_at).toLocaleDateString() : 'Không có'}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
          activeOpacity={0.7}
        >
          <Icon name="edit" size={20} color="#fff" />
          <Text style={styles.buttonText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteVoucher(item.id, item.code)}
          activeOpacity={0.7}
        >
          <Icon name="trash" size={20} color="#fff" />
          <Text style={styles.buttonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="ticket" size={50} color="#999" />
      <Text style={styles.emptyText}>Không có voucher nào</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quản lý Voucher</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : vouchers.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={vouchers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderVoucher}
          contentContainerStyle={styles.list}
          refreshing={isRefreshing}
          onRefresh={() => fetchData(true)}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editMode ? 'Sửa Voucher' : 'Thêm Voucher'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Mã voucher (6 ký tự)"
              value={code}
              onChangeText={setCode}
              maxLength={6}
              autoCapitalize="characters"
            />

            <TextInput
              style={styles.input}
              placeholder="Giá trị giảm giá ($)"
              value={discount}
              onChangeText={setDiscount}
              keyboardType="numeric"
            />

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Kích hoạt:</Text>
              <Switch value={isActive} onValueChange={setIsActive} />
            </View>

            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                {expiresAt ? `Ngày hết hạn: ${expiresAt}` : 'Chọn ngày hết hạn'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={handleDateChange}
                locale="vi-VN"
              />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setShowDatePicker(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={editMode ? handleUpdateVoucher : handleAddVoucher}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  list: {
    paddingBottom: 20,
  },
  voucherContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  voucherCode: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
  },
  inactiveBadge: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  voucherInfo: {
    marginBottom: 10,
  },
  voucherDiscount: {
    fontSize: 16,
    color: '#16a34a',
    fontWeight: '500',
    marginBottom: 4,
  },
  voucherExpires: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    elevation: 2,
    marginRight: 10,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  datePickerButton: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: '#F44336',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
});

export default VoucherManagementScreen;