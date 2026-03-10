import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

// Import the Tab Navigator and Custom Content
import TabNavigator from './TabNavigator';
import CustomDrawerContent from './DrawerContent';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false, // Hide default headers
        drawerActiveTintColor: '#0056b3',
        drawerInactiveTintColor: '#666',
        drawerStyle: {
          width: 280, // Width of the sidebar
        },
      }}
      // Link our Custom Drawer (with Logout) here
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      {/* 
         We only need one screen in the drawer: The Tab Navigator.
         We name it 'MainTabs' so the Sidebar can navigate to specific tabs inside it.
      */}
      <Drawer.Screen 
        name="MainTabs" 
        component={TabNavigator} 
        options={{ 
          title: 'KMRL App',
          drawerIcon: ({color}) => (
            <Ionicons name="grid-outline" size={22} color={color} />
          )
        }} 
      />
    </Drawer.Navigator>
  );
}