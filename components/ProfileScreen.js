import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
           <Ionicons name="person" size={50} color="#fff" />
        </View>
        <Text style={styles.name}>Rahul Kumar</Text>
        <Text style={styles.role}>Station Manager</Text>
        <Text style={styles.id}>ID: KMRL-2024-88</Text>
      </View>

      <View style={styles.menuContainer}>
        <MenuItem icon="document-text-outline" text="My Documents" />
        <MenuItem icon="settings-outline" text="App Settings" />
        <MenuItem icon="help-circle-outline" text="Help & Support" />
        <MenuItem icon="information-circle-outline" text="About KMRL App" />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => navigation.replace('Login')}>
        <Ionicons name="log-out-outline" size={20} color="#ff4d4d" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function MenuItem({ icon, text }) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={24} color="#333" />
        <Text style={styles.menuText}>{text}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#0056b3',
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  role: {
    fontSize: 14,
    color: '#e0e0e0',
    marginTop: 5,
  },
  id: {
    fontSize: 12,
    color: '#e0e0e0',
    marginTop: 2,
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 10,
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ff4d4d',
  },
  logoutText: {
    color: '#ff4d4d',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});