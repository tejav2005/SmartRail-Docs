import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView,
  TouchableOpacity, Switch, Modal, Alert, Pressable,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';

// ─── Setting Toggle Row ─────────────────────────────────────────────────────
function ToggleRow({ icon, iconColor, iconBg, title, subtitle, value, onToggle, isLast }) {
  const { theme } = useTheme();
  return (
    <View style={[
      styles.settingRow,
      !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border },
    ]}>
      <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={19} color={iconColor} />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.settingSubtitle, { color: theme.colors.subText }]}>{subtitle}</Text>
        ) : null}
      </View>
      <Switch
        trackColor={{ false: theme.colors.border, true: 'rgba(0,86,179,0.45)' }}
        thumbColor={value ? '#0056b3' : '#f4f3f4'}
        ios_backgroundColor={theme.colors.border}
        onValueChange={onToggle}
        value={value}
      />
    </View>
  );
}

// ─── Setting Tap Row ────────────────────────────────────────────────────────
function TapRow({ icon, iconColor, iconBg, title, subtitle, value, onPress, isLast, danger }) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.settingRow,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.65}
    >
      <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={19} color={iconColor} />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingTitle, { color: danger ? '#EF4444' : theme.colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.settingSubtitle, { color: theme.colors.subText }]}>{subtitle}</Text>
        ) : null}
      </View>
      {value ? (
        <Text style={[styles.settingValue, { color: theme.colors.muted }]}>{value}</Text>
      ) : null}
      <Ionicons
        name="chevron-forward"
        size={15}
        color={danger ? '#EF4444' : theme.colors.muted}
      />
    </TouchableOpacity>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────
export default function SettingsScreen({ navigation }) {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [notifications, setNotifications] = useState(true);
  const [urgentAlerts, setUrgentAlerts] = useState(true);
  const [showLangModal, setShowLangModal] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  const save = async (key, value) => {
    try { await AsyncStorage.setItem(key, String(value)); } catch {}
  };
  const loadSettings = async () => {
    try {
      const n = await AsyncStorage.getItem('notifications');
      const u = await AsyncStorage.getItem('urgent_alerts');
      if (n !== null) setNotifications(n === 'true');
      if (u !== null) setUrgentAlerts(u === 'true');
      // Language is handled by LanguageContext — no need to load here
    } catch {}
  };

  const handleClearCache = () => {
    Alert.alert(
      t('clearCache'),
      t('clearCacheConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert(t('ok'), t('clearCacheDone'));
          },
        },
      ]
    );
  };

  const LANGUAGES = ['English', 'Malayalam'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

      {/* ── Header ── */}
      <LinearGradient
        colors={['#001A47', '#003580', '#0056b3']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.decor1} />
        <TouchableOpacity
          onPress={() => navigation.navigate('ProfileScreen')}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('settingsTitle')}</Text>
          <Text style={styles.headerSub}>{t('settingsSub')}</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Notifications ── */}
        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <Text style={[styles.groupLabel, { color: theme.colors.subText }]}>{t('notifications').toUpperCase()}</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <ToggleRow
              icon="notifications-outline" iconColor="#D97706" iconBg="#FEF3C7"
              title={t('pushNotifications')}
              subtitle={t('pushNotificationsSub')}
              value={notifications}
              onToggle={v => { setNotifications(v); save('notifications', v); }}
            />
            <ToggleRow
              icon="alert-circle-outline" iconColor="#EF4444" iconBg="#FEE2E2"
              title={t('urgentAlerts')}
              subtitle={t('urgentAlertsSub')}
              value={urgentAlerts}
              onToggle={v => { setUrgentAlerts(v); save('urgent_alerts', v); }}
              isLast
            />
          </View>
        </Animated.View>

        {/* ── Appearance ── */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <Text style={[styles.groupLabel, { color: theme.colors.subText }]}>{t('appearanceGroup')}</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <ToggleRow
              icon="moon-outline" iconColor="#6366f1" iconBg="#EEF2FF"
              title={t('darkMode')}
              subtitle={t('darkModeSub')}
              value={isDarkMode}
              onToggle={toggleTheme}
              isLast
            />
          </View>
        </Animated.View>

        {/* ── Preferences ── */}
        <Animated.View entering={FadeInDown.delay(220).springify()}>
          <Text style={[styles.groupLabel, { color: theme.colors.subText }]}>PREFERENCES</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <TapRow
              icon="language-outline" iconColor="#0891b2" iconBg="#E0F2FE"
              title={t('language')}
              subtitle={t('languageSub')}
              value={language === 'Malayalam' ? 'മലയാളം' : language}
              onPress={() => setShowLangModal(true)}
            />
            <TapRow
              icon="person-outline" iconColor="#2563eb" iconBg="#EFF6FF"
              title={t('profile')}
              subtitle={t('profile')}
              onPress={() => navigation.navigate('ProfileScreen')}
              isLast
            />
          </View>
        </Animated.View>

        {/* ── About ── */}
        <Animated.View entering={FadeInDown.delay(290).springify()}>
          <Text style={[styles.groupLabel, { color: theme.colors.subText }]}>ABOUT</Text>
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <TapRow
              icon="information-circle-outline" iconColor="#16A34A" iconBg="#DCFCE7"
              title={t('aboutKMRLApp')}
              subtitle={t('version')}
              onPress={() => navigation.navigate('About')}
            />
            <TapRow
              icon="help-circle-outline" iconColor="#F59E0B" iconBg="#FEF3C7"
              title={t('helpSupport')}
              subtitle={t('supportContact')}
              onPress={() => Alert.alert(t('helpSupport'), t('supportContact'))}
              isLast
            />
          </View>
        </Animated.View>

        {/* ── Danger Zone ── */}
        <Animated.View entering={FadeInDown.delay(360).springify()}>
          <Text style={[styles.groupLabel, { color: '#EF4444' }]}>DANGER ZONE</Text>
          <View style={[styles.dangerCard, { borderColor: 'rgba(239,68,68,0.2)', backgroundColor: 'rgba(239,68,68,0.04)' }]}>
            <TapRow
              icon="trash-outline" iconColor="#EF4444" iconBg="rgba(239,68,68,0.12)"
              title={t('clearCache')}
              subtitle={t('clearCacheSub')}
              onPress={handleClearCache}
              isLast
              danger
            />
          </View>
        </Animated.View>

        {/* Footer */}
        <Text style={[styles.footer, { color: theme.colors.muted }]}>
          KMRL App v1.0.0 · Build 100 · © 2025 KMRL
        </Text>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* ── Language Modal ── */}
      <Modal animationType="slide" transparent visible={showLangModal} onRequestClose={() => setShowLangModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowLangModal(false)}>
          <Pressable>
            <Animated.View entering={FadeIn} style={[styles.modalSheet, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.modalHandle, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('selectLanguage')}</Text>

              {LANGUAGES.map((lang, i) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.langOption,
                    i < LANGUAGES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border },
                  ]}
                  onPress={() => {
                    setLanguage(lang);
                    setShowLangModal(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.langName, { color: theme.colors.text }]}>
                      {lang === 'Malayalam' ? 'മലയാളം' : lang}
                    </Text>
                    {lang === 'Malayalam' && (
                      <Text style={[styles.langSub, { color: theme.colors.subText }]}>Malayalam</Text>
                    )}
                  </View>
                  {language === lang && (
                    <View style={styles.langCheck}>
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowLangModal(false)}>
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
    paddingTop: 44, paddingBottom: 20, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  decor1: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.04)', top: -40, right: -30,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },

  // Content
  scrollContent: { padding: 20, paddingTop: 18 },
  groupLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    marginBottom: 8, marginTop: 4,
  },
  card: {
    borderRadius: 18, overflow: 'hidden', marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  dangerCard: {
    borderRadius: 18, borderWidth: 1.5, overflow: 'hidden', marginBottom: 6,
  },

  // Rows
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 16, gap: 14,
  },
  settingIcon: { width: 38, height: 38, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  settingText: { flex: 1 },
  settingTitle: { fontSize: 15, fontWeight: '500' },
  settingSubtitle: { fontSize: 12, marginTop: 2 },
  settingValue: { fontSize: 13, marginRight: 4 },

  footer: { textAlign: 'center', fontSize: 11, marginTop: 20 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 34,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  langOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  langName: { fontSize: 16, fontWeight: '600' },
  langSub: { fontSize: 12, marginTop: 2 },
  langCheck: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#0056b3',
    justifyContent: 'center', alignItems: 'center',
  },
  modalCancel: {
    alignItems: 'center', padding: 14, marginTop: 10,
    borderRadius: 14, backgroundColor: 'rgba(239,68,68,0.07)',
  },
  modalCancelText: { color: '#EF4444', fontSize: 15, fontWeight: '700' },
});
