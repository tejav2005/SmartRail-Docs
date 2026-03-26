import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './ThemeContext';

import HomeStackNavigator from './HomeStackNavigator';
import UploadScreen from './UploadScreen';
import MeetingScreen from './MeetingScreen';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();

const TABS = [
  {
    name: 'HomeStack',
    label: 'Home',
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
  },
  {
    name: 'Upload',
    label: 'Upload',
    activeIcon: 'cloud-upload',
    inactiveIcon: 'cloud-upload-outline',
  },
  {
    name: 'Meetings',
    label: 'Meetings',
    activeIcon: 'calendar',
    inactiveIcon: 'calendar-outline',
  },
  {
    name: 'ProfileStack',
    label: 'Profile',
    activeIcon: 'person',
    inactiveIcon: 'person-outline',
  },
];

// ─── Animated tab button ───────────────────────────────────────────────────
function TabButton({ tab, isFocused, onPress, onLongPress }) {
  const { theme } = useTheme();
  const scale = useSharedValue(isFocused ? 1.08 : 1);
  const labelOpacity = useSharedValue(isFocused ? 1 : 0);
  const labelTranslate = useSharedValue(isFocused ? 0 : 6);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.08 : 1, {
      damping: 14,
      stiffness: 200,
    });
    labelOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 180 });
    labelTranslate.value = withTiming(isFocused ? 0 : 6, { duration: 180 });
  }, [isFocused]);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const labelAnimStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
    transform: [{ translateY: labelTranslate.value }],
  }));

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}
      style={styles.tabButton}
    >
      {/* Active pill bg */}
      {isFocused && (
        <Animated.View
          entering={ZoomIn.duration(220).springify()}
          style={styles.activePill}
        />
      )}

      {/* Icon */}
      <Animated.View style={iconAnimStyle}>
        <Ionicons
          name={isFocused ? tab.activeIcon : tab.inactiveIcon}
          size={22}
          color={isFocused ? '#0056b3' : '#9CA3AF'}
        />
      </Animated.View>

      {/* Label — only visible when active */}
      <Animated.Text
        style={[styles.tabLabel, labelAnimStyle]}
        numberOfLines={1}
      >
        {tab.label}
      </Animated.Text>
    </TouchableOpacity>
  );
}

// ─── Custom tab bar ────────────────────────────────────────────────────────
function CustomTabBar({ state, navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Hide on nested screens (AllDocs, About)
  const currentRoute = state.routes[state.index];
  const focusedRouteName = getFocusedRouteNameFromRoute(currentRoute);
  if (focusedRouteName === 'AllDocs' || focusedRouteName === 'About' || focusedRouteName === 'DocumentDetail' || focusedRouteName === 'Notifications') {
    return null;
  }

  return (
    <View
      style={[
        styles.tabBarOuter,
        {
          backgroundColor: theme.colors.tabBar,
          paddingBottom: insets.bottom || 12,
          borderTopColor: theme.colors.border,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const tab = TABS.find(t => t.name === route.name) ?? TABS[0];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <TabButton
            key={route.key}
            tab={tab}
            isFocused={isFocused}
            onPress={onPress}
            onLongPress={onLongPress}
          />
        );
      })}
    </View>
  );
}

// ─── Navigator ─────────────────────────────────────────────────────────────
export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeStack"    component={HomeStackNavigator} options={{ title: 'Home' }} />
      <Tab.Screen name="Upload"       component={UploadScreen}  options={{ title: 'Upload'   }} />
      <Tab.Screen name="Meetings"     component={MeetingScreen} options={{ title: 'Meetings' }} />
      <Tab.Screen name="ProfileStack" component={ProfileStack}  options={{ title: 'Profile'  }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  // ── Tab bar container ──────────────────────────────────────────────────
  tabBarOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopWidth: 0.5,
    // Floating upward shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 20,
  },

  // ── Individual tab button ──────────────────────────────────────────────
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    minHeight: 52,
    position: 'relative',
  },

  // Active pill background
  activePill: {
    position: 'absolute',
    width: 72,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 86, 179, 0.1)',
    top: 0,
  },

  // Label
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0056b3',
    marginTop: 4,
    letterSpacing: 0.2,
  },
});