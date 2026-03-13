import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import HomeStack from './HomeStack';
import UploadScreen from './UploadScreen';
import MeetingScreen from './MeetingScreen';
import ProfileStack from './ProfileStack'; // <--- IMPORT THE STACK, NOT THE SCREEN

const Tab = createBottomTabNavigator();

// Logic to hide tab bar on nested screens
function getTabBarVisibility(route) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'HomeTab';
  
  // Hide tab bar if we are on 'AllDocs' (Home Stack) OR 'About' (Profile Stack)
  if (routeName === 'AllDocs' || routeName === 'About') {
    return { display: 'none' }; 
  }
  return { display: 'flex' };
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeStack') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Upload') iconName = focused ? 'cloud-upload' : 'cloud-upload-outline';
          else if (route.name === 'Meetings') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'ProfileStack') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0056b3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        // Apply the hiding logic
        tabBarStyle: getTabBarVisibility(route),
      })}
    >
      <Tab.Screen name="HomeStack" component={HomeStack} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Upload" component={UploadScreen} />
      <Tab.Screen name="Meetings" component={MeetingScreen} />
      
      {/* USE ProfileStack HERE */}
      <Tab.Screen name="ProfileStack" component={ProfileStack} options={{ tabBarLabel: 'Profile' }} />
      
    </Tab.Navigator>
  );
}