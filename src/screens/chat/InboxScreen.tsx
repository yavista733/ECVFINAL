import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const DEMO_MESSAGES = [
  { id: 1, name: 'Jennifer Smith', subject: 'Important: All-Hands Meeting Tomorrow', preview: 'Reminder about the company-wide all-hands meeting s...', time: '10m ago', isAnnouncement: true, initials: 'JS', color: '#DC2626' },
  { id: 2, name: 'Marcus Chen', subject: 'RE: Project Alpha Timeline', preview: 'Thanks for the update. I\'ve reviewed the timeline and h...', time: '1h ago', isAnnouncement: false, initials: '', color: '' },
  { id: 3, name: 'Emily Roberts', subject: 'Q1 Budget Review', preview: 'Hi team, I\'ve completed the Q1 budget review. Overall ...', time: '3h ago', isAnnouncement: false, initials: 'ER', color: '#DC2626' },
];

const InboxScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'unread' | 'all'>('unread');

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Inbox</Text>
        <Pressable><Ionicons name="search-outline" size={22} color="#E5E7EB" /></Pressable>
      </View>

      <View style={s.tabs}>
        <Pressable style={[s.tab, activeTab === 'unread' && s.tabActive]} onPress={() => setActiveTab('unread')}>
          <Text style={[s.tabText, activeTab === 'unread' && s.tabTextActive]}>Unread (3)</Text>
        </Pressable>
        <Pressable style={[s.tab, activeTab === 'all' && s.tabActive]} onPress={() => setActiveTab('all')}>
          <Text style={[s.tabText, activeTab === 'all' && s.tabTextActive]}>All</Text>
        </Pressable>
      </View>

      <ScrollView style={s.list}>
        {DEMO_MESSAGES.map((msg) => (
          <Pressable key={msg.id} style={s.messageItem} onPress={() => navigation.navigate('Chat', { conversationId: msg.id, title: msg.name })}>
            <View style={s.messageLeft}>
              {msg.isAnnouncement ? (
                <View style={[s.avatar, { backgroundColor: '#7F1D1D' }]}><Ionicons name="megaphone" size={20} color="#F87171" /></View>
              ) : msg.initials ? (
                <View style={[s.avatar, { backgroundColor: msg.color || '#374151' }]}><Text style={s.avatarText}>{msg.initials}</Text></View>
              ) : (
                <View style={[s.avatar, { backgroundColor: '#374151' }]}><Ionicons name="person" size={20} color="#9CA3AF" /></View>
              )}
              <View style={s.messageContent}>
                <Text style={s.messageName}>{msg.name}</Text>
                <Text style={s.messageSubject} numberOfLines={1}>{msg.subject}</Text>
                <Text style={s.messagePreview} numberOfLines={1}>{msg.preview}</Text>
              </View>
            </View>
            <Text style={s.messageTime}>{msg.time}</Text>
          </Pressable>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#374151' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#F9FAFB' },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12 },
  tab: { paddingBottom: 10, marginRight: 24, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#7C3AED' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#7C3AED' },
  list: { flex: 1, paddingTop: 8 },
  messageItem: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#1F2937' },
  messageLeft: { flexDirection: 'row', flex: 1, marginRight: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  messageContent: { flex: 1 },
  messageName: { fontSize: 15, fontWeight: '700', color: '#F9FAFB' },
  messageSubject: { fontSize: 13, fontWeight: '600', color: '#D1D5DB', marginTop: 2 },
  messagePreview: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  messageTime: { fontSize: 12, color: '#6B7280' },
});

export default InboxScreen;
