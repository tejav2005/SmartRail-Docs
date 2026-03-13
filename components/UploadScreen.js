import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from './ThemeContext';

export default function UploadScreen({ navigation }) {
  const { theme } = useTheme();

  // FUNCTION: Navigate to Home Page
  const goToHome = () => {
    navigation.navigate('MainTabs', { screen: 'HomeStack' });
  };

  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      if (result.canceled === false) {
        setSelectedFile(result.assets[0]);
        Alert.alert('File Selected', result.assets[0].name);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleGenerate = () => {
    if (!selectedFile) { Alert.alert('No File', 'Please select a document first.'); return; }
    setIsGenerating(true);
    setTimeout(() => {
      const dummySummary = `SUMMARY: ${selectedFile.name}\n\nDATE: ${new Date().toLocaleDateString()}\nSOURCE: Local Upload\n\nKEY POINTS:\n• Document successfully analyzed.\n• Priority levels assessed based on content.\n• Relevant keywords extracted: "Maintenance", "Urgent", "Safety".\n\nFULL SUMMARY:\nThis document outlines the necessary protocol for handling station maintenance. It highlights the importance of timely response to signal failures and outlines the specific engineering teams responsible for different zones.\n\nPriority: HIGH`;
      setSummary(dummySummary);
      setIsGenerating(false);
    }, 1500);
  };

  const handleDownloadPDF = async () => {
    if (!summary) return;
    try {
      const html = `<html style="font-family: sans-serif; padding: 20px;"><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body><h1 style="color: #0056b3;">KMRL Summary</h1><p style="color: #666; font-size: 12px;">File: ${selectedFile ? selectedFile.name : 'Unknown'}</p><hr style="border: 0; border-top: 1px solid #eee; margin: 10px 0;"><div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${summary}</div></body></html>`;
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Save Summary PDF' });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create PDF');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* UPDATED HEADER: Back Arrow + Title + Download */}
      <View style={[styles.customHeader, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={goToHome} style={styles.headerLeft}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Upload Document</Text>
        {summary ? (
          <TouchableOpacity onPress={handleDownloadPDF} style={styles.headerRight}>
            <Ionicons name="download-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.instructionText, { color: theme.colors.text }]}>Select a file to begin summarization</Text>
        
        <TouchableOpacity style={[styles.uploadArea, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} onPress={handleFilePick}>
          {selectedFile ? (
            <View style={styles.fileInfoContainer}>
              <Ionicons name="document-text-outline" size={40} color="#0056b3" />
              <Text style={[styles.fileName, { color: theme.colors.text }]} numberOfLines={1}>{selectedFile.name}</Text>
              <Text style={styles.fileSize}>{(selectedFile.size / 1024).toFixed(1)} KB</Text>
              <TouchableOpacity style={styles.changeFileBtn}>
                <Text style={styles.changeFileText}>Change File</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="cloud-upload-outline" size={50} color="#aaa" />
              <Text style={styles.uploadText}>Tap to Select File</Text>
              <Text style={styles.subText}>PDF, Word, Images</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.summaryBox}>
          <Text style={[styles.label, { color: theme.colors.text }]}>AI Summary:</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
            multiline numberOfLines={8} placeholder="Summary will appear here..." placeholderTextColor="#aaa" value={summary} editable={false}
          />
          <TouchableOpacity style={[styles.actionBtn, isGenerating && styles.disabledBtn]} onPress={handleGenerate} disabled={isGenerating}>
            {isGenerating ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Generate Summary</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  customHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, paddingTop: 40, elevation: 2 },
  headerLeft: { padding: 5, marginRight: 10 }, // Back button style
  headerRight: { padding: 5 }, // Download button style
  headerTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  scrollContent: { padding: 20 },
  instructionText: { fontSize: 14, marginBottom: 15 },
  uploadArea: { borderRadius: 15, height: 180, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', marginBottom: 25, overflow: 'hidden' },
  emptyState: { alignItems: 'center' },
  uploadText: { fontSize: 16, fontWeight: '600', color: '#555', marginTop: 10 },
  subText: { fontSize: 12, color: '#999' },
  fileInfoContainer: { alignItems: 'center', width: '100%' },
  fileName: { fontSize: 16, fontWeight: 'bold', marginTop: 10, paddingHorizontal: 20, textAlign: 'center' },
  fileSize: { fontSize: 12, color: '#888', marginTop: 5, marginBottom: 10 },
  changeFileBtn: { backgroundColor: '#f0f0f0', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 15 },
  changeFileText: { color: '#555', fontSize: 12, fontWeight: '600' },
  summaryBox: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  textArea: { borderRadius: 10, padding: 15, textAlignVertical: 'top', fontSize: 14, borderWidth: 1, marginBottom: 15, minHeight: 150 },
  actionBtn: { backgroundColor: '#0056b3', padding: 15, borderRadius: 10, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#ccc' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});