import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';

export default function AllDocsScreen({ navigation }) {
  const { theme } = useTheme();
  
  // STATE: Filter type ('all' or 'urgent')
  const [filter, setFilter] = useState('all');

  // FUNCTION: Navigate to Home Page
  const goToHome = () => {
    navigation.navigate('MainTabs', { screen: 'HomeStack' });
  };

  // Full Data Source
  const allDocuments = [
    {
      id: '1', title: 'Track Maintenance Alert', summary: 'Urgent repair required at Edappally Station. Signal failure detected.', time: '10 mins ago', urgent: true,
    },
    {
      id: '2', title: 'Monthly Safety Audit', summary: 'Compliance report for October 2024. All stations passed except M.G. Road.', time: '2 hours ago', urgent: false,
    },
    {
      id: '3', title: 'Staff Roster Update', summary: 'New shift timings for night duty engineers effective from next Monday.', time: '5 hours ago', urgent: false,
    },
    {
      id: '4', title: 'Procurement Invoice #402', summary: 'Approved payment for AC maintenance vendor - Elite Services.', time: 'Yesterday', urgent: false,
    },
    {
      id: '5', title: 'Circular: Holiday Schedule', summary: 'List of holidays for the upcoming festival season and duty roster.', time: '2 days ago', urgent: false,
    },
    {
      id: '6', title: 'Passenger Feedback Report', summary: 'Monthly summary of complaints regarding ticketing machines.', time: '3 days ago', urgent: false,
    },
    {
      id: '7', title: 'Vendor Contract Renewal', summary: 'Draft contract for cleaning services for the year 2025.', time: '1 week ago', urgent: false,
    },
  ];

  // FILTER LOGIC
  const filteredDocs = filter === 'all' 
    ? allDocuments 
    : allDocuments.filter(doc => doc.urgent);

  const renderDocItem = ({ item }) => (
    <View style={[styles.card, item.urgent && styles.urgentCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.cardHeader}>
        <Text style={item.urgent ? styles.urgentBadge : styles.normalBadge}>
          {item.urgent ? 'URGENT' : 'GENERAL'}
        </Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.title}</Text>
      <Text style={[styles.cardSummary, { color: '#888' }]}>
        {item.summary}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={goToHome} style={styles.headerLeft}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>All Documents</Text>
        
        {/* NEW: Filter Button */}
        <TouchableOpacity 
          style={styles.headerRight} 
          onPress={() => setFilter(f => f === 'all' ? 'urgent' : 'all')}
        >
          <Text style={styles.filterText}>
            {filter === 'all' ? 'Filter: All' : 'Filter: Urgent'}
          </Text>
        </TouchableOpacity>
      </View>

      {filteredDocs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="file-tray-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>No documents found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDocs}
          renderItem={renderDocItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, paddingTop: 40 },
  headerLeft: { padding: 5, marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  headerRight: { padding: 5, justifyContent: 'center' },
  filterText: { fontSize: 12, color: '#0056b3', fontWeight: 'bold' },
  listContent: { padding: 20, paddingBottom: 40 },
  card: { borderRadius: 12, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, borderLeftWidth: 5, borderLeftColor: '#ccc' },
  urgentCard: { borderLeftColor: '#ff4d4d' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  urgentBadge: { color: '#ff4d4d', fontSize: 11, fontWeight: 'bold', backgroundColor: '#ffe6e6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  normalBadge: { color: '#0056b3', fontSize: 11, fontWeight: 'bold', backgroundColor: '#e6f0ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  time: { fontSize: 12, color: '#999' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  cardSummary: { fontSize: 14, lineHeight: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 10, color: '#999', fontSize: 16 },
});