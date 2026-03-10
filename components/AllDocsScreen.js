import React from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AllDocsScreen({ navigation }) {
  
  // Full Data Source
  const allDocuments = [
    {
      id: '1',
      title: 'Track Maintenance Alert',
      summary: 'Urgent repair required at Edappally Station. Signal failure detected.',
      time: '10 mins ago',
      urgent: true,
    },
    {
      id: '2',
      title: 'Monthly Safety Audit',
      summary: 'Compliance report for October 2024. All stations passed except M.G. Road.',
      time: '2 hours ago',
      urgent: false,
    },
    {
      id: '3',
      title: 'Staff Roster Update',
      summary: 'New shift timings for night duty engineers effective from next Monday.',
      time: '5 hours ago',
      urgent: false,
    },
    {
      id: '4',
      title: 'Procurement Invoice #402',
      summary: 'Approved payment for AC maintenance vendor - Elite Services.',
      time: 'Yesterday',
      urgent: false,
    },
    {
      id: '5',
      title: 'Circular: Holiday Schedule',
      summary: 'List of holidays for the upcoming festival season and duty roster.',
      time: '2 days ago',
      urgent: false,
    },
    {
      id: '6',
      title: 'Passenger Feedback Report',
      summary: 'Monthly summary of complaints regarding ticketing machines.',
      time: '3 days ago',
      urgent: false,
    },
    {
      id: '7',
      title: 'Vendor Contract Renewal',
      summary: 'Draft contract for cleaning services for the year 2025.',
      time: '1 week ago',
      urgent: false,
    },
  ];

  const renderDocItem = ({ item }) => (
    <View style={[styles.card, item.urgent && styles.urgentCard]}>
      <View style={styles.cardHeader}>
        <Text style={item.urgent ? styles.urgentBadge : styles.normalBadge}>
          {item.urgent ? 'URGENT' : 'GENERAL'}
        </Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSummary}>
        {item.summary}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header for this New Page */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('HomeTab')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Documents</Text>
      </View>

      <FlatList
        data={allDocuments}
        renderItem={renderDocItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: 40,
  },
  backButton: {
    padding: 5,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  // List Styles
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  // Card Styles (Matching HomeTab)
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#ccc',
  },
  urgentCard: {
    borderLeftColor: '#ff4d4d',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  urgentBadge: {
    color: '#ff4d4d',
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: '#ffe6e6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  normalBadge: {
    color: '#0056b3',
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: '#e6f0ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardSummary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});