import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthContext } from '../../context/AuthContext';
import { LoginScreenProps } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const insets = useSafeAreaInsets();
  const { login, isLoading, error, clearError } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleLogin = async () => {
    if (!email.trim()) {
      setLocalError('Ingresa tu email');
      return;
    }
    if (!password || password.length < 6) {
      setLocalError('La contrasena debe tener al menos 6 caracteres');
      return;
    }
    setLocalError('');
    try {
      await login(email.trim(), password);
    } catch {}
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView style={[s.container, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={s.logoContainer}>
          <View style={s.logoIcon}>
            <Ionicons name="business" size={36} color="#fff" />
          </View>
          <Text style={s.logoText}>ConexionCorp</Text>
          <Text style={s.logoSub}>Your Corporate Network</Text>
        </View>

        <View style={s.form}>
          <Text style={s.label}>Email</Text>
          <TextInput
            style={s.input}
            placeholder="your.email@company.com"
            placeholderTextColor="#6B7280"
            value={email}
            onChangeText={(t) => { setEmail(t); setLocalError(''); clearError(); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={s.label}>Password</Text>
          <TextInput
            style={s.input}
            placeholder="Enter your password"
            placeholderTextColor="#6B7280"
            value={password}
            onChangeText={(t) => { setPassword(t); setLocalError(''); clearError(); }}
            secureTextEntry
          />

          {displayError ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{displayError}</Text>
            </View>
          ) : null}

          <Pressable style={[s.loginBtn, isLoading && { opacity: 0.6 }]} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.loginBtnText}>Login</Text>}
          </Pressable>

          <View style={s.registerRow}>
            <Text style={s.registerText}>Don't have an account? </Text>
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text style={s.registerLink}>Register</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 40 },
  logoContainer: { alignItems: 'center', marginBottom: 48 },
  logoIcon: { width: 72, height: 72, borderRadius: 16, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoText: { fontSize: 28, fontWeight: '700', color: '#fff' },
  logoSub: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
  form: { gap: 4 },
  label: { fontSize: 14, fontWeight: '600', color: '#E5E7EB', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#1F2937', borderWidth: 1, borderColor: '#374151', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: '#F9FAFB' },
  errorBox: { backgroundColor: '#7F1D1D', borderRadius: 8, padding: 10, marginTop: 12 },
  errorText: { color: '#FCA5A5', fontSize: 13, textAlign: 'center' },
  loginBtn: { backgroundColor: '#7C3AED', borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 24 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  registerText: { color: '#9CA3AF', fontSize: 14 },
  registerLink: { color: '#7C3AED', fontSize: 14, fontWeight: '600' },
});

export default LoginScreen;
