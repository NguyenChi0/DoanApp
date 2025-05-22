import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ContactScreen = () => {
  const navigation = useNavigation();

  const [showShippingPolicy, setShowShippingPolicy] = useState(false);
  const [showReturnPolicy, setShowReturnPolicy] = useState(false);
  const [showWarrantyPolicy, setShowWarrantyPolicy] = useState(false); // New state for warranty policy

  const handleEmail = () => {
    const email = 'nguyenchi23324@gmail.com';
    const url = `mailto:${email}`;
    Linking.openURL(url).catch((err) => console.error('Error opening email:', err));
  };

  const handleCall = () => {
    const phone = '0945932004';
    const url = `tel:${phone}`;
    Linking.openURL(url).catch((err) => console.error('Error making call:', err));
  };

  const handleSMS = () => {
    const phone = '0945932004';
    const url = Platform.OS === 'ios' ? `sms:${phone}` : `sms:${phone}?body=`;
    Linking.openURL(url).catch((err) => console.error('Error sending SMS:', err));
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Contact Information */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="location" size={24} color="#4B0082" />
            <Text style={styles.infoText}>55 Giải Phóng, Hà Nội, Việt Nam</Text>
          </View>

          <TouchableOpacity style={styles.infoItem} onPress={handleCall}>
            <Ionicons name="call" size={24} color="#4B0082" />
            <Text style={styles.infoText}>0945932004</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoItem} onPress={handleEmail}>
            <Ionicons name="mail" size={24} color="#4B0082" />
            <Text style={styles.infoText}>nguyenchi23324@gmail.com</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoItem} onPress={handleSMS}>
            <Ionicons name="chatbubble" size={24} color="#4B0082" />
            <Text style={styles.infoText}>Nhắn tin: 0945932004</Text>
          </TouchableOpacity>

          <View style={styles.infoItem}>
            <Ionicons name="time" size={24} color="#4B0082" />
            <Text style={styles.infoText}>8:00 - 20:00, Thứ Hai - Chủ Nhật</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Liên hệ ngay</Text>
          <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
            <Ionicons name="mail" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Gửi Email</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Ionicons name="call" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Gọi điện</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleSMS}>
            <Ionicons name="chatbubble" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Nhắn tin</Text>
          </TouchableOpacity>
        </View>

        {/* Shipping Policy */}
        <View style={styles.policySection}>
          <TouchableOpacity onPress={() => setShowShippingPolicy(!showShippingPolicy)}>
            <Text style={styles.sectionTitle}>
              Chính sách giao hàng {' '} {showShippingPolicy ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {showShippingPolicy && (
            <Text style={styles.policyText}>
              - Miễn phí giao hàng cho đơn hàng từ 5.000.000đ.{"\n"}
              - Giao hàng hỏa tốc nội thành Hà Nội trong 3h.{"\n"}
              - Khách có thể tự đến cửa hàng lấy, đặt ship công nghệ cần COD trước cho cửa hàng hoặc cửa hàng hỗ trợ giao đến tận tay quý khách (<Text style={styles.redText}>(cước 6k/km)</Text>) {"\n"}
              - Giao hàng toàn quốc trong vòng 2-5 ngày làm việc.{"\n"}
              - Kiểm tra hàng trước khi thanh toán.
            </Text>
          )}
        </View>

        {/* Return Policy */}
        <View style={styles.policySection}>
          <TouchableOpacity onPress={() => setShowReturnPolicy(!showReturnPolicy)}>
            <Text style={styles.sectionTitle}>
              Chính sách hoàn trả {' '} {showReturnPolicy ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {showReturnPolicy && (
            <Text style={styles.policyText}>
              - Hoàn trả trong vòng 7 ngày kể từ ngày nhận hàng nếu cảm thấy không ưng ý với sản phẩm.{"\n"}
              - Sản phẩm còn nguyên tem, nhãn, chưa qua sử dụng.{"\n"}
              - Khách hàng chịu phí vận chuyển khi hoàn trả.
            </Text>
          )}
        </View>

        {/* Warranty Policy (New Section) */}
        <View style={styles.policySection}>
          <TouchableOpacity onPress={() => setShowWarrantyPolicy(!showWarrantyPolicy)}>
            <Text style={styles.sectionTitle}>
              Chính sách bảo hành {' '} {showWarrantyPolicy ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {showWarrantyPolicy && (
            <Text style={styles.policyText}>
              - Bảo hành 12 tháng cho tất cả các sản phẩm điện tử.{"\n"}
              - Bảo hành 6 tháng cho phụ kiện đi kèm.{"\n"}
              - Bảo hành không áp dụng cho các trường hợp hư hỏng do sử dụng sai cách hoặc tai nạn.{"\n"}
              - Vui lòng giữ hóa đơn hoặc phiếu bảo hành để được hỗ trợ.
            </Text>
          )}
        </View>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#333',
  },
  actionSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#4B0082',
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4B0082',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
    width: '80%',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 8,
  },
  policySection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  policyText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    marginTop: 8,
  },
  redText: {
    color: 'green',
  }
});

export default ContactScreen;