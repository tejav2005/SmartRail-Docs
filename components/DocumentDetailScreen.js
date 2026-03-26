import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, SafeAreaView,
  TouchableOpacity, ActivityIndicator, Alert, Linking,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import { getDocumentById, API_BASE_URL } from '../services/api';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function InfoRow({ icon, label, value }) {
  const { theme } = useTheme();
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={16} color="#0056b3" />
      </View>
      <View style={styles.infoText}>
        <Text style={[styles.infoLabel, { color: theme.colors.subText }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.colors.text }]} numberOfLines={2}>{value || '—'}</Text>
      </View>
    </View>
  );
}

export default function DocumentDetailScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { documentId, document: passedDoc } = route.params ?? {};

  const [doc, setDoc] = useState(passedDoc || null);
  const [loading, setLoading] = useState(!passedDoc);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!passedDoc && documentId) {
      setLoading(true);
      getDocumentById(documentId)
        .then((res) => setDoc(res?.data))
        .catch((err) => setError(err.message || 'Failed to load document.'))
        .finally(() => setLoading(false));
    }
  }, [documentId, passedDoc]);

  const isUrgent = Array.isArray(doc?.tags) && doc.tags.includes('URGENT');

  const handleOpenFile = async () => {
    if (!doc?.fileUrl) {
      Alert.alert('Not available', 'This document has no downloadable file.');
      return;
    }
    // fileUrl from backend is "/uploads/<filename>"
    const serverBase = API_BASE_URL.replace('/api', '');
    const url = `${serverBase}${doc.fileUrl}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Cannot open', 'Could not open this file on your device.');
    }
  };

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
          <Text style={styles.headerTitle} numberOfLines={1}>Document Detail</Text>
          <Text style={styles.headerSub}>Full document information</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#0056b3" />
          <Text style={[styles.loadingText, { color: theme.colors.subText }]}>Loading document...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorWrap}>
          <Ionicons name="warning-outline" size={48} color="#EF4444" />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>Failed to load</Text>
          <Text style={[styles.errorSub, { color: theme.colors.subText }]}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : !doc ? null : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Title card */}
          <Animated.View entering={FadeInDown.delay(80).springify()}>
            <View style={[styles.titleCard, { backgroundColor: theme.colors.card }]}>
              <View style={styles.titleTop}>
                <View style={[
                  styles.tagBadge,
                  { backgroundColor: isUrgent ? '#FEE2E2' : '#EBF4FF' },
                ]}>
                  <Ionicons
                    name={isUrgent ? 'alert-circle' : 'document-text'}
                    size={12}
                    color={isUrgent ? '#EF4444' : '#0056b3'}
                  />
                  <Text style={[styles.tagText, { color: isUrgent ? '#EF4444' : '#0056b3' }]}>
                    {isUrgent ? 'URGENT' : 'GENERAL'}
                  </Text>
                </View>
                <Text style={[styles.categoryText, { color: theme.colors.muted }]}>
                  {doc.category?.toUpperCase() || 'GENERAL'}
                </Text>
              </View>
              <Text style={[styles.docTitle, { color: theme.colors.text }]}>{doc.title}</Text>
              {doc.description ? (
                <Text style={[styles.docDescription, { color: theme.colors.subText }]}>
                  {doc.description}
                </Text>
              ) : null}
            </View>
          </Animated.View>

          {/* Metadata */}
          <Animated.View entering={FadeInDown.delay(160).springify()}>
            <Text style={[styles.sectionLabel, { color: theme.colors.subText }]}>FILE DETAILS</Text>
            <View style={[styles.metaCard, { backgroundColor: theme.colors.card }]}>
              <InfoRow icon="attach-outline" label="File Name" value={doc.originalName} />
              <View style={[styles.metaDivider, { backgroundColor: theme.colors.border }]} />
              <InfoRow icon="server-outline" label="File Size" value={formatBytes(doc.size)} />
              <View style={[styles.metaDivider, { backgroundColor: theme.colors.border }]} />
              <InfoRow icon="person-outline" label="Uploaded By" value={doc.uploadedBy?.name || '—'} />
              <View style={[styles.metaDivider, { backgroundColor: theme.colors.border }]} />
              <InfoRow icon="time-outline" label="Uploaded On" value={formatDate(doc.createdAt)} />
            </View>
          </Animated.View>

          {/* AI Summary */}
          {doc.summary ? (
            <Animated.View entering={FadeInDown.delay(240).springify()}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionLabel, { color: theme.colors.subText, marginBottom: 0 }]}>AI SUMMARY</Text>
                <View style={styles.aiBadge}>
                  <Ionicons name="flash" size={11} color="#7C3AED" />
                  <Text style={styles.aiBadgeText}>AI Generated</Text>
                </View>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <LinearGradient
                  colors={['#4F46E5', '#7C3AED']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.summaryHeader}
                >
                  <Ionicons name="document-text" size={14} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.summaryHeaderText}>{doc.title}</Text>
                </LinearGradient>
                <Text style={[styles.summaryBody, { color: theme.colors.text }]}>{doc.summary}</Text>
              </View>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeIn.delay(240)}>
              <Text style={[styles.sectionLabel, { color: theme.colors.subText }]}>AI SUMMARY</Text>
              <View style={[styles.noSummaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Ionicons name="information-circle-outline" size={24} color={theme.colors.muted} />
                <Text style={[styles.noSummaryText, { color: theme.colors.subText }]}>
                  No summary available. Go to Upload Screen and use "Upload and Generate Summary" to create one.
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Open File button */}
          <Animated.View entering={FadeInDown.delay(320).springify()}>
            <TouchableOpacity style={styles.openFileBtn} onPress={handleOpenFile} activeOpacity={0.85}>
              <LinearGradient
                colors={['#0056b3', '#1976D2']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.openFileBtnGradient}
              >
                <Ionicons name="cloud-download-outline" size={20} color="#fff" />
                <Text style={styles.openFileBtnText}>Open / Download File</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
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
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 },

  scrollContent: { padding: 20 },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
  loadingText: { fontSize: 14 },
  errorWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 20 },
  errorTitle: { fontSize: 20, fontWeight: '700' },
  errorSub: { fontSize: 14, textAlign: 'center' },
  retryBtn: { marginTop: 10, backgroundColor: '#0056b3', paddingHorizontal: 24, paddingVertical: 11, borderRadius: 12 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  titleCard: {
    borderRadius: 18, padding: 18, marginBottom: 22,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 4,
  },
  titleTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  tagBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  categoryText: { fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  docTitle: { fontSize: 20, fontWeight: '800', lineHeight: 27, marginBottom: 8 },
  docDescription: { fontSize: 13, lineHeight: 20 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    marginBottom: 10, textTransform: 'uppercase',
  },
  sectionHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 10, marginTop: 4,
  },
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EDE9FE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  aiBadgeText: { fontSize: 11, fontWeight: '700', color: '#7C3AED' },

  metaCard: {
    borderRadius: 18, marginBottom: 22,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    overflow: 'hidden',
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  infoIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center',
  },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: '600', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 14, fontWeight: '500' },
  metaDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 14 },

  summaryCard: {
    borderRadius: 18, borderWidth: 1, overflow: 'hidden', marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  summaryHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  summaryHeaderText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600', flex: 1 },
  summaryBody: { padding: 18, fontSize: 14, lineHeight: 22 },

  noSummaryCard: {
    borderRadius: 18, borderWidth: 1, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20,
  },
  noSummaryText: { flex: 1, fontSize: 13, lineHeight: 20 },

  openFileBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 4 },
  openFileBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 54, gap: 10,
  },
  openFileBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
