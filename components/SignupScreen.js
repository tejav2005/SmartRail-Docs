import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator,
  Dimensions, Pressable, Alert,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
  FadeInDown, FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { signup } from '../services/api';
import { useTheme } from './ThemeContext';

const { height: SH } = Dimensions.get('window');

// ─── Input field (shared) ────────────────────────────────────────────────────
function InputField({ icon, placeholder, value, onChangeText, secureEntry, rightIcon, onRightPress, keyboardType, autoCapitalize, error }) {
  const [focused, setFocused] = useState(false);
  const { theme } = useTheme();
  return (
    <View style={styles.inputWrap}>
      <View style={[
        styles.inputRow,
        { backgroundColor: theme.colors.inputBg ?? '#F9FAFB', borderColor: error ? '#EF4444' : focused ? '#0056b3' : theme.colors.border },
        focused && styles.inputFocused,
      ]}>
        <Ionicons name={icon} size={18} color={focused ? '#0056b3' : theme.colors.muted} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.muted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureEntry}
          keyboardType={keyboardType ?? 'default'}
          autoCapitalize={autoCapitalize ?? 'none'}
          underlineColorAndroid="transparent"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} style={styles.eyeBtn}>
            <Ionicons name={rightIcon} size={18} color={theme.colors.muted} />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

// ─── Gradient button ──────────────────────────────────────────────────────────
function GradientButton({ onPress, label, loading }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.btnWrap, animStyle]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 14 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
        onPress={loading ? undefined : onPress}
        style={{ borderRadius: 16, overflow: 'hidden' }}
      >
        <LinearGradient
          colors={loading ? ['#9CA3AF', '#9CA3AF'] : ['#003580', '#0056b3', '#1976D2']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.gradientBtn}
        >
          {loading ? (
            <><ActivityIndicator color="#fff" size="small" /><Text style={styles.btnText}>  Creating account...</Text></>
          ) : (
            <><Text style={styles.btnText}>{label}</Text><Ionicons name="arrow-forward" size={18} color="#fff" /></>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────
export default function SignupScreen({ navigation }) {
  const { theme } = useTheme();
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!employeeId.trim()) e.employeeId = 'Employee ID is required';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Minimum 8 characters required';
    if (password !== confirmPass) e.confirmPass = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      await signup({
        name: fullName.trim(),
        employeeId: employeeId.trim().toUpperCase(),
        password,
      });

      Alert.alert('Account Created', 'Your account has been created. Please sign in.', [
        { text: 'Login', onPress: () => navigation.navigate('Login', { employeeId: employeeId.trim().toUpperCase() }) },
      ]);
    } catch (error) {
      Alert.alert('Sign Up Failed', error.message || 'Unable to create account right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} bounces={false}>

        {/* ── Top gradient branding area ── */}
        <LinearGradient
          colors={['#00122E', '#001A47', '#003580', '#0056b3']}
          start={{ x: 0.1, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.brandArea}
        >
          <View style={styles.ring1} />
          <View style={styles.ring2} />

          <Animated.View entering={FadeIn.delay(100)} style={styles.brandContent}>
            <View style={styles.logoWrap}>
              <Ionicons name="subway" size={30} color="#0056b3" />
            </View>
            <Text style={styles.orgName}>KMRL</Text>
            <Text style={styles.orgFull}>Kochi Metro Rail Limited</Text>
          </Animated.View>
        </LinearGradient>

        {/* ── Form card ── */}
        <Animated.View
          entering={FadeInDown.delay(180).springify()}
          style={[styles.formCard, { backgroundColor: theme.colors.background }]}
        >
          <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>Create Account ✨</Text>
          <Text style={[styles.welcomeSub, { color: theme.colors.subText }]}>
            Register your KMRL staff account below
          </Text>

          <View style={styles.fields}>
            <InputField
              icon="person-outline"
              placeholder="Full Name"
              value={fullName}
              onChangeText={v => { setFullName(v); setErrors(e => ({ ...e, fullName: '' })); }}
              autoCapitalize="words"
              error={errors.fullName}
            />
            <InputField
              icon="id-card-outline"
              placeholder="Employee ID"
              value={employeeId}
              onChangeText={v => { setEmployeeId(v); setErrors(e => ({ ...e, employeeId: '' })); }}
              autoCapitalize="characters"
              error={errors.employeeId}
            />
            <InputField
              icon="lock-closed-outline"
              placeholder="Password (min. 8 chars)"
              value={password}
              onChangeText={v => { setPassword(v); setErrors(e => ({ ...e, password: '' })); }}
              secureEntry={!showPass}
              rightIcon={showPass ? 'eye-off-outline' : 'eye-outline'}
              onRightPress={() => setShowPass(s => !s)}
              error={errors.password}
            />
            <InputField
              icon="shield-checkmark-outline"
              placeholder="Confirm Password"
              value={confirmPass}
              onChangeText={v => { setConfirmPass(v); setErrors(e => ({ ...e, confirmPass: '' })); }}
              secureEntry={!showConfirm}
              rightIcon={showConfirm ? 'eye-off-outline' : 'eye-outline'}
              onRightPress={() => setShowConfirm(s => !s)}
              error={errors.confirmPass}
            />
          </View>

          {/* Password hint */}
          <View style={styles.passHintRow}>
            <Ionicons name="information-circle-outline" size={13} color="#9CA3AF" />
            <Text style={[styles.passHintText, { color: theme.colors.muted }]}>
              Use 8+ characters with a mix of letters and numbers
            </Text>
          </View>

          {/* Signup button */}
          <GradientButton onPress={handleSignup} label="Create Account" loading={loading} />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.divLine, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.divText, { color: theme.colors.muted }]}>OR</Text>
            <View style={[styles.divLine, { backgroundColor: theme.colors.border }]} />
          </View>

          {/* Login link */}
          <View style={styles.bottomLink}>
            <Text style={[styles.bottomLinkText, { color: theme.colors.subText }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.bottomLinkAction, { color: '#0056b3' }]}>Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Secure note */}
          <View style={styles.secureNote}>
            <Ionicons name="shield-checkmark" size={13} color="#16A34A" />
            <Text style={[styles.secureText, { color: theme.colors.muted }]}>
              Your data is protected by end-to-end encryption
            </Text>
          </View>
        </Animated.View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Branding top area (shorter for signup — more form space needed)
  brandArea: {
    height: SH * 0.28,
    justifyContent: 'flex-end',
    paddingBottom: 32,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  ring1: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    top: -60, right: -60,
  },
  ring2: {
    position: 'absolute', width: 130, height: 130, borderRadius: 65,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    top: 20, right: 30,
  },
  brandContent: { alignItems: 'flex-start' },
  logoWrap: {
    width: 54, height: 54, borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 8,
  },
  orgName: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  orgFull: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },

  // Form card
  formCard: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 36,
  },
  welcomeTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3, marginBottom: 6 },
  welcomeSub: { fontSize: 14, marginBottom: 24, lineHeight: 20 },

  // Fields
  fields: { gap: 12, marginBottom: 10 },
  inputWrap: { gap: 5 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1.5,
    height: 52, paddingHorizontal: 14,
  },
  inputFocused: { borderColor: '#0056b3', backgroundColor: '#F0F7FF' },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    borderWidth: 0,
    outlineWidth: 0,
    outlineStyle: 'none',
    backgroundColor: 'transparent',
    paddingVertical: 0,
    includeFontPadding: false,
  },
  eyeBtn: { padding: 4 },
  errorText: { fontSize: 12, color: '#EF4444', marginLeft: 4 },

  // Password hint
  passHintRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 20, marginTop: 4 },
  passHintText: { fontSize: 12, flex: 1, lineHeight: 17 },

  // Button
  btnWrap: { marginBottom: 20 },
  gradientBtn: {
    height: 54, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10, borderRadius: 16,
  },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  divLine: { flex: 1, height: StyleSheet.hairlineWidth },
  divText: { fontSize: 12, fontWeight: '600' },

  // Bottom link
  bottomLink: { flexDirection: 'row', justifyContent: 'center', marginBottom: 22 },
  bottomLinkText: { fontSize: 14 },
  bottomLinkAction: { fontSize: 14, fontWeight: '700' },

  // Secure note
  secureNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  secureText: { fontSize: 11 },
});
