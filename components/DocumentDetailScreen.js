import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, SafeAreaView,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import { getDocumentById } from '../services/api';

function escapeHtml(text = '') {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getCleanSummary(text = '') {
  return text
    .replace(/^\s*here'?s\s+the\s+summary:\s*/i, '')
    .replace(/^\s*summary:\s*/i, '')
    .trim();
}

export default function DocumentDetailScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { documentId, document: passedDoc } = route.params ?? {};

  const [doc, setDoc] = useState(passedDoc || null);
  const [loading, setLoading] = useState(!passedDoc);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!passedDoc && documentId) {
      setLoading(true);
      getDocumentById(documentId)
        .then((res) => setDoc(res?.data))
        .catch((err) => setError(err.message || t('failedToLoadDocuments')))
        .finally(() => setLoading(false));
    }
  }, [documentId, passedDoc, t]);

  const cleanSummary = getCleanSummary(doc?.summary || '');

  const handleExportSummary = async () => {
    if (!cleanSummary) {
      Alert.alert(t('notAvailable'), t('noSummaryAvailable'));
      return;
    }

    try {
      const summaryHtml = escapeHtml(cleanSummary).replace(/\n/g, '<br />');
      const html = `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 32px; color: #111827; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">
            ${summaryHtml}
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: t('exportSummaryPdf') });
      } else {
        Alert.alert(t('exported'), t('pdfSavedToDevice'));
      }
    } catch {
      Alert.alert(t('exportFailed'), t('couldNotCreatePdf'));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={['#001A47', '#003580', '#0056b3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerBlob} />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{t('aiSummaryTitle')}</Text>
          <Text style={styles.headerSub}>{t('summaryContentOnly')}</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#0056b3" />
          <Text style={[styles.loadingText, { color: theme.colors.subText }]}>{t('loadingSummary')}</Text>
        </View>
      ) : error ? (
        <View style={styles.errorWrap}>
          <Ionicons name="warning-outline" size={48} color="#EF4444" />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>{t('error')}</Text>
          <Text style={[styles.errorSub, { color: theme.colors.subText }]}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.retryText}>{t('back')}</Text>
          </TouchableOpacity>
        </View>
      ) : !doc ? null : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {cleanSummary ? (
            <Animated.View entering={FadeInDown.delay(80).springify()}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionLabel, { color: theme.colors.subText, marginBottom: 0 }]}>{t('aiSummary')}</Text>
                <View style={styles.aiBadge}>
                  <Ionicons name="flash" size={11} color="#7C3AED" />
                  <Text style={styles.aiBadgeText}>{t('aiGenerated')}</Text>
                </View>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.summaryBody, { color: theme.colors.text }]}>{cleanSummary}</Text>
              </View>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeIn.delay(80)}>
              <Text style={[styles.sectionLabel, { color: theme.colors.subText }]}>{t('aiSummary')}</Text>
              <View style={[styles.noSummaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Ionicons name="information-circle-outline" size={24} color={theme.colors.muted} />
                <Text style={[styles.noSummaryText, { color: theme.colors.subText }]}>
                  {t('noSummaryAvailable')}
                </Text>
              </View>
            </Animated.View>
          )}

          {cleanSummary ? (
            <Animated.View entering={FadeInDown.delay(160).springify()}>
              <TouchableOpacity
                style={styles.openFileBtn}
                onPress={handleExportSummary}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#0056b3', '#1976D2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.openFileBtnGradient}
                >
                  <Ionicons name="document-text-outline" size={20} color="#fff" />
                  <Text style={styles.openFileBtnText}>{t('exportSummaryPdf')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ) : null}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 44,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerBlob: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: -50,
    right: -30,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
  retryBtn: {
    marginTop: 10,
    backgroundColor: '#0056b3',
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 12,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  aiBadgeText: { fontSize: 11, fontWeight: '700', color: '#7C3AED' },
  summaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  summaryBody: { padding: 18, fontSize: 14, lineHeight: 22 },
  noSummaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  noSummaryText: { flex: 1, fontSize: 13, lineHeight: 20 },
  openFileBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 4 },
  openFileBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    gap: 10,
  },
  openFileBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
