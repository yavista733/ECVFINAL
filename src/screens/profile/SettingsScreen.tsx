import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthContext';
import SyncStatusIndicator from '../../components/Common/SyncStatusIndicator';

const SettingsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { logout } = useAuthContext();

  const handleLogout = () => {
    Alert.alert('Cerrar Sesion', 'Estas seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar Sesion', style: 'destructive', onPress: logout },
    ]);
  };

  const MenuItem = ({ icon, label, onPress, color }: { icon: string; label: string; onPress?: () => void; color?: string }) => (
    <Pressable style={s.menuItem} onPress={onPress}>
      <Ionicons name={icon as any} size={22} color={color || '#E5E7EB'} />
      <Text style={[s.menuLabel, color ? { color } : null]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#6B7280" />
    </Pressable>
  );

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}><Ionicons name="arrow-back" size={24} color="#fff" /></Pressable>
        <Text style={s.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.content}>
        <View style={s.syncRow}><SyncStatusIndicator /></View>

        <MenuItem icon="person-outline" label="Account Settings" />
        <MenuItem icon="notifications-outline" label="Notifications" />
        <MenuItem icon="lock-closed-outline" label="Privacy & Security" />
        <MenuItem icon="help-circle-outline" label="Help & Support" />

        <Pressable style={s.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#F87171" />
          <Text style={s.logoutText}>Logout</Text>
        </Pressable>

        <View style={s.footer}>
          <Text style={s.footerText}>ConexionCorp v1.0.0</Text>
          <Text style={s.footerText}>© 2026 All rights reserved</Text>
        </View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#374151' },
  backBtn: { width: 40 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#F9FAFB' },
  content: { paddingHorizontal: 16, paddingTop: 20 },
  syncRow: { alignItems: 'flex-start', marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F2937', borderRadius: 12, borderWidth: 0.5, borderColor: '#374151', paddingHorizontal: 16, paddingVertical: 16, marginBottom: 10, gap: 14 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#E5E7EB' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#7F1D1D', borderRadius: 12, paddingVertical: 16, marginTop: 20, gap: 10 },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#F87171' },
  footer: { alignItems: 'center', marginTop: 40 },
  footerText: { fontSize: 12, color: '#6B7280', marginTop: 2 },
});

export default SettingsScreen;
