import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

const DICEBEAR = 'https://api.dicebear.com/7.x/avataaars/png?seed=';

export default function CustomDrawerContent(props) {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [profilePic, setProfilePic] = useState(null);

  const displayName = user?.name || 'KMRL Staff';
  const displayRole = user?.role === 'admin' ? t('administrator') : (user?.department || t('staffFallback'));
  const displayEmpId = user?.employeeId || '-';
  const avatarUri = profilePic ?? `${DICEBEAR}${user?.employeeId ?? 'KMRL'}&backgroundColor=ffffff&clothesColor=0056b3`;

  useEffect(() => {
    AsyncStorage.getItem('kmrl_profile_pic').then((uri) => {
      setProfilePic(uri || null);
    });
  }, []);

  const navigateToTab = (tabName) => {
    props.navigation.navigate('MainTabs', { screen: tabName });
    props.navigation.closeDrawer();
  };

  const handleLogout = async () => {
    await signOut();
  };

  const NavItem = ({ icon, label, onPress }) => (
    <TouchableOpacity
      style={[styles.navItem, { borderBottomColor: theme.colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.navIconWrap, { backgroundColor: 'rgba(0,86,179,0.1)' }]}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
      </View>
      <Text style={[styles.navLabel, { color: theme.colors.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={theme.colors.muted} />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.header}>
        <View style={styles.avatarRing}>
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{displayRole}</Text>
        </View>
        <Text style={styles.idText}>ID: {displayEmpId}</Text>
      </View>

      <DrawerContentScrollView {...props} scrollEnabled={false} style={{ flex: 1 }}>
        <View style={[styles.navSection, { backgroundColor: theme.colors.card }]}>
          <NavItem icon="home-outline" label={t('home')} onPress={() => navigateToTab('HomeStack')} />
          <NavItem icon="cloud-upload-outline" label={t('uploadDocument')} onPress={() => navigateToTab('Upload')} />
          <NavItem icon="calendar-outline" label={t('meetings')} onPress={() => navigateToTab('Meetings')} />
          <NavItem icon="person-outline" label={t('profile')} onPress={() => navigateToTab('ProfileStack')} />
        </View>
      </DrawerContentScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#0056b3',
    paddingTop: 55,
    paddingBottom: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  avatarRing: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  name: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 6 },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 6,
  },
  roleText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  idText: { color: 'rgba(255,255,255,0.65)', fontSize: 11 },
  navSection: {
    marginHorizontal: 12,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  navIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  navLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderRadius: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  logoutText: {
    fontSize: 15,
    color: '#EF4444',
    fontWeight: '700',
    marginLeft: 10,
  },
});
