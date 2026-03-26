import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet, Text, View, FlatList, SafeAreaView, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { getDocuments, deleteDocument } from '../services/api';

function formatRelativeTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

export default function AllDocsScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const searchRef = useRef(null);

  const goToHome = () => navigation.navigate('HomeTab');

  const fetchDocuments = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    setError(null);
    try {
      const res = await getDocuments({ limit: 50 });
      // Backend returns { data: [...], meta: {...} }
      const docs = (res?.data ?? []).map((doc) => ({
        ...doc,
        id: doc._id,
        urgent: Array.isArray(doc.tags) && doc.tags.includes('URGENT'),
        summary: doc.summary || doc.description || 'No summary available.',
      }));
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Auto-focus search if coming from search bar tap
  useEffect(() => {
    if (route?.params?.focusSearch) {
      setTimeout(() => searchRef.current?.focus(), 400);
    }
  }, [route?.params?.focusSearch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDocuments(true);
  }, [fetchDocuments]);

  const handleDeleteDocument = useCallback(async (documentId) => {
    try {
      setDeletingId(documentId);
      await deleteDocument(documentId);
      await fetchDocuments(true);
    } catch (err) {
      Alert.alert('Delete Failed', err.message || 'Could not delete this document.');
    } finally {
      setDeletingId(null);
    }
  }, [fetchDocuments]);

  const filteredDocs = documents.filter((doc) => {
    const matchesFilter = filter === 'all' || (filter === 'urgent' ? doc.urgent : !doc.urgent);
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q ||
      doc.title?.toLowerCase().includes(q) ||
      doc.summary?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const canDeleteDocument = useCallback((doc) => {
    if (!user) return false;
    if (user.role === 'admin') return true;

    const currentUserId = user.id || user._id;
    const uploadedById =
      typeof doc.uploadedBy === 'string'
        ? doc.uploadedBy
        : doc.uploadedBy?._id || doc.uploadedBy?.id;
    const hasAccessRole = Array.isArray(doc.accessRoles) && doc.accessRoles.includes(user.role);

    return Boolean(
      hasAccessRole || (uploadedById && currentUserId && uploadedById === currentUserId)
    );
  }, [user]);

  const renderDocItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderLeftColor: item.urgent ? '#EF4444' : '#0056b3' }]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('DocumentDetail', { document: item, documentId: item._id })}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.badge, item.urgent ? styles.urgentBadge : styles.normalBadge]}>
            <Ionicons name={item.urgent ? 'alert-circle' : 'document-text'} size={11} color={item.urgent ? '#EF4444' : '#0056b3'} />
            <Text style={[styles.badgeText, item.urgent ? styles.urgentBadgeText : styles.normalBadgeText]}>
              {item.urgent ? 'URGENT' : 'GENERAL'}
            </Text>
          </View>
          <Text style={[styles.timeText, { color: theme.colors.muted }]}>{formatRelativeTime(item.createdAt)}</Text>
        </View>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.title}</Text>
        <Text style={[styles.cardSummary, { color: theme.colors.subText }]}>{item.summary}</Text>
      </TouchableOpacity>
      <View style={styles.cardFooter}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.cardFooterLeft}
          onPress={() => navigation.navigate('DocumentDetail', { document: item, documentId: item._id })}
        >
          <Text style={[styles.readMore, { color: theme.colors.primary }]}>Read more</Text>
          <Ionicons name="chevron-forward" size={13} color={theme.colors.primary} />
        </TouchableOpacity>
        {canDeleteDocument(item) ? (
          <TouchableOpacity
            onPress={() => handleDeleteDocument(item._id || item.id)}
            disabled={deletingId === (item._id || item.id)}
            style={styles.deleteBtn}
            activeOpacity={0.8}
          >
            {deletingId === (item._id || item.id) ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={14} color="#EF4444" />
                <Text style={styles.deleteBtnText}>Delete</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.filterRow}>
      <TouchableOpacity
        style={[styles.filterChip, filter === 'all' && { backgroundColor: '#0056b3', borderColor: '#0056b3' }]}
        onPress={() => setFilter('all')}
      >
        <Text style={[styles.filterChipText, filter === 'all' && { color: '#fff' }]}>All</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterChip, filter === 'urgent' && { backgroundColor: '#EF4444', borderColor: '#EF4444' }]}
        onPress={() => setFilter('urgent')}
      >
        <Ionicons name="alert-circle" size={13} color={filter === 'urgent' ? '#fff' : '#EF4444'} style={{ marginRight: 4 }} />
        <Text style={[styles.filterChipText, filter === 'urgent' && { color: '#fff' }]}>Urgent</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterChip, filter === 'general' && { backgroundColor: '#0056b3', borderColor: '#0056b3' }]}
        onPress={() => setFilter('general')}
      >
        <Ionicons name="document-text" size={13} color={filter === 'general' ? '#fff' : '#0056b3'} style={{ marginRight: 4 }} />
        <Text style={[styles.filterChipText, filter === 'general' && { color: '#fff' }]}>General</Text>
      </TouchableOpacity>
      <Text style={[styles.countText, { color: theme.colors.muted }]}>
        {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}
      </Text>
    </View>
  );

  const getEmptyStateMessage = () => {
    if (filter === 'urgent') {
      return {
        title: 'No urgent documents',
        subtitle: 'There are no urgent documents right now.',
        icon: 'checkmark-circle-outline',
        iconColor: theme.colors.primary,
      };
    } else if (filter === 'general') {
      return {
        title: 'No general documents',
        subtitle: 'No general documents found for now.',
        icon: 'document-text-outline',
        iconColor: theme.colors.primary,
      };
    }
    return {
      title: 'No documents found',
      subtitle: 'No documents available at the moment.',
      icon: 'file-tray-outline',
      iconColor: theme.colors.muted,
    };
  };

  const emptyStateContent = getEmptyStateMessage();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToHome} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Documents</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Search bar */}
      <View style={[styles.searchWrap, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Ionicons name="search-outline" size={17} color={theme.colors.muted} />
        <TextInput
          ref={searchRef}
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search documents..."
          placeholderTextColor={theme.colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={theme.colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.subText }]}>Loading documents...</Text>
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.colors.card }]}>
            <Ionicons name="warning-outline" size={44} color={theme.colors.danger} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Error</Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.subText }]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchDocuments()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : filteredDocs.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.colors.card }]}>
            <Ionicons name={emptyStateContent.icon} size={44} color={emptyStateContent.iconColor} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>{emptyStateContent.title}</Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.subText }]}>{emptyStateContent.subtitle}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDocs}
          renderItem={renderDocItem}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#0056b3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: '#fff' },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: 'transparent',
  },
  filterChipText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  countText: { marginLeft: 'auto', fontSize: 12, fontWeight: '500' },

  listContent: { paddingBottom: 30 },
  card: {
    marginHorizontal: 18,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 4 },
  urgentBadge: { backgroundColor: '#FEE2E2' },
  normalBadge: { backgroundColor: '#EBF4FF' },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  urgentBadgeText: { color: '#EF4444' },
  normalBadgeText: { color: '#0056b3' },
  timeText: { fontSize: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 5 },
  cardSummary: { fontSize: 13, lineHeight: 19, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardFooterLeft: { flexDirection: 'row', alignItems: 'center' },
  readMore: { fontSize: 12, fontWeight: '700', marginRight: 2 },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  deleteBtnText: { fontSize: 12, fontWeight: '700', color: '#EF4444' },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60, paddingHorizontal: 20 },
  emptyIcon: { width: 90, height: 90, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16 },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#0056b3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginVertical: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 14, borderWidth: 1.5, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
});
