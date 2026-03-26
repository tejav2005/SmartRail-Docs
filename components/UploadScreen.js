import React, { useCallback, useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, SafeAreaView, Pressable, Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
  FadeIn,
  ZoomIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import { uploadDocument, summarizeDocument } from '../services/api';

function getFileIcon(name = '') {
  if (name.endsWith('.pdf')) return { icon: 'document-text', color: '#EF4444', bg: '#FEE2E2' };
  if (name.match(/\.(doc|docx)$/i)) return { icon: 'document', color: '#2563eb', bg: '#EFF6FF' };
  if (name.match(/\.(jpg|jpeg|png|gif)$/i)) return { icon: 'image', color: '#7C3AED', bg: '#EDE9FE' };
  return { icon: 'attach', color: '#0891b2', bg: '#E0F2FE' };
}

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function PressButton({ onPress, style, children, disabled }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPressIn={() => { if (!disabled) scale.value = withSpring(0.96, { damping: 14 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
        onPress={disabled ? undefined : onPress}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

function buildUploadFormData(file) {
  const formData = new FormData();

  if (Platform.OS === 'web' && file.file instanceof File) {
    // Expo Web: DocumentPicker returns a real browser File object in asset.file
    formData.append('file', file.file, file.name);
  } else {
    // React Native (iOS / Android): use uri-based object that RN fetch understands
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'application/octet-stream',
    });
  }

  formData.append('title', file.name);
  return formData;
}

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
    .replace(/^\s*here'?s\s+the\s+summary(?:\s+of\s+the\s+kmrl\s+operational\s+document)?\s*:\s*/i, '')
    .replace(/^\s*summary:\s*/i, '')
    .trim();
}

function ProgressCard({ progress, statusText, theme }) {
  return (
    <Animated.View entering={FadeInDown.delay(120).springify()}>
      <View style={[styles.progressCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.progressHeader}>
          <View style={styles.progressIconWrap}>
            <Ionicons name="cloud-upload-outline" size={18} color="#0056b3" />
          </View>
          <View style={styles.progressTextWrap}>
            <Text style={[styles.progressTitle, { color: theme.colors.text }]}>Processing document</Text>
            <Text style={[styles.progressSubtitle, { color: theme.colors.subText }]}>{statusText}</Text>
          </View>
          <Text style={styles.progressPercent}>{`${progress}%`}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>
    </Animated.View>
  );
}

export default function UploadScreen({ navigation }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const cleanSummary = getCleanSummary(summary);

  const resetUploadState = useCallback(() => {
    setSelectedFile(null);
    setSummary('');
    setIsGenerating(false);
    setUploadProgress(0);
    setStatusText('');
  }, []);

  useFocusEffect(
    useCallback(() => () => {
      resetUploadState();
    }, [resetUploadState])
  );

  const handleBack = () => {
    resetUploadState();
    navigation.navigate('HomeStack');
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'image/*',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets?.[0]) {
        setSelectedFile(result.assets[0]);
        setSummary('');
        setUploadProgress(0);
        setStatusText('');
      }
    } catch {
      Alert.alert(t('error'), t('failedToPickDocument'));
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      Alert.alert(t('noFileSelected'), t('selectDocumentFirst'));
      return;
    }

    setIsGenerating(true);
    setSummary('');
    setUploadProgress(10);
    setStatusText(t('preparingUpload'));

    try {
      const formData = buildUploadFormData(selectedFile);

      setUploadProgress(35);
      setStatusText(t('uploadingDocument'));
      const uploadRes = await uploadDocument(formData);

      const documentId = uploadRes?.data?._id;
      if (!documentId) {
        throw new Error('Upload completed, but no document ID was returned.');
      }

      setUploadProgress(72);
      setStatusText(t('generatingAiSummary'));
      const summaryRes = await summarizeDocument(documentId);

      setUploadProgress(100);
      setStatusText(t('summaryReady'));
      const generatedSummary = summaryRes?.data?.summary || 'Summary generated successfully.';
      setSummary(generatedSummary);

      // Navigate to Home so the new doc shows in Recent Documents
      Alert.alert(
        '✅ Upload Successful',
        t('uploadSuccessMessage'),
        [{
          text: t('viewDocuments'),
          onPress: () => {
            resetUploadState();
            navigation.navigate('HomeStack', { screen: 'AllDocs' });
          },
        }]
      );
    } catch (err) {
      setUploadProgress(0);
      setStatusText('');
      Alert.alert(t('error'), err.message || t('failedToLoadDocuments'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!cleanSummary) return;

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
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Export Summary PDF' });
      } else {
        Alert.alert(t('exported'), t('pdfSavedToDevice'));
      }
    } catch {
      Alert.alert(t('exportFailed'), t('couldNotCreatePdf'));
    }
  };

  const fileInfo = selectedFile ? getFileIcon(selectedFile.name) : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={['#001A47', '#003580', '#0056b3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.decor1} />
        <View style={styles.decor2} />
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('uploadTitle')}</Text>
          <Text style={styles.headerSub}>{t('uploadSub')}</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <Text style={[styles.sectionLabel, { color: theme.colors.subText }]}>{t('selectFile')}</Text>

          {!selectedFile ? (
            <PressButton
              onPress={handleFilePick}
              style={[styles.dropZone, { borderColor: '#0056b3', backgroundColor: theme.colors.card }]}
            >
              <View style={styles.dropZoneInner}>
                <LinearGradient colors={['#EFF6FF', '#DBEAFE']} style={styles.dropIconWrap}>
                  <Ionicons name="cloud-upload-outline" size={38} color="#2563eb" />
                </LinearGradient>
                <Text style={[styles.dropTitle, { color: theme.colors.text }]}>{t('tapToSelectFile')}</Text>
                <Text style={[styles.dropSub, { color: theme.colors.muted }]}>{t('supportedFileTypes')}</Text>
                <View style={styles.dropTypeRow}>
                  {['PDF', 'DOCX', 'JPG', 'PNG'].map((type) => (
                    <View key={type} style={styles.typeChip}>
                      <Text style={styles.typeChipText}>{type}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </PressButton>
          ) : (
            <Animated.View entering={ZoomIn.duration(280).springify()}>
              <View style={[styles.fileCard, { backgroundColor: theme.colors.card, borderColor: `${fileInfo.color}40` }]}>
                <View style={[styles.fileAccent, { backgroundColor: fileInfo.color }]} />
                <View style={[styles.fileIconWrap, { backgroundColor: fileInfo.bg }]}>
                  <Ionicons name={fileInfo.icon} size={28} color={fileInfo.color} />
                </View>

                <View style={styles.fileDetails}>
                  <Text style={[styles.fileName, { color: theme.colors.text }]} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <View style={styles.fileMetaRow}>
                    <View style={[styles.fileSizeChip, { backgroundColor: theme.colors.background }]}>
                      <Ionicons name="server-outline" size={11} color={theme.colors.muted} />
                      <Text style={[styles.fileSizeText, { color: theme.colors.subText }]}>
                        {formatBytes(selectedFile.size)}
                      </Text>
                    </View>
                    <View style={[styles.fileTypeChip, { backgroundColor: fileInfo.bg }]}>
                      <Text style={[styles.fileTypeText, { color: fileInfo.color }]}>
                        {selectedFile.name.split('.').pop().toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity onPress={handleFilePick} style={styles.changeBtn} activeOpacity={0.7}>
                  <Ionicons name="swap-horizontal" size={16} color="#0056b3" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).springify()}>
          <PressButton
            onPress={handleGenerate}
            disabled={isGenerating || !selectedFile}
            style={[
              styles.generateBtn,
              (!selectedFile || isGenerating) && styles.generateBtnDisabled,
            ]}
          >
            <LinearGradient
              colors={!selectedFile || isGenerating ? ['#9CA3AF', '#9CA3AF'] : ['#0056b3', '#1976D2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.generateBtnGradient}
            >
              {isGenerating ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.generateBtnText}>{t('uploadingAndSummarizing')}</Text>
                </>
              ) : (
                <>
                  <Ionicons name="flash" size={19} color="#fff" />
                  <Text style={styles.generateBtnText}>{t('uploadAndGenerateSummary')}</Text>
                </>
              )}
            </LinearGradient>
          </PressButton>
        </Animated.View>

        {isGenerating ? (
          <ProgressCard progress={uploadProgress} statusText={statusText} theme={theme} />
        ) : null}

        {(summary || isGenerating) && (
          <Animated.View entering={FadeInDown.delay(60).springify()}>
            <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionLabel, { color: theme.colors.subText, marginBottom: 0 }]}>{t('aiSummary')}</Text>
              <View style={styles.aiBadge}>
                <Ionicons name="flash" size={11} color="#7C3AED" />
                <Text style={styles.aiBadgeText}>{t('aiGenerated')}</Text>
              </View>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              {isGenerating ? (
                <View style={styles.summaryLoadingWrap}>
                  <ActivityIndicator color="#7C3AED" size="large" />
                  <Text style={[styles.summaryLoadingText, { color: theme.colors.subText }]}>
                    {statusText || t('workingOnDocument')}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.summaryText, { color: theme.colors.text }]}>
                  {cleanSummary}
                </Text>
              )}
            </View>

            {cleanSummary ? (
              <Animated.View entering={FadeIn.delay(200)}>
                <PressButton onPress={handleExport} style={styles.exportBtn}>
                  <View style={styles.exportBtnInner}>
                    <View style={styles.exportIconWrap}>
                      <Ionicons name="download-outline" size={20} color="#0056b3" />
                    </View>
                    <View style={styles.exportTextWrap}>
                      <Text style={[styles.exportTitle, { color: theme.colors.text }]}>{t('exportAsPdf')}</Text>
                      <Text style={[styles.exportSub, { color: theme.colors.subText }]}>
                        {t('shareSaveSummaryReport')}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
                  </View>
                </PressButton>
              </Animated.View>
            ) : null}
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  decor1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: -50,
    right: -30,
  },
  decor2: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -20,
    left: 60,
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
  scrollContent: { padding: 20, paddingTop: 22 },
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
  dropZone: {
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 16,
    overflow: 'hidden',
  },
  dropZoneInner: { alignItems: 'center', padding: 36 },
  dropIconWrap: {
    width: 82,
    height: 82,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  dropTitle: { fontSize: 17, fontWeight: '700', marginBottom: 5 },
  dropSub: { fontSize: 13, marginBottom: 16 },
  dropTypeRow: { flexDirection: 'row', gap: 8 },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  typeChipText: { fontSize: 11, fontWeight: '700', color: '#2563eb' },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 4,
  },
  fileAccent: { width: 4, alignSelf: 'stretch', borderRadius: 2, margin: 14, marginRight: 0 },
  fileIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 14,
    marginLeft: 10,
    marginRight: 12,
  },
  fileDetails: { flex: 1, paddingVertical: 16 },
  fileName: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  fileMetaRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  fileSizeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fileSizeText: { fontSize: 11 },
  fileTypeChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  fileTypeText: { fontSize: 11, fontWeight: '800' },
  changeBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  generateBtn: { marginBottom: 18, borderRadius: 16, overflow: 'hidden' },
  generateBtnDisabled: { opacity: 0.65 },
  generateBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    gap: 10,
    borderRadius: 16,
  },
  generateBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  progressCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  progressIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  progressTextWrap: { flex: 1 },
  progressTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  progressSubtitle: { fontSize: 12 },
  progressPercent: { fontSize: 16, fontWeight: '800', color: '#0056b3' },
  progressTrack: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0056b3',
    borderRadius: 999,
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
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  summaryLoadingWrap: { alignItems: 'center', padding: 36, gap: 14 },
  summaryLoadingText: { fontSize: 14, fontWeight: '500', textAlign: 'center' },
  summaryText: {
    padding: 18,
    fontSize: 13.5,
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  exportBtn: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 4,
  },
  exportBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0,86,179,0.15)',
    padding: 16,
    gap: 14,
  },
  exportIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  exportTextWrap: { flex: 1 },
  exportTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  exportSub: { fontSize: 12 },
});
