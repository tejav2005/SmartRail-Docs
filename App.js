import 'react-native-gesture-handler';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import { LanguageProvider } from './components/LanguageContext';

import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import DrawerNavigator from './components/DrawerNavigator';

const Stack = createNativeStackNavigator();

// Main App Component wrapped in Theme Logic
function AppContent() {
  const { theme } = useTheme();
  const { bootstrapping, isAuthenticated } = useAuth();

  if (bootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer key={isAuthenticated ? 'auth' : 'guest'} theme={theme}>
      <Stack.Navigator key={isAuthenticated ? 'auth-stack' : 'guest-stack'} screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen
            name="MainApp"
            component={DrawerNavigator}
          />
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
