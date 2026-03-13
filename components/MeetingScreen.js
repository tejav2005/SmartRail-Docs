import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';

export default function MeetingScreen({ navigation }) {
  const { theme } = useTheme();

  // FUNCTION: Navigate to Home Page
  const goToHome = () => {
    navigation.navigate('MainTabs', { screen: 'HomeStack' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* HEADER: Back Arrow + Title */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={goToHome} style={styles.headerLeft}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Today's Schedule</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.dateText}>October 25, 2024</Text>

        {/* Meeting Card 1 */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>09:00</Text>
            <Text style={styles.amPm}>AM</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailsContainer}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Safety Protocol Review</Text>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color="#888" />
              <Text style={styles.infoText}>Conference Room A, HQ</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={16} color="#888" />
              <Text style={styles.infoText}>Engineering Dept.</Text>
            </View>
          </View>
        </View>

        {/* Meeting Card 2 */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>02:00</Text>
            <Text style={styles.amPm}>PM</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailsContainer}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Digital Transformation Workshop</Text>
            <View style={styles.infoRow}>
              <Ionicons name="videocam-outline" size={16} color="#888" />
              <Text style={styles.infoText}>Virtual (Google Meet)</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={16} color="#888" />
              <Text style={styles.infoText}>All Staff</Text>
            </View>
          </View>
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
  contentContainer: { padding: 20 },
  dateText: { fontSize: 14, color: '#888', marginBottom: 20, marginTop: 10 },
  card: { borderRadius: 15, flexDirection: 'row', padding: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  timeContainer: { alignItems: 'center', justifyContent: 'center', paddingRight: 15, marginRight: 15, width: 70 },
  time: { fontSize: 16, fontWeight: 'bold', color: '#0056b3' },
  amPm: { fontSize: 10, color: '#888', fontWeight: '600' },
  divider: { width: 1, backgroundColor: '#eee' },
  detailsContainer: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  infoText: { fontSize: 12, color: '#666', marginLeft: 5 },
});