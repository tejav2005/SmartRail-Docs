import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  SafeAreaView, Alert, Image, Modal, Pressable,
} from 'react-native';
import Animated, {
  FadeInDown, FadeIn, ZoomIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { getDocumentStats, getMeetings } from '../services/api';

const DICEBEAR = 'https://api.dicebear.com/7.x/avataaars/png?seed=';

const AVATARS = [
  `${DICEBEAR}RahulManager&backgroundColor=ffffff&clothesColor=0056b3`,
  `${DICEBEAR}AnilDriver&backgroundColor=ffffff&clothesColor=228B22`,
  `${DICEBEAR}PriyaStaff&backgroundColor=ffffff&clothesColor=8B0000`,
  `${DICEBEAR}KumarSec&backgroundColor=ffffff&clothesColor=4B0082`,
  `${DICEBEAR}AishaComm&backgroundColor=ffffff&clothesColor=B8860B`,
  `${DICEBEAR}VivekOff&backgroundColor=ffffff&clothesColor=008080`,
];

// ─── Menu Row ──────────────────────────────────────────────────────────────
function MenuItem({ icon, label, iconColor, iconBg, onPress, isLast, value }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.menuRow,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.65}
    >
      <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={19} color={iconColor} />
      </View>
      <Text style={[styles.menuLabel, { color: theme.colors.text }]}>{label}</Text>
      {value ? (
        <Text style={[styles.menuValue, { color: theme.colors.muted }]}>{value}</Text>
      ) : null}
      <Ionicons name="chevron-forward" size={15} color={theme.colors.muted} />
    </TouchableOpacity>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [profilePic, setProfilePic] = useState(null);

  // Restore profile photo from storage on mount
  useEffect(() => {
    AsyncStorage.getItem('kmrl_profile_pic').then((uri) => {
      if (uri) setProfilePic(uri);
    });
  }, []);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [stats, setStats] = useState([
    { label: t('documentsStat'), value: '—' },
    { label: t('meetingsStat'),  value: '—' },
    { label: t('alertsStat'),    value: '—' },
  ]);

  // Load live stats
  useEffect(() => {
    async function loadStats() {
      try {
        const [statsRes, meetingsRes] = await Promise.all([
          getDocumentStats(),
          getMeetings(),
        ]);
        setStats([
          { label: t('documentsStat'), value: String(statsRes.data.totalDocs ?? 0) },
          { label: t('meetingsStat'),  value: String(meetingsRes.data?.length ?? 0) },
          { label: t('alertsStat'),    value: String(statsRes.data.urgentDocs ?? 0) },
        ]);
      } catch {
        // Keep dashes on error
      }
    }
    loadStats();
  }, [t]);

  // Use avatar from DiceBear seeded with employeeId for consistent avatar
  const avatarUri = profilePic ?? `${DICEBEAR}${user?.employeeId ?? 'KMRL'}\u0026backgroundColor=ffffff\u0026clothesColor=0056b3`;

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert(t('permissionDenied'), t('cameraAccessRequired')); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 1 });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfilePic(uri);
      await AsyncStorage.setItem('kmrl_profile_pic', uri);
      setShowAvatarModal(false);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert(t('permissionDenied'), t('galleryAccessRequired')); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 1 });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfilePic(uri);
      await AsyncStorage.setItem('kmrl_profile_pic', uri);
      setShowAvatarModal(false);
    }
  };

  const handleLogout = () => {
    signOut();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header Banner ── */}
        <LinearGradient
          colors={['#001A47', '#003580', '#0056b3']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.decor1} />
          <View style={styles.decor2} />

          {/* Avatar */}
          <Animated.View entering={ZoomIn.delay(100).springify()} style={styles.avatarWrap}>
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraBtn} onPress={() => setShowAvatarModal(true)}>
              <Ionicons name="camera" size={15} color="#0056b3" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).springify()} style={{ alignItems: 'center' }}>
            <Text style={styles.profileName}>{user?.name ?? t('staffMember')}</Text>
            <View style={styles.roleBadge}>
              <Ionicons name="shield-checkmark" size={11} color="rgba(255,255,255,0.9)" />
              <Text style={styles.roleText}>{user?.role === 'admin' ? t('administrator') : t('stationStaff')}</Text>
            </View>
            <Text style={styles.profileId}>KMRL · {user?.employeeId ?? ''}</Text>
          </Animated.View>
        </LinearGradient>

        {/* ── Stats Strip ── */}
        <Animated.View entering={FadeInDown.delay(220).springify()}>
          <View style={[styles.statsStrip, { backgroundColor: theme.colors.card }]}>
            {stats.map((s, i) => (
              <React.Fragment key={s.label}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: '#0056b3' }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.subText }]}>{s.label}</Text>
                </View>
                {i < stats.length - 1 && (
                  <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
                )}
              </React.Fragment>
            ))}
          </View>
        </Animated.View>

        {/* ── Menu Sections ── */}
        <Animated.View entering={FadeInDown.delay(280).springify()}>
          <Text style={[styles.groupLabel, { color: theme.colors.subText }]}>{t('accountGroup')}</Text>
          <View style={[styles.menuCard, { backgroundColor: theme.colors.card }]}>
            <MenuItem
              icon="person-outline" label={t('displayName')}
              iconColor="#2563eb" iconBg="#EFF6FF"
              value={user?.name ?? '—'}
              onPress={() => Alert.alert(t('edit'), t('nameEditingSoon'))}
            />
            <MenuItem
              icon="id-card-outline" label={t('employeeId')}
              iconColor="#7C3AED" iconBg="#EDE9FE"
              value={user?.employeeId ?? '—'}
              onPress={() => Alert.alert(t('employeeId'), t('employeeIdLocked'))}
              isLast
            />
          </View>

          <Text style={[styles.groupLabel, { color: theme.colors.subText }]}>{t('navigationGroup')}</Text>
          <View style={[styles.menuCard, { backgroundColor: theme.colors.card }]}>
            <MenuItem
              icon="document-text-outline" label={t('myDocuments')}
              iconColor="#0891b2" iconBg="#E0F2FE"
              onPress={() => navigation.navigate('MainTabs', { screen: 'HomeStack', params: { screen: 'AllDocs' } })}
            />
            <MenuItem
              icon="settings-outline" label={t('appSettings')}
              iconColor="#6366F1" iconBg="rgba(99,102,241,0.1)"
              onPress={() => navigation.navigate('Settings')}
            />
            <MenuItem
              icon="help-circle-outline" label={t('helpSupport')}
              iconColor="#D97706" iconBg="#FEF3C7"
              onPress={() => Alert.alert(t('helpSupport'), t('supportContact'))}
            />
            <MenuItem
              icon="information-circle-outline" label={t('aboutKMRLApp')}
              iconColor="#16A34A" iconBg="#DCFCE7"
              onPress={() => navigation.navigate('About')}
              isLast
            />
          </View>
        </Animated.View>

        {/* ── Logout ── */}
        <Animated.View entering={FadeInDown.delay(340).springify()}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>{t('signOut')}</Text>
          </TouchableOpacity>
          <Text style={[styles.versionNote, { color: theme.colors.muted }]}>KMRL App v1.0.0 · Build 100</Text>
        </Animated.View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* ── Avatar Picker Modal ── */}
      <Modal animationType="slide" transparent visible={showAvatarModal} onRequestClose={() => setShowAvatarModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAvatarModal(false)}>
          <Pressable>
            <Animated.View entering={FadeIn} style={[styles.modalSheet, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.modalHandle, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('changeProfilePhoto')}</Text>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalAction} onPress={pickFromCamera}>
                  <View style={[styles.modalActionIcon, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="camera-outline" size={26} color="#2563eb" />
                  </View>
                  <Text style={[styles.modalActionLabel, { color: theme.colors.text }]}>{t('camera')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalAction} onPress={pickFromGallery}>
                  <View style={[styles.modalActionIcon, { backgroundColor: '#F3F4F6' }]}>
                    <Ionicons name="images-outline" size={26} color="#374151" />
                  </View>
                  <Text style={[styles.modalActionLabel, { color: theme.colors.text }]}>{t('gallery')}</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalSectionLabel, { color: theme.colors.subText }]}>{t('chooseAvatar')}</Text>
              <View style={styles.avatarGrid}>
                {AVATARS.map((uri, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={async () => {
                      setProfilePic(uri);
                      await AsyncStorage.setItem('kmrl_profile_pic', uri);
                      setShowAvatarModal(false);
                    }}
                    style={[styles.avatarThumbWrap, profilePic === uri && styles.avatarThumbActive]}
                  >
                    <Image source={{ uri }} style={styles.avatarThumb} />
                    {profilePic === uri && (
                      <View style={styles.avatarCheckBadge}>
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowAvatarModal(false)}>
                <Text style={styles.modalCancelText}>{t('cancel')}</Text>
              </TouchableOpacity>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 34,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  decor1: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.04)', top: -60, right: -50,
  },
  decor2: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.04)', bottom: -20, left: -20,
  },
  avatarWrap: { width: 106, height: 106, marginBottom: 14 },
  avatar: {
    width: 106, height: 106, borderRadius: 53,
    borderWidth: 3, borderColor: '#fff',
  },
  cameraBtn: {
    position: 'absolute', bottom: 2, right: 2,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
  },
  profileName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 8 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 20, marginBottom: 6,
  },
  roleText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  profileId: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },

  // Stats
  statsStrip: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 4,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 3, fontWeight: '500' },
  statDivider: { width: StyleSheet.hairlineWidth },

  // Menu
  groupLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    marginHorizontal: 20, marginTop: 22, marginBottom: 8,
  },
  menuCard: {
    marginHorizontal: 20,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16, gap: 14,
  },
  menuIcon: { width: 38, height: 38, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  menuValue: { fontSize: 13, marginRight: 4 },

  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10,
    marginHorizontal: 20, marginTop: 22,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.3)',
    backgroundColor: 'rgba(239,68,68,0.05)',
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#EF4444' },
  versionNote: { textAlign: 'center', fontSize: 11, marginTop: 14 },

  // Modal
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 36,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 22 },
  modalActions: { flexDirection: 'row', justifyContent: 'center', gap: 28, marginBottom: 26 },
  modalAction: { alignItems: 'center', gap: 8 },
  modalActionIcon: { width: 64, height: 64, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  modalActionLabel: { fontSize: 13, fontWeight: '600' },
  modalSectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textAlign: 'center', marginBottom: 14 },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 22 },
  avatarThumbWrap: {
    borderRadius: 36, borderWidth: 2.5,
    borderColor: 'transparent', overflow: 'hidden',
    position: 'relative',
  },
  avatarThumbActive: { borderColor: '#0056b3' },
  avatarThumb: { width: 66, height: 66 },
  avatarCheckBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#0056b3',
    justifyContent: 'center', alignItems: 'center',
  },
  modalCancel: {
    alignItems: 'center', padding: 14,
    borderRadius: 14, backgroundColor: 'rgba(239,68,68,0.07)',
  },
  modalCancelText: { color: '#EF4444', fontSize: 15, fontWeight: '700' },
});
