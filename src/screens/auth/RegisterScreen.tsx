import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthContext } from '../../context/AuthContext';
import { RegisterScreenProps } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const insets = useSafeAreaInsets();
  const { register, isLoading, error, clearError } = useAuthContext();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleRegister = async () => {
    if (!displayName.trim() || displayName.trim().length < 2) {
      setLocalError('El nombre debe tener al menos 2 caracteres');
      return;
    }
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
      await register(email.trim(), password, displayName.trim(), department.trim());
    } catch {}
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView style={[s.container, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>

        <Text style={s.title}>Create Account</Text>
        <Text style={s.subtitle}>Join your corporate network</Text>

        <View style={s.form}>
          <Text style={s.label}>Full Name *</Text>
          <TextInput style={s.input} placeholder="John Doe" placeholderTextColor="#6B7280" value={displayName} onChangeText={(t) => { setDisplayName(t); setLocalError(''); clearError(); }} />

          <Text style={s.label}>Email *</Text>
          <TextInput style={s.input} placeholder="john@company.com" placeholderTextColor="#6B7280" value={email} onChangeText={(t) => { setEmail(t); setLocalError(''); clearError(); }} keyboardType="email-address" autoCapitalize="none" />

          <Text style={s.label}>Department</Text>
          <TextInput style={s.input} placeholder="Engineering, Marketing, etc." placeholderTextColor="#6B7280" value={department} onChangeText={setDepartment} />

          <Text style={s.label}>Password *</Text>
          <TextInput style={s.input} placeholder="Min. 6 characters" placeholderTextColor="#6B7280" value={password} onChangeText={(t) => { setPassword(t); setLocalError(''); clearError(); }} secureTextEntry />

          {displayError ? (
            <View style={s.errorBox}><Text style={s.errorText}>{displayError}</Text></View>
          ) : null}

          <Pressable style={[s.registerBtn, isLoading && { opacity: 0.6 }]} onPress={handleRegister} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.registerBtnText}>Register</Text>}
          </Pressable>

          <View style={s.loginRow}>
            <Text style={s.loginText}>Already have an account? </Text>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={s.loginLink}>Login</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 32, paddingBottom: 40, paddingTop: 16 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: '#fff', marginTop: 12 },
  subtitle: { fontSize: 14, color: '#9CA3AF', marginTop: 4, marginBottom: 24 },
  form: { gap: 4 },
  label: { fontSize: 14, fontWeight: '600', color: '#E5E7EB', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#1F2937', borderWidth: 1, borderColor: '#374151', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: '#F9FAFB' },
  errorBox: { backgroundColor: '#7F1D1D', borderRadius: 8, padding: 10, marginTop: 12 },
  errorText: { color: '#FCA5A5', fontSize: 13, textAlign: 'center' },
  registerBtn: { backgroundColor: '#7C3AED', borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 24 },
  registerBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { color: '#9CA3AF', fontSize: 14 },
  loginLink: { color: '#7C3AED', fontSize: 14, fontWeight: '600' },
});

export default RegisterScreen;
