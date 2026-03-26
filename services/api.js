import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Server host: set EXPO_PUBLIC_API_HOST in your .env file to your machine's local IP (e.g. 192.168.x.x)
// If not set, defaults to localhost (works for web / iOS simulator)
const SERVER_HOST = process.env.EXPO_PUBLIC_API_HOST || 'localhost';
const API_PORT = process.env.EXPO_PUBLIC_API_PORT || 5000;

export const API_BASE_URL = Platform.select({
  android: `http://${SERVER_HOST}:${API_PORT}/api`,
  ios: `http://localhost:${API_PORT}/api`,
  web: `http://localhost:${API_PORT}/api`,
  default: `http://${SERVER_HOST}:${API_PORT}/api`,
});

// ─── Token helper ───────────────────────────────────────────────────────────
async function getToken() {
  try {
    return await AsyncStorage.getItem('kmrl_auth_token');
  } catch {
    return null;
  }
}

// ─── Core request helpers ────────────────────────────────────────────────────
async function request(path, options = {}) {
  const { headers: optHeaders, ...restOptions } = options;
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        ...(optHeaders || {}),
      },
    });
  } catch {
    throw new Error(`Network request failed. Check that the API server is reachable at ${API_BASE_URL}.`);
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : { message: 'Unexpected response from server' };

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
}

/** Authenticated request — attaches Bearer token from AsyncStorage */
async function authRequest(path, options = {}) {
  const token = await getToken();
  return request(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export function signup(payload) {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function login(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ─── Documents ───────────────────────────────────────────────────────────────
export function getDocuments(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
  ).toString();
  return authRequest(`/documents${qs ? `?${qs}` : ''}`);
}

export function getStats() {
  return authRequest('/documents/stats');
}

export function getDocumentStats() {
  return getStats();
}

export function getDocumentById(id) {
  return authRequest(`/documents/${id}`);
}

export function summarizeDocument(id) {
  return authRequest(`/documents/${id}/summarize`, { method: 'POST' });
}

export function updateDocument(id, body) {
  return authRequest(`/documents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteDocument(id) {
  return authRequest(`/documents/${id}`, { method: 'DELETE' });
}

/**
 * Upload a document using multipart/form-data.
 * Accepts either a prebuilt FormData instance or the legacy file/meta args.
 */
export async function uploadDocument(fileOrFormData, meta = {}) {
  const token = await getToken();
  const formData = fileOrFormData instanceof FormData
    ? fileOrFormData
    : (() => {
        const data = new FormData();
        data.append('file', {
          uri: fileOrFormData.uri,
          name: fileOrFormData.name,
          type: fileOrFormData.mimeType || 'application/octet-stream',
        });
        if (meta.title) data.append('title', meta.title);
        if (meta.description) data.append('description', meta.description);
        if (meta.category) data.append('category', meta.category);
        if (meta.tags) data.append('tags', meta.tags);
        return data;
      })();

  const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: 'POST',
    headers: {
      // ⚠️ Do NOT set Content-Type here — fetch must auto-set it with the multipart boundary
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : { message: 'Unexpected response from server' };

  if (!response.ok) {
    throw new Error(payload.message || 'Upload failed');
  }

  return payload;
}

// ─── Meetings ─────────────────────────────────────────────────────────────────
export function getMeetings() {
  return authRequest('/meetings');
}

export function createMeeting(body) {
  return authRequest('/meetings', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateMeeting(id, body) {
  return authRequest(`/meetings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteMeeting(id) {
  return authRequest(`/meetings/${id}`, { method: 'DELETE' });
}

// ─── Notifications ────────────────────────────────────────────────────────────
export function getNotifications() {
  return authRequest('/notifications');
}

export function markNotificationRead(id) {
  return authRequest(`/notifications/${id}/read`, { method: 'PATCH' });
}

export function markAllNotificationsRead() {
  return authRequest('/notifications/mark-all-read', { method: 'PATCH' });
}

export function dismissNotification(id) {
  return authRequest(`/notifications/${id}`, { method: 'DELETE' });
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export function getProfile() {
  return authRequest('/profile');
}

export function updateProfile(body) {
  return authRequest('/profile', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function changePassword(body) {
  return authRequest('/profile/password', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

// ─── Users ────────────────────────────────────────────────────────────────────
export function getUsers(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
  ).toString();
  return authRequest(`/users${qs ? `?${qs}` : ''}`);
}

export function getUserById(id) {
  return authRequest(`/users/${id}`);
}
