import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';

export default function HomeTab() {
  const navigation = useNavigation();
  
  // STATE: Controls whether we show all docs or just recent ones
  const [showAll, setShowAll] = useState(false);

  const toggleDrawer = () => {
    const parent = navigation.getParent('MainApp');
    if (parent) {
      parent.openDrawer();
    } else {
      navigation.dispatch(DrawerActions.toggleDrawer());
    }
  };

  // 1. Full Data Source (Recent + Older Documents)
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

  // 2. Conditional Data: Show all or slice first 3
  const displayData = showAll ? allDocuments : allDocuments.slice(0, 3);

  const renderDocItem = ({ item }) => (
    <View style={[styles.card, item.urgent && styles.urgentCard]}>
      <View style={styles.cardHeader}>
        <Text style={item.urgent ? styles.urgentBadge : styles.normalBadge}>
          {item.urgent ? 'URGENT' : 'GENERAL'}
        </Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSummary} numberOfLines={2}>
        {item.summary}
      </Text>
    </View>
  );

  const renderListHeader = () => (
    <View>
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.totalDocsCard]}>
          <Ionicons name="document-text-outline" size={24} color="#fff" />
          <Text style={styles.statLabel}>Total Docs</Text>
          <Text style={styles.statNumber}>500</Text>
        </View>

        <View style={[styles.statCard, styles.unreadCard]}>
          <Ionicons name="mail-unread-outline" size={24} color="#fff" />
          <Text style={styles.statLabel}>Unread</Text>
          <Text style={styles.statNumber}>12</Text>
        </View>

        <View style={[styles.statCard, styles.historyCard]}>
          <Ionicons name="time-outline" size={24} color="#fff" />
          <Text style={styles.statLabel}>Meeting today</Text>
          <Text style={styles.statNumber}>{allDocuments.length}</Text>
        </View>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Recent Documents</Text>
        
        {/* BUTTON: Toggles between showing all or recent */}
        <TouchableOpacity onPress={() => setShowAll(!showAll)}>
          <Text style={styles.viewAllText}>
            {showAll ? 'Show Less' : 'View All'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.userName}>Station Manager</Text>
        </View>

        <TouchableOpacity style={styles.bellButton}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayData} // Uses the conditional data
        renderItem={renderDocItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderListHeader}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: 40,
  },
  menuButton: {
    padding: 5,
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 12,
    color: '#888',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bellButton: {
    padding: 5,
    marginLeft: 10,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    backgroundColor: '#ff4d4d',
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalDocsCard: { backgroundColor: '#0056b3' },
  unreadCard: { backgroundColor: '#ff9800' },
  historyCard: { backgroundColor: '#4caf50' },
  statLabel: {
    color: '#fff',
    fontSize: 7,
    marginTop: 5,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#0056b3',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
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