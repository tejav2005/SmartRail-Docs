import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function UploadScreen() {
  const [file, setFile] = useState(null);

  const handleUpload = () => {
    Alert.alert('Processing', 'Document is being analyzed by AI...');
    // Simulate processing delay
    setTimeout(() => {
      Alert.alert('Success', 'Summary Generated!');
    }, 1500);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Document Summarization</Text>
      
      <View style={styles.uploadArea}>
        <Ionicons name="cloud-upload-outline" size={60} color="#0056b3" />
        <Text style={styles.uploadText}>Tap to Upload Document</Text>
        <Text style={styles.subText}>Supports PDF, DOCX, Images</Text>
        <TouchableOpacity style={styles.selectBtn}>
          <Text style={styles.selectBtnText}>Select File</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.label}>Generated Summary:</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={6}
          placeholder="AI Summary will appear here..."
          placeholderTextColor="#aaa"
          editable={false}
        />
        <TouchableOpacity style={styles.actionBtn} onPress={handleUpload}>
          <Text style={styles.btnText}>Generate Summary</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    marginTop: 10,
  },
  uploadArea: {
    backgroundColor: '#fff',
    borderRadius: 15,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    marginBottom: 25,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
  },
  subText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 15,
  },
  selectBtn: {
    backgroundColor: '#e6f0ff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectBtnText: {
    color: '#0056b3',
    fontWeight: 'bold',
  },
  summaryBox: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#555',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
  },
  actionBtn: {
    backgroundColor: '#0056b3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});