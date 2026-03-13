import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';

export default function CustomDrawerContent(props) {
  const { theme } = useTheme();
  
  const navigateToTab = (tabName) => {
    props.navigation.navigate('MainTabs', { screen: tabName });
    props.navigation.closeDrawer();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes', 
          onPress: () => props.navigation.replace('Login') 
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      
      <View style={styles.headerContainer}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <Text style={styles.name}>Rahul Kumar</Text>
        <Text style={styles.role}>Station Manager</Text>
      </View>

      <DrawerContentScrollView {...props}>
        
        <DrawerItem 
          label="Home" 
          icon={({color, size}) => <Ionicons name="home-outline" size={size} color={color} />}
          onPress={() => navigateToTab('HomeStack')} 
        />
        
        <DrawerItem 
          label="Upload Documents" 
          icon={({color, size}) => <Ionicons name="cloud-upload-outline" size={size} color={color} />}
          onPress={() => navigateToTab('Upload')}
        />

        <DrawerItem 
          label="Meetings" 
          icon={({color, size}) => <Ionicons name="calendar-outline" size={size} color={color} />}
          onPress={() => navigateToTab('Meetings')}
        />

        <DrawerItem 
          label="Profile" 
          icon={({color, size}) => <Ionicons name="person-outline" size={size} color={color} />}
          onPress={() => navigateToTab('ProfileStack')} 
        />
      </DrawerContentScrollView>

      <View style={[styles.footerContainer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#ff4d4d" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#0056b3',
    padding: 25,
    paddingTop: 50,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  role: {
    color: '#e0e0e0',
    fontSize: 13,
  },
  footerContainer: {
    padding: 20,
    borderTopWidth: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  logoutText: {
    fontSize: 15,
    color: '#ff4d4d',
    marginLeft: 15,
    fontWeight: '600',
  },
});