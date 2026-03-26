import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeTab from './HomeStack';
import AllDocsScreen from './AllDocsScreen';
import DocumentDetailScreen from './DocumentDetailScreen';
import NotificationScreen from './NotificationScreen';

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeTab" component={HomeTab} />
      <Stack.Screen name="AllDocs" component={AllDocsScreen} />
      <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
    </Stack.Navigator>
  );
}
