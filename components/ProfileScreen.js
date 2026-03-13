import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  Alert, 
  Image,
  Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from './ThemeContext';

export default function ProfileScreen({ navigation }) {
  const { theme } = useTheme();

  const [profilePic, setProfilePic] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const avatars = [
    'https://api.dicebear.com/7.x/avataaars/png?seed=ManagerRahul&backgroundColor=ffffff&clothesColor=0056b3&accessoriesChance=10',
    'https://api.dicebear.com/7.x/avataaars/png?seed=DriverAnil&backgroundColor=ffffff&clothesColor=0056b3&accessoriesChance=5',
    'https://api.dicebear.com/7.x/avataaars/png?seed=StaffPriya&backgroundColor=ffffff&clothesColor=0056b3&accessoriesChance=15',
    'https://api.dicebear.com/7.x/avataaars/png?seed=SecurityKumar&backgroundColor=ffffff&clothesColor=0056b3&topChance=0',
    'https://api.dicebear.com/7.x/avataaars/png?seed=CommuterAisha&backgroundColor=ffffff&clothesColor=0056b3&accessoriesChance=0',
    'https://api.dicebear.com/7.x/avataaars/png?seed=OfficerVivek&backgroundColor=ffffff&clothesColor=0056b3&accessoriesChance=20',
  ];

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      cameraType: ImagePicker.CameraType.front,
    });

    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
      setModalVisible(false);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access is required.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
      setModalVisible(false);
    }
  };

  const selectAvatar = (uri) => {
    setProfilePic(uri);
    setModalVisible(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', onPress: () => navigation.replace('Login') },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        
        <View style={styles.header}>
          <View style={styles.imageContainer}>
            <Image
              source={profilePic ? { uri: profilePic } : { uri: 'https://via.placeholder.com/150' }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.cameraIcon} onPress={() => setModalVisible(true)}>
              <Text style={{ fontSize: 18 }}>📷</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>Rahul Kumar</Text>
          <Text style={styles.role}>Station Manager</Text>
          <Text style={styles.id}>ID: KMRL-2024-88</Text>
        </View>

        <View style={[styles.menuSection, { backgroundColor: theme.colors.card }]}>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => Alert.alert('My Documents', 'Coming soon')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="document-text-outline" size={24} color="#333" />
              <Text style={[styles.menuText, { color: theme.colors.text }]}>My Documents</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <View style={[styles.menuDivider, { backgroundColor: theme.colors.border }]} />

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="settings-outline" size={24} color="#333" />
              <Text style={[styles.menuText, { color: theme.colors.text }]}>App Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <View style={[styles.menuDivider, { backgroundColor: theme.colors.border }]} />

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => Alert.alert('Help', 'Contact IT')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="help-circle-outline" size={24} color="#333" />
              <Text style={[styles.menuText, { color: theme.colors.text }]}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <View style={[styles.menuDivider, { backgroundColor: theme.colors.border }]} />

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigation.navigate('About')}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="information-circle-outline" size={24} color="#333" />
              <Text style={[styles.menuText, { color: theme.colors.text }]}>About KMRL App</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

        </View>

        <View style={styles.footerSection}>
          <TouchableOpacity 
            style={[styles.logoutBtn, { backgroundColor: theme.colors.card, borderColor: '#ff4d4d' }]} 
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Update Profile Photo</Text>

              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#0056b3' }]} onPress={takePhoto}>
                <Text style={styles.buttonText}>📷 Take Photo (Selfie)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#555' }]} onPress={pickFromGallery}>
                <Text style={styles.buttonText}>🖼️ Upload from Gallery</Text>
              </TouchableOpacity>

              <Text style={[styles.avatarSectionTitle, { color: theme.colors.text }]}>
                Or choose an Avatar:
              </Text>
              
              <View style={styles.avatarGrid}>
                {avatars.map((avatarUri, index) => (
                  <TouchableOpacity 
                    key={index} 
                    onPress={() => selectAvatar(avatarUri)}
                    style={styles.avatarTouchable}
                  >
                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={{ color: '#ff4d4d', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
              </TouchableOpacity>
            </ScrollView>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  header: {
    backgroundColor: '#0056b3',
    padding: 30,
    paddingTop: 50,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  imageContainer: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  role: { color: '#e0e0e0', fontSize: 14, marginTop: 5 },
  id: { color: '#e0e0e0', fontSize: 12, marginTop: 2 },
  menuSection: {
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
  },
  menuDivider: {
    height: 1,
    marginHorizontal: 15,
  },
  footerSection: { paddingHorizontal: 20, paddingBottom: 40 },
  logoutBtn: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ff4d4d',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    padding: 20,
    borderRadius: 15,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: { color: '#fff', fontSize: 16 },
  avatarSectionTitle: { marginTop: 15, marginBottom: 10, fontWeight: 'bold', textAlign: 'center' },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarTouchable: {
    margin: 5,
    padding: 2,
    borderWidth: 2,
    borderColor: '#0056b3',
    borderRadius: 45,
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
  },
});