import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, FlatList, SafeAreaView,
  TouchableOpacity, Pressable, Dimensions, ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  FadeInDown,
  FadeIn,
  ZoomIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { getStats, getDocuments, getNotifications } from '../services/api';

const { width: W } = Dimensions.get('window');

// ─── Skeleton shimmer block ────────────────────────────────────────────────
function SkeletonBlock({ width = '100%', height = 16, radius = 8, style }) {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0.3, { duration: 750 }), withTiming(1, { duration: 750 })),
      -1, false
    );
  }, []);
  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: '#E5E7EB' }, animStyle, style]}
    />
  );
}

// ─── Skeleton doc card ─────────────────────────────────────────────────────
function SkeletonDocCard({ delay = 0 }) {
  return (
    <Animated.View entering={FadeIn.delay(delay)} style={styles.skeletonCard}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <SkeletonBlock width={50} height={50} radius={14} />
        <View style={{ flex: 1, gap: 9 }}>
          <SkeletonBlock width="65%" height={13} />
          <SkeletonBlock width="90%" height={11} />
          <SkeletonBlock width="40%" height={10} />
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Animated Stat Card (clean enterprise style) ───────────────────────────
function StatCard({ icon, label, value, iconColor, iconBg, trend, trendUp, delay = 0 }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={[styles.statCardWrap, animStyle]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.93, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
        style={[
          styles.statCard,
          { backgroundColor: theme.colors.card },
          { borderTopWidth: 3, borderTopColor: iconColor },
          { borderWidth: 1, borderTopWidth: 3, borderColor: iconColor + '28', borderTopColor: iconColor },
        ]}
      >
        <View style={[styles.statIconBubble, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: theme.colors.subText }]} numberOfLines={1}>
          {label}
        </Text>
        {trend ? (
          <View style={[styles.trendChip, { backgroundColor: trendUp ? '#DCFCE7' : '#FEE2E2' }]}>
            <Ionicons
              name={trendUp ? 'trending-up' : 'trending-down'}
              size={9} color={trendUp ? '#16A34A' : '#DC2626'}
            />
            <Text style={[styles.trendText, { color: trendUp ? '#16A34A' : '#DC2626' }]}>
              {trend}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}


// ─── Urgent Alert Banner ───────────────────────────────────────────────────
function UrgentBanner({ count, theme, t }) {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.04, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1, true
    );
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <Animated.View entering={ZoomIn.delay(300).springify()} style={pulseStyle}>
      <LinearGradient
        colors={['#7F1D1D', '#B91C1C', '#EF4444']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.urgentBanner}
      >
        {/* Decorative blobs */}
        <View style={styles.bannerBlob1} />
        <View style={styles.bannerBlob2} />

        <View style={styles.urgentBannerLeft}>
          <View style={styles.urgentIconWrap}>
            <Ionicons name="alert" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.urgentBannerTitle}>{t('urgentAttentionRequired')}</Text>
            <Text style={styles.urgentBannerSub}>
              {t('documentsNeedImmediateAction', count)}
            </Text>
          </View>
        </View>
        <View style={styles.urgentChevronWrap}>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.8)" />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Animated Document Card ────────────────────────────────────────────────
function DocCard({ item, index, onPress, t }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 90).springify()}
      style={animStyle}
    >
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.975, { damping: 18 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 14 }); }}
        onPress={onPress}
        style={[styles.docCard, { backgroundColor: theme.colors.card }]}
      >
        {/* Left gradient accent */}
        <LinearGradient
          colors={item.urgent ? ['#EF4444', '#B91C1C'] : ['#1E88E5', '#0056b3']}
          style={styles.accentBar}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        />

        {/* Icon tile */}
        <View style={[styles.docIconTile, { backgroundColor: item.urgent ? '#FEF2F2' : '#EFF6FF' }]}>
          <Ionicons
            name={item.urgent ? 'warning' : 'document-text-outline'}
            size={22}
            color={item.urgent ? '#EF4444' : '#1D4ED8'}
          />
        </View>

        {/* Text */}
        <View style={styles.docContent}>
          <View style={styles.docTopRow}>
            <View style={[styles.tagPill, item.urgent ? styles.urgentPill : styles.generalPill]}>
              <View style={[styles.tagDot, { backgroundColor: item.urgent ? '#EF4444' : '#1D4ED8' }]} />
              <Text style={[styles.tagText, { color: item.urgent ? '#DC2626' : '#1D4ED8' }]}>
                {item.urgent ? t('urgentTag') : t('general')}
              </Text>
            </View>
            <Text style={[styles.docTime, { color: theme.colors.muted }]}>{item.time}</Text>
          </View>
          <Text style={[styles.docTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.docSummary, { color: theme.colors.subText }]} numberOfLines={2}>
            {item.summary}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={15} color={theme.colors.muted} style={styles.cardChevron} />
      </Pressable>
    </Animated.View>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────
export default function HomeTab() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allDocuments, setAllDocuments] = useState([]);
  const [stats, setStats] = useState({ totalDocs: 0, unreadDocs: 0, urgentDocs: 0 });
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);

      const [statsResult, docsResult, notificationsResult] = await Promise.allSettled([
        getStats(),
        getDocuments({ limit: 7 }),
        getNotifications(),
      ]);

      if (!isMounted) return;

      if (statsResult.status === 'fulfilled' && statsResult.value?.data) {
        setStats(statsResult.value.data);
      } else {
        setStats({ totalDocs: 0, unreadDocs: 0, urgentDocs: 0 });
      }

      if (docsResult.status === 'fulfilled' && Array.isArray(docsResult.value?.data)) {
        setAllDocuments(
          docsResult.value.data.map((doc) => ({
            id: doc._id,
            title: doc.title,
            summary: doc.summary || doc.description || t('noSummaryAvailable'),
            time: formatRelativeTime(doc.createdAt),
            urgent: doc.tags?.includes('URGENT'),
          }))
        );
      } else {
        setAllDocuments([]);
      }

      if (notificationsResult.status === 'fulfilled' && Array.isArray(notificationsResult.value?.data)) {
        setUnreadNotifCount(notificationsResult.value.data.filter((n) => !n.read).length);
      } else {
        setUnreadNotifCount(0);
      }

      setIsLoading(false);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [t]);

  const displayData = showAll ? allDocuments : allDocuments.slice(0, 4);
  const urgentDocs = allDocuments.filter((d) => d.urgent);

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

  const toggleDrawer = () => {
    const parent = navigation.getParent('MainApp');
    if (parent) parent.openDrawer();
    else navigation.dispatch(DrawerActions.toggleDrawer());
  };

  function greetingWord() {
    const h = new Date().getHours();
    if (h < 12) return t('goodMorning');
    if (h < 17) return t('goodAfternoon');
    return t('goodEvening');
  }

  // ── List Header ──────────────────────────────────────────────────────────
  const ListHeader = () => (
    <View>
      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard
          icon="document-text-outline"
          label={t('totalDocs')}
          value={String(stats.totalDocs)}
          iconColor="#2563eb"
          iconBg="#EFF6FF"
          delay={100}
        />
        <StatCard
          icon="mail-unread-outline"
          label={t('unread')}
          value={String(stats.unreadDocs)}
          iconColor="#D97706"
          iconBg="#FEF3C7"
          delay={190}
        />
        <StatCard
          icon="alert-circle-outline"
          label={t('urgent')}
          value={String(stats.urgentDocs)}
          iconColor="#DC2626"
          iconBg="#FEE2E2"
          delay={280}
        />
      </View>

      {/* Urgent alert banner */}
      {urgentDocs.length > 0 && (
        <View style={styles.bannerWrapper}>
          <UrgentBanner count={urgentDocs.length} theme={theme} t={t} />
        </View>
      )}

      {/* Divider with label */}
      <Animated.View entering={FadeInDown.delay(350).springify()} style={styles.sectionHeaderRow}>
        <View>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('recentDocuments')}</Text>
          <Text style={[styles.sectionCount, { color: theme.colors.subText }]}>
            {t('recentDocumentsCount', displayData.length, allDocuments.length)}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.viewAllBtn, { borderColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('AllDocs')}
          activeOpacity={0.75}
        >
          <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
            {t('viewAll')}
          </Text>
          <Ionicons name="chevron-forward" size={12} color={theme.colors.primary} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  // ── Skeleton ─────────────────────────────────────────────────────────────
  const SkeletonView = () => (
    <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
      {/* Stat skeleton */}
      <View style={styles.statsRow}>
        {[0, 1, 2].map(i => (
          <Animated.View key={i} entering={FadeIn.delay(i * 80)} style={[styles.statCardWrap]}>
            <View style={[styles.statCard, { backgroundColor: '#E9EEF5' }]}>
              <SkeletonBlock width={34} height={34} radius={10} style={{ marginBottom: 12 }} />
              <SkeletonBlock width="55%" height={22} radius={7} style={{ marginBottom: 7 }} />
              <SkeletonBlock width="75%" height={10} radius={5} />
            </View>
          </Animated.View>
        ))}
      </View>
      {/* Banner skeleton */}
      <View style={[styles.bannerWrapper, { opacity: 0.4 }]}>
        <SkeletonBlock height={68} radius={18} />
      </View>
      {/* Heading skeleton */}
      <View style={[styles.sectionHeaderRow, { marginBottom: 16 }]}>
        <SkeletonBlock width={150} height={16} radius={6} />
        <SkeletonBlock width={70} height={30} radius={20} />
      </View>
      {/* Doc card skeletons */}
      {[0, 1, 2, 3].map(i => <SkeletonDocCard key={i} delay={i * 80} />)}
    </ScrollView>
  );

  // ── Empty state ───────────────────────────────────────────────────────────
  const EmptyState = () => (
    <Animated.View entering={FadeIn} style={styles.emptyState}>
      <LinearGradient colors={['#EFF6FF', '#DBEAFE']} style={styles.emptyIconWrap}>
        <Ionicons name="document-text-outline" size={48} color="#1D4ED8" />
      </LinearGradient>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>{t('noDocumentsYet')}</Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.subText }]}>
        {t('uploadFirstDocument')}
      </Text>
      <TouchableOpacity
        style={styles.emptyBtn}
        onPress={() => navigation.navigate('MainTabs', { screen: 'Upload' })}
        activeOpacity={0.85}
      >
        <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
        <Text style={styles.emptyBtnText}>{t('uploadDocument')}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

      {/* ── Header ── */}
      <LinearGradient
        colors={['#001A47', '#00225A', '#003580', '#0056b3']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Decorative circles for depth */}
        <View style={styles.decor1} />
        <View style={styles.decor2} />
        <View style={styles.decor3} />

        {/* Top row */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={toggleDrawer} style={styles.headerBtn}>
            <Ionicons name="menu" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Center logo chip */}
          <View style={styles.logoChip}>
            <Ionicons name="subway" size={13} color="#0056b3" />
            <Text style={styles.logoChipText}>KMRL</Text>
          </View>

          {/* Notification bell with real unread badge */}
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            {unreadNotifCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadNotifCount > 9 ? '9+' : unreadNotifCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greetingBlock}>
          <Text style={styles.greetingSmall}>{greetingWord()}</Text>
          <Text style={styles.greetingName}>{user?.name ?? t('staffFallback')}</Text>
          <View style={styles.greetingMetaRow}>
            <View style={styles.greetingMetaDot} />
            <Text style={styles.greetingMeta}>Kochi Metro · {user?.department || t('operationsFallback')}</Text>
          </View>
        </View>

        {/* Search bar */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('AllDocs', { focusSearch: true })}
        >
          <View style={styles.searchLeft}>
            <Ionicons name="search-outline" size={17} color="#6B7280" />
            <Text style={styles.searchPlaceholder}>{t('searchPlaceholder')}</Text>
          </View>
          <View style={styles.searchPill}>
            <Text style={styles.searchPillText}>⌘ K</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      {/* ── Content ── */}
      {isLoading ? (
        <SkeletonView />
      ) : (
        <FlatList
          data={displayData}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <DocCard
              item={item}
              index={index}
              onPress={() => navigation.navigate('DocumentDetail', { document: item, documentId: item.id })}
              t={t}
            />
          )}
          ListHeaderComponent={<ListHeader />}
          ListEmptyComponent={<EmptyState />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            displayData.length > 0 ? (
              <Animated.View entering={FadeIn.delay(500)} style={styles.footerRow}>
                <View style={styles.footerDot} />
                <Text style={[styles.footerText, { color: theme.colors.muted }]}>
                  {t('securedFooter')}
                </Text>
                <View style={styles.footerDot} />
              </Animated.View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const statCardW = (W - 40 - 12) / 3;   // 20px side padding, 2×6 gap

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    paddingTop: 44,
    paddingBottom: 22,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    position: 'relative',
  },

  // Decorative circles
  decor1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: -60,
    right: -50,
  },
  decor2: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: 10,
    left: -40,
  },
  decor3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: 30,
    right: 90,
  },

  // Top row
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
    zIndex: 1,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  logoChipText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0056b3',
    letterSpacing: 2,
  },
  notifBadge: {
    position: 'absolute',
    top: -1, right: -1,
    width: 16, height: 16,
    borderRadius: 8,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#002D6B',
  },
  notifBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },

  // Greeting
  greetingBlock: { marginBottom: 20, zIndex: 1 },
  greetingSmall: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  greetingName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.4,
    marginBottom: 7,
  },
  greetingMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  greetingMetaDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  greetingMeta: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 13,
    zIndex: 1,
  },
  searchLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchPlaceholder: { fontSize: 14, color: '#9CA3AF' },
  searchPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchPillText: { fontSize: 10, color: '#6B7280', fontWeight: '700' },

  // ── Stats ────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 16,
  },
  statCardWrap: {
    flex: 1,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 5,
  },
  statCard: {
    borderRadius: 16,
    padding: 14,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  statIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  trendText: {
    fontSize: 9,
    fontWeight: '700',
  },

  // ── Urgent Banner ────────────────────────────────────────────────────────
  bannerWrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  urgentBanner: {
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  bannerBlob1: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -25,
    right: 20,
  },
  bannerBlob2: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -20,
    right: 70,
  },
  urgentBannerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  urgentIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgentBannerTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 2,
  },
  urgentBannerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  urgentChevronWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Section Header ───────────────────────────────────────────────────────
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionCount: {
    fontSize: 12,
    marginTop: 3,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 6,
  },
  viewAllText: { fontSize: 12, fontWeight: '700' },

  // ── Document Cards ───────────────────────────────────────────────────────
  listContent: { paddingBottom: 32 },
  docCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginHorizontal: 20,
    marginBottom: 11,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  accentBar: {
    width: 4,
    margin: 14,
    marginRight: 0,
    borderRadius: 3,
    minHeight: 55,
  },
  docIconTile: {
    width: 46,
    height: 46,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 14,
    marginLeft: 10,
    marginRight: 12,
    alignSelf: 'center',
  },
  docContent: {
    flex: 1,
    paddingTop: 13,
    paddingBottom: 13,
    paddingRight: 4,
  },
  docTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  urgentPill: { backgroundColor: '#FEE2E2' },
  generalPill: { backgroundColor: '#EFF6FF' },
  tagDot: { width: 5, height: 5, borderRadius: 3 },
  tagText: { fontSize: 9.5, fontWeight: '800', letterSpacing: 0.7 },
  docTime: { fontSize: 11 },
  docTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4, letterSpacing: -0.1 },
  docSummary: { fontSize: 12, lineHeight: 17 },
  cardChevron: { alignSelf: 'center', marginRight: 12 },

  // ── Skeleton ─────────────────────────────────────────────────────────────
  skeletonCard: {
    marginHorizontal: 20,
    marginBottom: 11,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 26 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0056b3',
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: '#0056b3',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // ── Footer ────────────────────────────────────────────────────────────────
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
    marginTop: 4,
  },
  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  footerText: { fontSize: 12 },
});
