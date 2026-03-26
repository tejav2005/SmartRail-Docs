import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView,
  ActivityIndicator, RefreshControl, Alert, Modal, TextInput,
  KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import { getMeetings, createMeeting, getUsers } from '../services/api';

// Card color cycle for variety
const COLORS = [
  { color: '#0056b3', bg: '#EBF4FF', icon: 'videocam-outline' },
  { color: '#22C55E', bg: '#DCFCE7', icon: 'location-outline' },
  { color: '#F59E0B', bg: '#FEF3C7', icon: 'business-outline' },
  { color: '#7C3AED', bg: '#EDE9FE', icon: 'people-outline' },
  { color: '#EF4444', bg: '#FEE2E2', icon: 'alert-circle-outline' },
];

function formatMeetingTime(isoString) {
  if (!isoString) return { time: '00:00', period: 'AM' };
  const d = new Date(isoString);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return { time: `${String(h).padStart(2, '0')}:${m}`, period };
}

function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function MeetingScreen({ navigation }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Create meeting form state
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  // Helper: get tomorrow in YYYY-MM-DD
  const tomorrowStr = () => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  };

  const [form, setForm] = useState({
    title: '', location: '', mode: 'in-person',
    startDate: tomorrowStr(), startHour: '09:00',
    endDate: tomorrowStr(), endHour: '10:00',
  });
  const [allUsers, setAllUsers] = useState([]);
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const resetForm = () => {
    setForm({
      title: '', location: '', mode: 'in-person',
      startDate: tomorrowStr(), startHour: '09:00',
      endDate: tomorrowStr(), endHour: '10:00',
    });
    setSelectedAttendees([]);
    setAttendeeSearch('');
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await getUsers();
      setAllUsers(res?.data ?? []);
    } catch { /* silently ignore */ } finally {
      setUsersLoading(false);
    }
  };

  const fetchMeetings = useCallback(async () => {
    try {
      const res = await getMeetings();
      setMeetings(res.data || []);
    } catch (err) {
      Alert.alert(t('error'), err.message || t('failedToLoadMeetings'));
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMeetings();
  };

  // Build a safe ISO string from YYYY-MM-DD and HH:MM parts
  const buildISO = (date, hour) => {
    const clean = `${date.trim()}T${hour.trim()}:00`;
    const d = new Date(clean);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  };

  const handleCreate = async () => {
    if (!form.title.trim()) {
      Alert.alert(t('validation'), t('meetingTitleRequired'));
      return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!dateRegex.test(form.startDate.trim()) || !timeRegex.test(form.startHour.trim())) {
      Alert.alert(t('validation'), t('meetingStartValidation'));
      return;
    }
    if (!dateRegex.test(form.endDate.trim()) || !timeRegex.test(form.endHour.trim())) {
      Alert.alert(t('validation'), t('meetingEndValidation'));
      return;
    }
    const startISO = buildISO(form.startDate, form.startHour);
    const endISO   = buildISO(form.endDate,   form.endHour);
    if (!startISO || !endISO) {
      Alert.alert(t('validation'), t('meetingInvalidDateTime'));
      return;
    }
    if (new Date(endISO) <= new Date(startISO)) {
      Alert.alert(t('validation'), t('meetingEndAfterStart'));
      return;
    }
    setSaving(true);
    try {
      await createMeeting({
        title: form.title.trim(),
        location: form.location.trim(),
        mode: form.mode,
        startTime: startISO,
        endTime: endISO,
        attendees: selectedAttendees,
      });
      setShowForm(false);
      resetForm();
      fetchMeetings();
    } catch (err) {
      Alert.alert(t('error'), err.message || t('failedToCreateMeeting'));
    } finally {
      setSaving(false);
    }
  };

  const goToHome = () => navigation.navigate('MainTabs', { screen: 'HomeStack' });

  const MODES = ['in-person', 'virtual', 'hybrid'];

  // Group meetings by date
  const grouped = meetings.reduce((acc, m) => {
    const dateKey = m.startTime ? new Date(m.startTime).toDateString() : 'Unknown';
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(m);
    return acc;
  }, {});

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToHome} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('meetings')}</Text>
        <View style={{ width: 38 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#0056b3" />
          <Text style={[styles.loadingText, { color: theme.colors.subText }]}>
            {t('loadingMeetings')}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0056b3" />
          }
        >

          {meetings.length === 0 ? (
            <Animated.View entering={FadeIn} style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={56} color="#CBD5E1" />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>{t('noMeetingsScheduled')}</Text>
              <Text style={[styles.emptySub, { color: theme.colors.subText }]}>
                {t('noMeetingsScreenSubtitle')}
              </Text>
            </Animated.View>
          ) : (
            Object.entries(grouped).map(([dateKey, dayMeetings]) => (
              <View key={dateKey}>
                {/* Date badge */}
                <View style={styles.dateBadgeRow}>
                  <View style={[styles.dateBadge, { backgroundColor: theme.colors.card }]}>
                    <Ionicons name="calendar" size={14} color="#0056b3" />
                    <Text style={styles.dateBadgeText}>{formatDate(dayMeetings[0]?.startTime)}</Text>
                  </View>
                  <View style={[styles.countBadge, { backgroundColor: '#EBF4FF' }]}>
                    <Text style={styles.countBadgeText}>{t('meetingsCount', dayMeetings.length)}</Text>
                  </View>
                </View>

                {/* Timeline */}
                {dayMeetings.map((item, index) => {
                  const palette = COLORS[index % COLORS.length];
                  const { time, period } = formatMeetingTime(item.startTime);
                  const modeIcon = item.mode === 'virtual' ? 'videocam-outline' : item.mode === 'hybrid' ? 'git-merge-outline' : 'business-outline';

                  return (
                    <Animated.View
                      key={item._id}
                      entering={FadeInDown.delay(index * 100).springify()}
                    >
                      <View style={styles.timelineRow}>
                        {/* Left timeline */}
                        <View style={styles.timelineLeft}>
                          <View style={[styles.timelineDot, { backgroundColor: palette.color }]} />
                          {index < dayMeetings.length - 1 && (
                            <View style={[styles.timelineLine, { backgroundColor: theme.colors.border }]} />
                          )}
                        </View>

                        {/* Card */}
                        <TouchableOpacity
                          activeOpacity={0.85}
                          style={[styles.card, { backgroundColor: theme.colors.card }]}
                        >
                          {/* Time pill */}
                          <View style={[styles.timePill, { backgroundColor: palette.bg }]}>
                            <Text style={[styles.timePillText, { color: palette.color }]}>{time}</Text>
                            <Text style={[styles.timePillPeriod, { color: palette.color }]}>{period}</Text>
                          </View>

                          {/* Title */}
                          <Text style={[styles.meetingTitle, { color: theme.colors.text }]}>{item.title}</Text>

                          {/* Info */}
                          {item.location ? (
                            <View style={styles.infoRow}>
                              <Ionicons name={modeIcon} size={14} color={theme.colors.muted} />
                              <Text style={[styles.infoText, { color: theme.colors.subText }]}>{item.location}</Text>
                            </View>
                          ) : null}

                          {Array.isArray(item.attendees) && item.attendees.length > 0 && (
                            <View style={styles.infoRow}>
                              <Ionicons name="people-outline" size={14} color={theme.colors.muted} />
                              <Text style={[styles.infoText, { color: theme.colors.subText }]}>
                                {item.attendees.map(a => a.name || a).join(', ')}
                              </Text>
                            </View>
                          )}

                          {/* Status chip */}
                          <View style={[styles.statusChip, {
                            backgroundColor: item.status === 'cancelled' ? '#FEE2E2'
                              : item.status === 'completed' ? '#DCFCE7' : palette.bg,
                          }]}>
                            <Text style={[styles.statusChipText, {
                              color: item.status === 'cancelled' ? '#DC2626'
                                : item.status === 'completed' ? '#16A34A' : palette.color,
                            }]}>
                              {(item.status || 'scheduled').toUpperCase()}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
                  );
                })}
              </View>
            ))
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* ── FAB: Create Meeting ───────────────────────────── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => { setShowForm(true); loadUsers(); }}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* ── Create Meeting Modal ──────────────────────────── */}
      <Modal
        animationType="slide"
        transparent
        visible={showForm}
        onRequestClose={() => { setShowForm(false); resetForm(); }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => { setShowForm(false); resetForm(); }}
        >
          <Pressable>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <View style={[styles.modalSheet, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.modalHandle, { backgroundColor: theme.colors.border }]} />
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('scheduleMeeting')}</Text>

                <Text style={[styles.fieldLabel, { color: theme.colors.subText }]}>{t('meetingTitle')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                  placeholder={t('meetingTitlePlaceholder')}
                  placeholderTextColor={theme.colors.muted}
                  value={form.title}
                  onChangeText={(v) => setForm(f => ({ ...f, title: v }))}
                />

                <Text style={[styles.fieldLabel, { color: theme.colors.subText }]}>{t('meetingLocation')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                  placeholder={t('meetingLocationPlaceholder')}
                  placeholderTextColor={theme.colors.muted}
                  value={form.location}
                  onChangeText={(v) => setForm(f => ({ ...f, location: v }))}
                />

                <Text style={[styles.fieldLabel, { color: theme.colors.subText }]}>{t('startTime')}</Text>
                <View style={styles.dateTimeRow}>
                  <TextInput
                    style={[styles.input, styles.dateInput, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                    placeholder={t('meetingDatePlaceholder')}
                    placeholderTextColor={theme.colors.muted}
                    value={form.startDate}
                    onChangeText={(v) => setForm(f => ({ ...f, startDate: v }))}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                  <TextInput
                    style={[styles.input, styles.timeInput, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                    placeholder={t('meetingTimePlaceholder')}
                    placeholderTextColor={theme.colors.muted}
                    value={form.startHour}
                    onChangeText={(v) => setForm(f => ({ ...f, startHour: v }))}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>

                <Text style={[styles.fieldLabel, { color: theme.colors.subText }]}>{t('endTime')}</Text>
                <View style={styles.dateTimeRow}>
                  <TextInput
                    style={[styles.input, styles.dateInput, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                    placeholder={t('meetingDatePlaceholder')}
                    placeholderTextColor={theme.colors.muted}
                    value={form.endDate}
                    onChangeText={(v) => setForm(f => ({ ...f, endDate: v }))}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                  <TextInput
                    style={[styles.input, styles.timeInput, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                    placeholder={t('meetingTimePlaceholder')}
                    placeholderTextColor={theme.colors.muted}
                    value={form.endHour}
                    onChangeText={(v) => setForm(f => ({ ...f, endHour: v }))}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>

                <Text style={[styles.fieldLabel, { color: theme.colors.subText }]}>{t('mode')}</Text>
                <View style={styles.modeRow}>
                  {MODES.map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.modeChip,
                        { borderColor: form.mode === m ? '#0056b3' : theme.colors.border },
                        form.mode === m && { backgroundColor: '#EBF4FF' },
                      ]}
                      onPress={() => setForm(f => ({ ...f, mode: m }))}
                    >
                      <Text style={[styles.modeChipText, { color: form.mode === m ? '#0056b3' : theme.colors.muted }]}>
                        {t(m)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Attendees */}
                <Text style={[styles.fieldLabel, { color: theme.colors.subText }]}>
                  {t('attendees')} {selectedAttendees.length > 0 ? `(${selectedAttendees.length} ${t('selected')})` : ''}
                </Text>
                <View style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, paddingHorizontal: 10, paddingVertical: 6 }]}>
                  <View style={styles.attendeeSearchRow}>
                    <Ionicons name="search-outline" size={14} color={theme.colors.muted} />
                    <TextInput
                      style={[styles.attendeeSearchInput, { color: theme.colors.text }]}
                      placeholder={t('searchStaff')}
                      placeholderTextColor={theme.colors.muted}
                      value={attendeeSearch}
                      onChangeText={setAttendeeSearch}
                    />
                  </View>
                  {usersLoading ? (
                    <ActivityIndicator size="small" color="#0056b3" style={{ marginVertical: 8 }} />
                  ) : (
                    allUsers
                      .filter(u => {
                        const q = attendeeSearch.toLowerCase();
                        return !q || u.name.toLowerCase().includes(q) || u.employeeId?.toLowerCase().includes(q);
                      })
                      .slice(0, 8)
                      .map(u => {
                        const selected = selectedAttendees.includes(u._id);
                        return (
                          <TouchableOpacity
                            key={u._id}
                            style={[styles.attendeeRow, selected && { backgroundColor: '#EBF4FF' }]}
                            onPress={() => setSelectedAttendees(prev =>
                              selected ? prev.filter(id => id !== u._id) : [...prev, u._id]
                            )}
                          >
                            <View style={[styles.attendeeAvatar, { backgroundColor: selected ? '#0056b3' : '#CBD5E1' }]}>
                              <Text style={styles.attendeeAvatarText}>{u.name.charAt(0).toUpperCase()}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.attendeeName, { color: theme.colors.text }]}>{u.name}</Text>
                              <Text style={[styles.attendeeDept, { color: theme.colors.muted }]}>{u.department || u.employeeId}</Text>
                            </View>
                            {selected && <Ionicons name="checkmark-circle" size={18} color="#0056b3" />}
                          </TouchableOpacity>
                        );
                      })
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, saving && { opacity: 0.7 }]}
                  onPress={handleCreate}
                  disabled={saving}
                >
                  {saving
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.submitBtnText}>{t('scheduleMeetingBtn')}</Text>
                  }
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Pressable>
        </Pressable>
      </Modal>
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
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: '#fff' },
  scrollContent: { padding: 20, paddingBottom: 40 },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { fontSize: 14 },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '800' },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 30 },

  dateBadgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 8, gap: 10 },
  dateBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  dateBadgeText: { fontSize: 13, fontWeight: '600', color: '#0056b3' },
  countBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  countBadgeText: { fontSize: 12, fontWeight: '700', color: '#0056b3' },

  // Timeline
  timelineRow: { flexDirection: 'row', marginBottom: 16 },
  timelineLeft: { width: 22, alignItems: 'center', paddingTop: 18 },
  timelineDot: { width: 12, height: 12, borderRadius: 6 },
  timelineLine: { width: 2, flex: 1, marginTop: 6 },

  card: {
    flex: 1, borderRadius: 18, padding: 18, marginLeft: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 4,
  },
  timePill: {
    flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'baseline',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, marginBottom: 12, gap: 4,
  },
  timePillText: { fontSize: 18, fontWeight: '800' },
  timePillPeriod: { fontSize: 12, fontWeight: '700' },
  meetingTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  infoText: { fontSize: 13, flex: 1 },
  statusChip: {
    alignSelf: 'flex-start', marginTop: 10,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  statusChipText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  // FAB
  fab: {
    position: 'absolute', bottom: 28, right: 22,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#0056b3',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#0056b3', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 10,
  },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 36,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, marginBottom: 4,
  },
  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 16, marginTop: 4 },
  modeChip: {
    flex: 1, paddingVertical: 9, borderRadius: 10,
    borderWidth: 1.5, alignItems: 'center',
  },
  modeChipText: { fontSize: 13, fontWeight: '700' },
  submitBtn: {
    backgroundColor: '#0056b3', borderRadius: 14,
    paddingVertical: 15, alignItems: 'center', marginTop: 8,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Attendee picker
  attendeeSearchRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  attendeeSearchInput: { flex: 1, fontSize: 13, paddingVertical: 2 },
  attendeeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, paddingHorizontal: 4, borderRadius: 10,
  },
  attendeeAvatar: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  attendeeAvatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  attendeeName: { fontSize: 13, fontWeight: '600' },
  attendeeDept: { fontSize: 11, marginTop: 1 },

  // Date + time split row
  dateTimeRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  dateInput: { flex: 2 },
  timeInput: { flex: 1 },
});
