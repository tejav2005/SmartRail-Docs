import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext'; // <--- IMPORT THEME

export default function ProfileScreen({ navigation }) {
  const { theme } = useTheme(); // <--- GET THEME
  
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', onPress: () => navigation.replace('Login') },
    ]);
  };

  return (
    // 1. DYNAMIC BACKGROUND
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        
        {/* 2. HEADER: Stays Blue (Brand Identity) */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>
          <Text style={styles.name}>Rahul Kumar</Text>
          <Text style={styles.role}>Station Manager</Text>
          <Text style={styles.id}>KMRL - 2024 - 88</Text>
        </View>

        {/* 3. DYNAMIC MENU BACKGROUND */}
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

          {/* Dynamic Divider */}
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

        {/* 4. DYNAMIC LOGOUT BUTTON BACKGROUND */}
        <View style={styles.footerSection}>
          <TouchableOpacity 
            style={[styles.logoutBtn, { backgroundColor: theme.colors.card, borderColor: '#ff4d4d' }]} 
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
    // Background is now handled inline to support dynamic theme
  },
  scrollView: { 
    flex: 1 
  },
  header: {
    backgroundColor: '#0056b3', 
    padding: 30, 
    paddingTop: 50, 
    alignItems: 'center',
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30, 
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 15, 
    borderWidth: 2, 
    borderColor: '#fff',
  },
  name: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  role: { 
    fontSize: 14, 
    color: '#e0e0e0', 
    marginTop: 5 
  },
  id: { 
    fontSize: 12, 
    color: '#e0e0e0', 
    marginTop: 2 
  },
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
    // Background is now handled inline
  },
  menuItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 15,
  },
  menuLeft: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  menuText: { 
    fontSize: 16, 
    marginLeft: 15 
    // Color is now handled inline
  },
  menuDivider: {
    height: 1,
    marginHorizontal: 15,
    // Color is now handled inline
  },
  footerSection: { 
    paddingHorizontal: 20, 
    paddingBottom: 40 
  },
  logoutBtn: { 
    padding: 15, 
    borderRadius: 10, 
    borderWidth: 1, 
    alignItems: 'center',
    // Background is now handled inline
  },
  logoutText: { 
    color: '#ff4d4d', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});