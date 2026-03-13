import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';

import TabNavigator from './TabNavigator';
import CustomDrawerContent from './DrawerContent';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const { theme } = useTheme();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 280,
          backgroundColor: theme.colors.card,
        },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.text,
        drawerActiveBackgroundColor: 'rgba(0, 86, 179, 0.1)',
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
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