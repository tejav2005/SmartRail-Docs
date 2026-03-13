import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Switch, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './ThemeContext';

export default function SettingsScreen({ navigation }) {
  const { isDarkMode, toggleTheme, theme } = useTheme();

  // FUNCTION: Navigate to Profile Page
  const goToProfile = () => {
    navigation.navigate('ProfileScreen');
  };

  const [name, setName] = useState('Rahul Kumar');
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('English');
  const [showLangModal, setShowLangModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const saveData = async (key, value) => {
    try { await AsyncStorage.setItem(key, String(value)); } catch (e) { console.log("Error", e); }
  };

  const loadData = async () => {
    try {
      const savedName = await AsyncStorage.getItem('user_name');
      const savedNotif = await AsyncStorage.getItem('notifications');
      const savedLang = await AsyncStorage.getItem('language');
      if (savedName) setName(savedName);
      if (savedNotif !== null) setNotifications(savedNotif === 'true');
      if (savedLang) setLanguage(savedLang);
    } catch (e) { console.log("Error loading data"); } finally { setLoading(false); }
  };

  const handleEditName = () => {
    Alert.prompt("Edit Name", "Enter your new display name", [
      { text: "Cancel", style: "cancel" },
      { text: "OK", onPress: (newName) => { if (newName) { setName(newName); saveData('user_name', newName); } } }
    ], "plain-text", name);
  };

  const toggleNotification = (value) => { setNotifications(value); saveData('notifications', value); };
  const selectLanguage = (lang) => { setLanguage(lang); saveData('language', lang); setShowLangModal(false); Alert.alert('Language Changed', `Set to ${lang}`); };

  const SettingRow = ({ icon, title, value, onPress, isSwitch, switchValue, onSwitch }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={22} color="#555" style={{ marginRight: 15 }} />
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{title}</Text>
      </View>
      <View style={styles.settingRight}>
        {isSwitch ? (
          <Switch trackColor={{ false: "#ccc", true: "#0056b3" }} thumbColor={switchValue ? "#fff" : "#f4f3f4"} onValueChange={onSwitch} value={switchValue} />
        ) : (
          <TouchableOpacity onPress={onPress} style={styles.valueContainer}>
            <Text style={styles.valueText}>{value}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* UPDATED HEADER: Back to Profile */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={goToProfile} style={styles.headerLeft}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>App Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>ACCOUNT</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <SettingRow icon="person-outline" title="Display Name" value={name} onPress={handleEditName} />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <SettingRow icon="card-outline" title="Employee ID" value="KMRL - 2024 - 88" onPress={() => Alert.alert('Info', 'Cannot change ID')} />
        </View>

        <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>PREFERENCES</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <SettingRow icon="notifications-outline" title="Push Notifications" isSwitch={true} switchValue={notifications} onSwitch={toggleNotification} />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <SettingRow icon="language-outline" title="Language" value={language} onPress={() => setShowLangModal(true)} />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <SettingRow icon="moon-outline" title="Dark Mode" isSwitch={true} switchValue={isDarkMode} onSwitch={toggleTheme} />
        </View>

        <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>DATA & STORAGE</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <TouchableOpacity style={styles.dangerRow} onPress={() => { Alert.alert('Clear Cache', 'Are you sure?', [{text: 'Cancel'}, {text: 'Clear', onPress: () => { AsyncStorage.clear(); Alert.alert('Done', 'Cleared'); }}]); }}>
            <View style={styles.settingLeft}>
              <Ionicons name="trash-outline" size={22} color="#ff4d4d" style={{ marginRight: 15 }} />
              <Text style={[styles.settingTitle, {color: '#ff4d4d'}]}>Clear Local Cache</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={showLangModal} onRequestClose={() => setShowLangModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select Language</Text>
            <TouchableOpacity style={styles.modalOption} onPress={() => selectLanguage('English')}>
              <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>English</Text>
              {language === 'English' && <Ionicons name="checkmark" size={20} color="#0056b3" />}
            </TouchableOpacity>
            <View style={styles.modalDivider} />
            <TouchableOpacity style={styles.modalOption} onPress={() => selectLanguage('Malayalam')}>
              <Text style={[styles.modalOptionText, { color: theme.colors.text }]}>മലയാളം (Malayalam)</Text>
              {language === 'Malayalam' && <Ionicons name="checkmark" size={20} color="#0056b3" />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowLangModal(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, paddingTop: 40 },
  headerLeft: { padding: 5, marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  scrollView: { padding: 20 },
  sectionHeader: { fontSize: 12, fontWeight: 'bold', marginTop: 10, marginBottom: 5, marginLeft: 5 },
  card: { borderRadius: 10, overflow: 'hidden', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingTitle: { fontSize: 15 },
  settingRight: { alignItems: 'center' },
  valueContainer: { flexDirection: 'row', alignItems: 'center' },
  valueText: { fontSize: 14, color: '#666', marginRight: 5 },
  divider: { height: 1, marginLeft: 52 },
  dangerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalOption: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15 },
  modalOptionText: { fontSize: 16 },
  modalDivider: { height: 1, backgroundColor: '#eee' },
  modalClose: { marginTop: 20, alignItems: 'center', padding: 10 },
  modalCloseText: { color: '#0056b3', fontSize: 16, fontWeight: 'bold' },
});