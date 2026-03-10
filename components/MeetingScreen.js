import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MeetingScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Today's Schedule</Text>
      <Text style={styles.dateText}>October 25, 2024</Text>

      {/* Meeting Card 1 */}
      <View style={styles.card}>
        <View style={styles.timeContainer}>
          <Text style={styles.time}>09:00</Text>
          <Text style={styles.amPm}>AM</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>Safety Protocol Review</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.infoText}>Conference Room A, HQ</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.infoText}>Engineering Dept.</Text>
          </View>
        </View>
      </View>

      {/* Meeting Card 2 */}
      <View style={styles.card}>
        <View style={styles.timeContainer}>
          <Text style={styles.time}>02:00</Text>
          <Text style={styles.amPm}>PM</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>Digital Transformation Workshop</Text>
          <View style={styles.infoRow}>
            <Ionicons name="videocam-outline" size={16} color="#666" />
            <Text style={styles.infoText}>Virtual (Google Meet)</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.infoText}>All Staff</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    flexDirection: 'row',
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 15,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    marginRight: 15,
  },
  time: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0056b3',
  },
  amPm: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
});