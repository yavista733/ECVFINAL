import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useChatContext } from '../../context/ChatContext';
import { ConversationWithPreview } from '../../models/Chat';
import { formatDate } from '../../utils/helpers';

const InboxScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'unread' | 'all'>('unread');
  const { conversations, isLoading, loadConversations } = useChatContext();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }, [loadConversations]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getConversationTitle = (conv: ConversationWithPreview): string => {
    if (conv.title && conv.title.trim().length > 0) return conv.title;
    if (conv.participantNames.length > 0) return conv.participantNames[0];
    return 'Conversación';
  };

  const renderConversation = (conv: ConversationWithPreview) => {
    const title = getConversationTitle(conv);
    return (
      <Pressable
        key={conv.id}
        style={s.messageItem}
        onPress={() => navigation.navigate('Chat', { conversationId: conv.id, title })}
      >
        <View style={s.messageLeft}>
          <View style={[s.avatar, { backgroundColor: '#7C3AED' }]}>
            <Text style={s.avatarText}>{getInitials(title)}</Text>
          </View>
          <View style={s.messageContent}>
            <Text style={s.messageName}>{title}</Text>
            <Text style={s.messagePreview} numberOfLines={1}>
              {conv.lastMessage || 'Sin mensajes aún'}
            </Text>
          </View>
        </View>
        <Text style={s.messageTime}>{formatDate(conv.lastMessageTime)}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Inbox</Text>
        <Pressable><Ionicons name="search-outline" size={22} color="#E5E7EB" /></Pressable>
      </View>

      <View style={s.tabs}>
        <Pressable style={[s.tab, activeTab === 'unread' && s.tabActive]} onPress={() => setActiveTab('unread')}>
          <Text style={[s.tabText, activeTab === 'unread' && s.tabTextActive]}>
            Unread ({conversations.length})
          </Text>
        </Pressable>
        <Pressable style={[s.tab, activeTab === 'all' && s.tabActive]} onPress={() => setActiveTab('all')}>
          <Text style={[s.tabText, activeTab === 'all' && s.tabTextActive]}>All</Text>
        </Pressable>
      </View>

      {isLoading && !refreshing && (
        <ActivityIndicator color="#7C3AED" style={{ marginTop: 32 }} />
      )}

      {!isLoading && conversations.length === 0 && (
        <View style={s.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={48} color="#374151" />
          <Text style={s.emptyText}>No tienes conversaciones aún</Text>
        </View>
      )}

      <ScrollView
        style={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />}
      >
        {conversations.map(renderConversation)}
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
  messageItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#1F2937' },
  messageLeft: { flexDirection: 'row', flex: 1, marginRight: 12, alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  messageContent: { flex: 1 },
  messageName: { fontSize: 15, fontWeight: '700', color: '#F9FAFB' },
  messagePreview: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  messageTime: { fontSize: 12, color: '#6B7280' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 14, color: '#6B7280' },
});

export default InboxScreen;