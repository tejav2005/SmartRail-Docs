import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';

export default function AboutScreen({ navigation }) {
  const { theme } = useTheme();

  // FUNCTION: Navigate to Profile Page
  const goToProfile = () => {
    navigation.navigate('ProfileScreen');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* UPDATED HEADER: Back to Profile */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={goToProfile} style={styles.headerLeft}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>About KMRL App</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.iconContainer}>
          <Ionicons name="subway-outline" size={80} color="#0056b3" />
        </View>

        <Text style={[styles.appName, { color: theme.colors.text }]}>KMRL Document Assistant</Text>
        <Text style={styles.version}>Version 1.0.0</Text>

        <View style={styles.divider} />

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Description</Text>
        <Text style={styles.description}>
          An automated document management solution designed for Kochi Metro Rail Limited (KMRL). 
          This app helps in smart filtering, prioritization, and summarization of official communications, 
          ensuring efficient workflow for station managers and staff.
        </Text>

        <View style={styles.divider} />

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Developed By</Text>
        <View style={[styles.teamContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={styles.teamName}>Team SochNova</Text>
          <Text style={styles.hackathon}>Smart India Hackathon 2025</Text>
        </View>

        <View style={styles.divider} />

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Features</Text>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color="#0056b3" />
          <Text style={[styles.featureText, { color: theme.colors.text }]}>Smart Document Summarization</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color="#0056b3" />
          <Text style={[styles.featureText, { color: theme.colors.text }]}>Real-time Notifications</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color="#0056b3" />
          <Text style={[styles.featureText, { color: theme.colors.text }]}>Bilingual Support (English & Malayalam)</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, paddingTop: 40 },
  headerLeft: { padding: 5, marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  scrollContent: { padding: 20, alignItems: 'center', paddingBottom: 40 },
  iconContainer: { marginTop: 20, marginBottom: 15 },
  appName: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  version: { fontSize: 14, color: '#888', marginBottom: 20 },
  divider: { width: '100%', height: 1, backgroundColor: '#eee', marginVertical: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', width: '100%', marginBottom: 10 },
  description: { fontSize: 14, color: '#666', lineHeight: 22, textAlign: 'justify' },
  teamContainer: { alignItems: 'center', padding: 15, borderRadius: 10, width: '100%' },
  teamName: { fontSize: 18, fontWeight: 'bold', color: '#0056b3' },
  hackathon: { fontSize: 12, color: '#666', marginTop: 5 },
  featureItem: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 10 },
  featureText: { fontSize: 14, marginLeft: 10 },
});