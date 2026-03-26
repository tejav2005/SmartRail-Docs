import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator, Alert,
  Dimensions, Pressable,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
  FadeInDown, FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { login } from '../services/api';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';

const { height: SH } = Dimensions.get('window');

// ─── Input field ────────────────────────────────────────────────────────────
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

// ─── Press button ────────────────────────────────────────────────────────────
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
            <><ActivityIndicator color="#fff" size="small" /><Text style={styles.btnText}>  Signing in...</Text></>
          ) : (
            <><Text style={styles.btnText}>{label}</Text><Ionicons name="arrow-forward" size={18} color="#fff" /></>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────
export default function LoginScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { signIn } = useAuth();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (route?.params?.employeeId) {
      setEmployeeId(route.params.employeeId);
    }
  }, [route?.params?.employeeId]);

  const validate = () => {
    const e = {};
    if (!employeeId.trim()) e.employeeId = 'Employee ID is required';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const response = await login({
        employeeId: employeeId.trim().toUpperCase(),
        password,
      });

      await signIn(response.data);
    } catch (error) {
      Alert.alert('Sign In Failed', error.message || 'Unable to sign in right now.');
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
          {/* Decorative rings */}
          <View style={styles.ring1} />
          <View style={styles.ring2} />

          <Animated.View entering={FadeIn.delay(100)} style={styles.brandContent}>
            {/* Logo */}
            <View style={styles.logoWrap}>
              <Ionicons name="subway" size={32} color="#0056b3" />
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
          <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>Welcome Back 👋</Text>
          <Text style={[styles.welcomeSub, { color: theme.colors.subText }]}>
            Sign in to your KMRL staff account
          </Text>

          <View style={styles.fields}>
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
              placeholder="Password"
              value={password}
              onChangeText={v => { setPassword(v); setErrors(e => ({ ...e, password: '' })); }}
              secureEntry={!showPass}
              rightIcon={showPass ? 'eye-off-outline' : 'eye-outline'}
              onRightPress={() => setShowPass(s => !s)}
              error={errors.password}
            />
          </View>

          {/* Forgot password */}
          <TouchableOpacity style={styles.forgotWrap} onPress={() => Alert?.alert?.('Info', 'Contact IT support to reset your password.')}>
            <Text style={[styles.forgotText, { color: '#0056b3' }]}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login button */}
          <GradientButton onPress={handleLogin} label="Sign In" loading={loading} />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.divLine, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.divText, { color: theme.colors.muted }]}>OR</Text>
            <View style={[styles.divLine, { backgroundColor: theme.colors.border }]} />
          </View>

          {/* Signup link */}
          <View style={styles.bottomLink}>
            <Text style={[styles.bottomLinkText, { color: theme.colors.subText }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={[styles.bottomLinkAction, { color: '#0056b3' }]}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Security note */}
          <View style={styles.secureNote}>
            <Ionicons name="shield-checkmark" size={13} color="#16A34A" />
            <Text style={[styles.secureText, { color: theme.colors.muted }]}>
              Secured by KMRL SSO · Data encrypted in transit
            </Text>
          </View>
        </Animated.View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Branding top area
  brandArea: {
    height: SH * 0.34,
    justifyContent: 'flex-end',
    paddingBottom: 36,
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
    width: 60, height: 60, borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 8,
  },
  orgName: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  orgFull: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },

  // Form card
  formCard: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 36,
  },
  welcomeTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3, marginBottom: 6 },
  welcomeSub: { fontSize: 14, marginBottom: 28, lineHeight: 20 },

  // Fields
  fields: { gap: 14, marginBottom: 10 },
  inputWrap: { gap: 5 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1.5,
    height: 54, paddingHorizontal: 14,
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

  // Forgot
  forgotWrap: { alignSelf: 'flex-end', marginBottom: 22, marginTop: 4 },
  forgotText: { fontSize: 13, fontWeight: '600' },

  // Button
  btnWrap: { marginBottom: 20 },
  gradientBtn: {
    height: 56, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10, borderRadius: 16,
  },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  divLine: { flex: 1, height: StyleSheet.hairlineWidth },
  divText: { fontSize: 12, fontWeight: '600' },

  // Bottom link
  bottomLink: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  bottomLinkText: { fontSize: 14 },
  bottomLinkAction: { fontSize: 14, fontWeight: '700' },

  // Secure note
  secureNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  secureText: { fontSize: 11 },
});
