import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useConnectivity } from '../../utils/connectivity';

const SyncStatusIndicator = () => {
  const { isConnected } = useConnectivity();

  return (
    <View style={[s.container, isConnected ? s.online : s.offline]}>
      <View style={[s.dot, isConnected ? s.dotOnline : s.dotOffline]} />
      <Text style={s.text}>{isConnected ? 'Online' : 'Offline'}</Text>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  online: { backgroundColor: '#064E3B' },
  offline: { backgroundColor: '#7F1D1D' },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  dotOnline: { backgroundColor: '#34D399' },
  dotOffline: { backgroundColor: '#F87171' },
  text: { fontSize: 11, fontWeight: '600', color: '#E5E7EB' },
});

export default SyncStatusIndicator;
