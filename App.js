import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, useTheme } from './components/ThemeContext'; // Import Theme Context

import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import DrawerNavigator from './components/DrawerNavigator';

const Stack = createNativeStackNavigator();

// Main App Component wrapped in Theme Logic
function AppContent() {
  const { theme } = useTheme(); // Get current theme

  return (
    <NavigationContainer theme={theme}> {/* <--- APPLY THEME HERE */}
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Signup" 
          component={SignupScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="MainApp" 
          component={DrawerNavigator} 
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}