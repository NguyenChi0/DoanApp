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
} from 'react-native';
import { fetchVouchers, addVoucher, updateVoucher, deleteVoucher } from '../api';
import Icon from 'react-native-vector-icons/FontAwesome';

interface Voucher {
  id: number;
  code: string;
  discount: number;
  is_active: number;
  expires_at?: string;
}

const VoucherManagementScreen: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState<Voucher | null>(null);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');

  const fetchData = async () => {
    try {
      const data = await fetchVouchers();
      setVouchers(data);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách voucher');
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
      setCode('');
      setDiscount('');
      setExpiresAt('');
      setIsActive(true);
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
      setCode('');
      setDiscount('');
      setExpiresAt('');
      setIsActive(true);
      setCurrentVoucher(null);
      fetchData();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật voucher');
    }
  };

  const handleDeleteVoucher = (id: number) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa voucher này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVoucher(id);
              Alert.alert('Thành công', 'Xóa voucher thành công');
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
    setExpiresAt(voucher.expires_at || '');
    setModalVisible(true);
  };

  const openAddModal = () => {
    setEditMode(false);
    setCurrentVoucher(null);
    setCode('');
    setDiscount('');
    setIsActive(true);
    setExpiresAt('');
    setModalVisible(true);
  };

  const renderVoucher = ({ item }: { item: Voucher }) => (
  <View style={styles.voucherItem}>
    <View style={styles.voucherInfo}>
      <Text style={styles.voucherCode}>Mã: {item.code}</Text>
      <Text style={styles.voucherDiscount}>
        Giảm giá: ${typeof item.discount === 'number' ? item.discount.toFixed(2) : 'N/A'}
      </Text>
      <Text style={styles.voucherStatus}>
        Trạng thái: {item.is_active ? 'Kích hoạt' : 'Vô hiệu'}
      </Text>
      <Text style={styles.voucherExpires}>
        Hết hạn: {item.expires_at ? new Date(item.expires_at).toLocaleDateString() : 'Không có'}
      </Text>
    </View>
    <View style={styles.voucherActions}>
      <TouchableOpacity onPress={() => openEditModal(item)} style={styles.editButton}>
        <Icon name="edit" size={20} color="#2196F3" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDeleteVoucher(item.id)} style={styles.deleteButton}>
        <Icon name="trash" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  </View>
);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addButtonText}>Thêm Voucher</Text>
      </TouchableOpacity>
      <FlatList
        data={vouchers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderVoucher}
        contentContainerStyle={styles.list}
      />
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editMode ? 'Sửa Voucher' : 'Thêm Voucher'}</Text>
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
              <Text>Kích hoạt:</Text>
              <Switch value={isActive} onValueChange={setIsActive} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ngày hết hạn (YYYY-MM-DD)"
              value={expiresAt}
              onChangeText={setExpiresAt}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={editMode ? handleUpdateVoucher : handleAddVoucher}
              >
                <Text style={styles.saveButtonText}>Lưu</Text>
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
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 20,
  },
  voucherItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  voucherInfo: {
    flex: 1,
  },
  voucherCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  voucherDiscount: {
    fontSize: 14,
    color: '#16a34a',
  },
  voucherStatus: {
    fontSize: 14,
    color: '#6b7280',
  },
  voucherExpires: {
    fontSize: 14,
    color: '#6b7280',
  },
  voucherActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#EF4444',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2196F3',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default VoucherManagementScreen;
