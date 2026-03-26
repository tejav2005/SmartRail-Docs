import React from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';

const features = [
  { icon: 'flash-outline', label: 'Smart Document Summarization', color: '#0056b3', bg: 'rgba(0,86,179,0.09)' },
  { icon: 'notifications-outline', label: 'Real-time Notifications', color: '#F59E0B', bg: 'rgba(245,158,11,0.09)' },
  { icon: 'language-outline', label: 'Bilingual Support (English & Malayalam)', color: '#22C55E', bg: 'rgba(34,197,94,0.09)' },
  { icon: 'shield-checkmark-outline', label: 'Secure Document Management', color: '#6366F1', bg: 'rgba(99,102,241,0.09)' },
  { icon: 'cloud-upload-outline', label: 'Upload & Analyze Files', color: '#EC4899', bg: 'rgba(236,72,153,0.09)' },
];

export default function AboutScreen({ navigation }) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About KMRL App</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* App identity tile */}
        <View style={[styles.identityCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.appIconWrap}>
            <Ionicons name="subway" size={44} color="#fff" />
          </View>
          <Text style={[styles.appName, { color: theme.colors.text }]}>KMRL Document Assistant</Text>
          <View style={styles.versionBadge}>
            <Ionicons name="code-slash-outline" size={12} color="#0056b3" />
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={[styles.sectionLabel, { color: theme.colors.subText }]}>ABOUT</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.description, { color: theme.colors.subText }]}>
            An automated document management solution designed for Kochi Metro Rail Limited (KMRL).
            This app enables smart filtering, prioritization, and AI-powered summarization of official
            communications, ensuring efficient workflow for station managers and staff.
          </Text>
        </View>

        {/* Team */}
        <Text style={[styles.sectionLabel, { color: theme.colors.subText }]}>DEVELOPED BY</Text>
        <View style={[styles.teamCard, { backgroundColor: '#0056b3' }]}>
          <Ionicons name="people" size={28} color="rgba(255,255,255,0.6)" style={{ marginBottom: 10 }} />
          <Text style={styles.teamName}>Team SochNova</Text>
          <View style={styles.hackBadge}>
            <Text style={styles.hackText}>Smart India Hackathon 2025</Text>
          </View>
        </View>

        {/* Features */}
        <Text style={[styles.sectionLabel, { color: theme.colors.subText }]}>KEY FEATURES</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          {features.map((f, i) => (
            <View key={f.label} style={[
              styles.featureRow,
              i < features.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }
            ]}>
              <View style={[styles.featureIcon, { backgroundColor: f.bg }]}>
                <Ionicons name={f.icon} size={18} color={f.color} />
              </View>
              <Text style={[styles.featureText, { color: theme.colors.text }]}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={[styles.footer, { color: theme.colors.muted }]}>
          © 2025 Kochi Metro Rail Limited. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#0056b3',
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 44, paddingBottom: 16, paddingHorizontal: 16,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: '#fff' },
  scrollContent: { padding: 20, paddingBottom: 40 },

  // Identity card
  identityCard: {
    alignItems: 'center',
    borderRadius: 22, padding: 28,
    marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 5,
  },
  appIconWrap: {
    width: 90, height: 90, borderRadius: 24,
    backgroundColor: '#0056b3',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0056b3', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  appName: { fontSize: 20, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  versionBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20,
  },
  versionText: { fontSize: 12, color: '#0056b3', fontWeight: '700' },

  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10, marginTop: 2 },
  card: {
    borderRadius: 18, overflow: 'hidden', marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  description: { padding: 18, fontSize: 14, lineHeight: 22 },

  // Team card
  teamCard: {
    borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24,
    shadowColor: '#0056b3', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  teamName: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 10 },
  hackBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
  },
  hackText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Features
  featureRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 16,
  },
  featureIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  featureText: { fontSize: 14, fontWeight: '500', flex: 1 },

  footer: { textAlign: 'center', fontSize: 11, marginTop: 8 },
});