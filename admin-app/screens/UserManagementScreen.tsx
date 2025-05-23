import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  Modal, 
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  Switch,
  ActivityIndicator,
  TextInputProps, // Thêm import này
} from 'react-native';
import { fetchUsers, addUser, updateUser, deleteUser } from '../api';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  address: string | null;
  role: number;
}

const UserManagementScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    email: '',
    full_name: '',
    address: '',
    role: 0,
  });
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    email: '',
  });

  const fetchUserList = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserList();
  }, []);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { username: '', password: '', email: '' };

    if (!newUser.username.trim()) {
      newErrors.username = 'Username không được để trống';
      isValid = false;
    }

    if (!isEditing && !newUser.password.trim()) {
      newErrors.password = 'Password không được để trống';
      isValid = false;
    }

    if (!newUser.email.trim()) {
      newErrors.email = 'Email không được để trống';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAddUser = async () => {
    if (!validateForm()) return;
    
    try {
      await addUser(newUser);
      Alert.alert('Thành công', 'Thêm user thành công');
      setModalVisible(false);
      setNewUser({ username: '', password: '', email: '', full_name: '', address: '', role: 0 });
      fetchUserList();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể thêm user');
    }
  };

  const handleUpdateUser = async () => {
    if (!currentUser || !validateForm()) return;
    
    try {
      await updateUser(currentUser.id, newUser);
      Alert.alert('Thành công', 'Cập nhật user thành công');
      setModalVisible(false);
      setNewUser({ username: '', password: '', email: '', full_name: '', address: '', role: 0 });
      setCurrentUser(null);
      fetchUserList();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật user');
    }
  };

  const handleDeleteUser = async (id: number) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa user này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUser(id);
            Alert.alert('Thành công', 'Xóa user thành công');
            fetchUserList();
          } catch (error: any) {
            if (error.hasOrders) {
              Alert.alert(
                'Không thể xóa',
                'Không thể xóa user này vì đã có đơn hàng trong hệ thống',
                [{ text: 'Đóng', style: 'default' }]
              );
            } else {
              Alert.alert('Lỗi', error.message || 'Không thể xóa user');
            }
          }
        },
      },
    ]);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setNewUser({ username: '', password: '', email: '', full_name: '', address: '', role: 0 });
    setErrors({ username: '', password: '', email: '' });
    setModalVisible(true);
  };

  const openEditModal = (user: User) => {
    setIsEditing(true);
    setCurrentUser(user);
    setNewUser({
      username: user.username,
      password: '',
      email: user.email,
      full_name: user.full_name || '',
      address: user.address || '',
      role: user.role,
    });
    setErrors({ username: '', password: '', email: '' });
    setModalVisible(true);
  };

  const InputField = ({ 
    label, 
    placeholder, 
    value, 
    onChangeText, 
    secureTextEntry = false, 
    keyboardType = 'default' as TextInputProps['keyboardType'],
    error = '',
    required = false
  }) => (
    <View style={styles.inputContainer}>
      <View style={styles.labelContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        {required && <Text style={styles.requiredStar}>*</Text>}
      </View>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        placeholderTextColor="#999"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.item}>
      <View style={styles.userInfo}>
        <View style={styles.userRow}>
          <Icon name="person" size={18} color="#666" style={styles.icon} />
          <Text style={styles.usernameText}>{item.username}</Text>
        </View>
        <Text style={styles.itemText}>Email: {item.email}</Text>
        <Text style={styles.itemText}>Họ tên: {item.full_name || 'N/A'}</Text>
        <Text style={styles.itemText}>Địa chỉ: {item.address || 'N/A'}</Text>
        <View style={styles.roleRow}>
          <Icon name={item.role === 1 ? 'admin-panel-settings' : 'person-outline'} size={18} color="#666" style={styles.icon} />
          <Text style={styles.itemText}>Vai trò: {item.role === 1 ? 'Admin' : 'User'}</Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.iconButton, styles.editButton]} onPress={() => openEditModal(item)} activeOpacity={0.7}>
          <Icon name="edit" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconButton, styles.deleteButton]} onPress={() => handleDeleteUser(item.id)} activeOpacity={0.7}>
          <Icon name="delete" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="person-off" size={50} color="#999" />
      <Text style={styles.emptyText}>Không có user nào hoặc phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quản lý Người dùng</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : users.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}
      
      <TouchableOpacity style={styles.fabButton} onPress={openAddModal} activeOpacity={0.7}>
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{isEditing ? 'Sửa thông tin user' : 'Thêm tài khoản mới'}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.7}>
                  <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalDivider} />
              
              <ScrollView style={styles.formContainer}>
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
                  
                  <InputField
                    label="Username"
                    placeholder="Nhập username"
                    value={newUser.username}
                    onChangeText={text => setNewUser({ ...newUser, username: text })}
                    error={errors.username}
                    required={true}
                  />
                  
                  <InputField
                    label="Password"
                    placeholder={isEditing ? "Nhập để thay đổi password" : "Nhập password"}
                    value={newUser.password}
                    onChangeText={text => setNewUser({ ...newUser, password: text })}
                    secureTextEntry={true}
                    error={errors.password}
                    required={!isEditing}
                  />
                  
                  <InputField
                    label="Email"
                    placeholder="example@email.com"
                    value={newUser.email}
                    onChangeText={text => setNewUser({ ...newUser, email: text })}
                    keyboardType="email-address" 
                    error={errors.email}
                    required={true}
                  />
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
                  
                  <InputField
                    label="Họ và tên"
                    placeholder="Nhập họ và tên"
                    value={newUser.full_name}
                    onChangeText={text => setNewUser({ ...newUser, full_name: text })}
                  />
                  
                  <InputField
                    label="Địa chỉ"
                    placeholder="Nhập địa chỉ"
                    value={newUser.address}
                    onChangeText={text => setNewUser({ ...newUser, address: text })}
                  />
                </View>

                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Quyền truy cập</Text>
                  
                  <View style={styles.roleContainer}>
                    <Text style={styles.roleLabel}>Quyền Admin:</Text>
                    <Switch
                      trackColor={{ false: "#d1d1d1", true: "#81b0ff" }}
                      thumbColor={newUser.role === 1 ? "#2196F3" : "#f4f3f4"}
                      ios_backgroundColor="#d1d1d1"
                      onValueChange={value => setNewUser({ ...newUser, role: value ? 1 : 0 })}
                      value={newUser.role === 1}
                    />
                  </View>
                  <Text style={styles.roleHint}>
                    {newUser.role === 1 
                      ? "Người dùng có quyền quản trị hệ thống" 
                      : "Người dùng thông thường"}
                  </Text>
                </View>
              </ScrollView>
              
              <View style={styles.modalDivider} />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={isEditing ? handleUpdateUser : handleAddUser}
                  activeOpacity={0.7}
                >
                  <Text style={styles.submitButtonText}>
                    {isEditing ? 'Cập nhật' : 'Thêm user'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
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
    lineHeight: 24,
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  userInfo: {
    flex: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  usernameText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  itemText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  actionButtons: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  fabButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,    
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 40,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '100%',
  },
  formContainer: {
    padding: 16,
    maxHeight: '80%',
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E88E5',
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  requiredStar: {
    color: '#F44336',
    marginLeft: 4,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  roleHint: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
    lineHeight: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  list: {
    paddingBottom: 80,
  },
});

export default UserManagementScreen;