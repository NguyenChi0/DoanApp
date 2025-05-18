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
  KeyboardType
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
      const data = await fetchUsers();
      setUsers(data);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách user');
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
            // Kiểm tra nếu lỗi liên quan đến user đã có đơn hàng
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

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.item}>
      <View style={styles.userInfo}>
        <Text style={styles.itemText}>Username: {item.username}</Text>
        <Text style={styles.itemText}>Email: {item.email}</Text>
        <Text style={styles.itemText}>Họ tên: {item.full_name || 'N/A'}</Text>
        <Text style={styles.itemText}>Địa chỉ: {item.address || 'N/A'}</Text>
        <Text style={styles.itemText}>Vai trò: {item.role === 1 ? 'Admin' : 'User'}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.iconButton, styles.editButton]} onPress={() => openEditModal(item)}>
          <Icon name="edit" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconButton, styles.deleteButton]} onPress={() => handleDeleteUser(item.id)}>
          <Icon name="delete" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const InputField = ({ 
    label, 
    placeholder, 
    value, 
    onChangeText, 
    secureTextEntry = false, 
    keyboardType = 'default' as KeyboardType,
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
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>Không có user nào hoặc phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại</Text>}
      />
      
      <TouchableOpacity style={styles.fabButton} onPress={openAddModal}>
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
                <TouchableOpacity onPress={() => setModalVisible(false)}>
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
                    onChangeText={(text) => setNewUser({ ...newUser, username: text })}
                    error={errors.username}
                    required={true}
                  />
                  
                  <InputField
                    label="Password"
                    placeholder={isEditing ? "Nhập để thay đổi password" : "Nhập password"}
                    value={newUser.password}
                    onChangeText={(text) => setNewUser({ ...newUser, password: text })}
                    secureTextEntry={true}
                    error={errors.password}
                    required={!isEditing}
                  />
                  
                  <InputField
                    label="Email"
                    placeholder="example@email.com"
                    value={newUser.email}
                    onChangeText={(text) => setNewUser({ ...newUser, email: text })}
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
                    onChangeText={(text) => setNewUser({ ...newUser, full_name: text })}
                  />
                  
                  <InputField
                    label="Địa chỉ"
                    placeholder="Nhập địa chỉ"
                    value={newUser.address}
                    onChangeText={(text) => setNewUser({ ...newUser, address: text })}
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
                      onValueChange={(value) => setNewUser({ ...newUser, role: value ? 1 : 0 })}
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
                >
                  <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={isEditing ? handleUpdateUser : handleAddUser}
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
    padding: 16,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
    paddingBottom :30,
  },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userInfo: {
    flex: 1,
  },
  itemText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  fabButton: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,    
    backgroundColor: '#4CAF50',
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%',
  },
  formContainer: {
    maxHeight: 500,
    padding: 16,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  requiredStar: {
    color: '#ff4444',
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
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
    color: '#555',
  },
  roleHint: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default UserManagementScreen;