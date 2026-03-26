import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, FlatList, SafeAreaView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import { getNotifications, markNotificationRead, markAllNotificationsRead, dismissNotification } from '../services/api';

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
  return `${d}d ago`;
}

const TYPE_META = {
  meeting: { icon: 'calendar-outline', color: '#0056b3', bg: '#EBF4FF' },
  document: { icon: 'document-text-outline', color: '#7C3AED', bg: '#EDE9FE' },
  system: { icon: 'information-circle-outline', color: '#0891b2', bg: '#E0F2FE' },
  urgent: { icon: 'alert-circle-outline', color: '#EF4444', bg: '#FEE2E2' },
};

function NotifCard({ item, onRead, onDismiss }) {
  const { theme } = useTheme();
  const meta = TYPE_META[item.type] || TYPE_META.system;

  return (
    <Animated.View entering={FadeInDown.springify()}>
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.card,
          { backgroundColor: theme.colors.card },
          !item.read && { borderLeftColor: meta.color, borderLeftWidth: 4 },
        ]}
        onPress={() => !item.read && onRead(item._id)}
      >
        <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon} size={20} color={meta.color} />
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.read && <View style={[styles.unreadDot, { backgroundColor: meta.color }]} />}
          </View>
          <Text style={[styles.cardMessage, { color: theme.colors.subText }]} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={[styles.cardTime, { color: theme.colors.muted }]}>
            {formatRelativeTime(item.createdAt)}
          </Text>
        </View>

        <TouchableOpacity onPress={() => onDismiss(item._id)} style={styles.dismissBtn}>
          <Ionicons name="close" size={16} color={theme.colors.muted} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function NotificationScreen({ navigation }) {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res?.data ?? []);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const onRefresh = () => { setRefreshing(true); fetchNotifications(true); };

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const handleDismiss = async (id) => {
    try {
      await dismissNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to mark all as read.');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

      {/* Header */}
      <LinearGradient
        colors={['#001A47', '#003580', '#0056b3']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerBlob} />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount} unread</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#0056b3" />
          <Text style={[styles.loadingText, { color: theme.colors.subText }]}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <NotifCard item={item} onRead={handleRead} onDismiss={handleDismiss} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0056b3" />
          }
          ListEmptyComponent={
            <Animated.View entering={FadeIn} style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={56} color="#CBD5E1" />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Notifications</Text>
              <Text style={[styles.emptySub, { color: theme.colors.subText }]}>
                You're all caught up! No new notifications.
              </Text>
            </Animated.View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 44, paddingBottom: 20, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerBlob: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.04)', top: -50, right: -30,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center', gap: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  unreadBadge: {
    backgroundColor: '#F59E0B', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12,
  },
  unreadBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  markAllBtn: {
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10,
    width: 60, alignItems: 'center',
  },
  markAllText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
  loadingText: { fontSize: 14 },

  listContent: { padding: 16, paddingBottom: 32 },
  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderRadius: 16, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  iconWrap: {
    width: 42, height: 42, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  cardBody: { flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  cardTitle: { flex: 1, fontSize: 14, fontWeight: '700' },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  cardMessage: { fontSize: 13, lineHeight: 18, marginBottom: 6 },
  cardTime: { fontSize: 11 },
  dismissBtn: { padding: 4, marginLeft: 6 },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '800' },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 30 },
});
