import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ChatScreenProps } from '../../navigation/types';
import { useChatContext } from '../../context/ChatContext';
import { MessageWithUser } from '../../models/Chat';
import { formatDate } from '../../utils/helpers';

const ChatScreen = ({ route, navigation }: ChatScreenProps) => {
  const insets = useSafeAreaInsets();
  const { conversationId, title } = route.params;
  const { loadMessages, sendMessage } = useChatContext();

  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    const data = await loadMessages(conversationId);
    setMessages(data);
    setIsLoading(false);
  }, [conversationId, loadMessages]);

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setIsSending(true);
    try {
      await sendMessage(conversationId, message.trim());
      setMessage('');
      const data = await loadMessages(conversationId);
      setMessages(data);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
    } finally {
      setIsSending(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const renderMessage = (msg: MessageWithUser) => (
    <View key={msg.id} style={[s.bubbleWrapper, msg.isOwn ? s.bubbleWrapperOwn : s.bubbleWrapperOther]}>
      {!msg.isOwn && (
        <View style={s.avatar}>
          <Text style={s.avatarText}>{getInitials(msg.senderDisplayName)}</Text>
        </View>
      )}
      <View style={[s.bubble, msg.isOwn ? s.bubbleOwn : s.bubbleOther]}>
        {!msg.isOwn && (
          <Text style={s.senderName}>{msg.senderDisplayName}</Text>
        )}
        <Text style={[s.bubbleText, msg.isOwn ? s.bubbleTextOwn : s.bubbleTextOther]}>
          {msg.text}
        </Text>
        <Text style={s.bubbleTime}>{formatDate(msg.createdAt)}</Text>
      </View>
    </View>
  );

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={s.headerTitle} numberOfLines={1}>{title}</Text>
        <Pressable>
          <Ionicons name="ellipsis-vertical" size={20} color="#E5E7EB" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <ActivityIndicator color="#7C3AED" style={{ marginTop: 32 }} />
        ) : (
          <ScrollView
            ref={scrollRef}
            style={s.messages}
            contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 12 }}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {messages.length === 0 && (
              <Text style={s.emptyText}>No hay mensajes aún. ¡Sé el primero!</Text>
            )}
            {messages.map(renderMessage)}
          </ScrollView>
        )}

        <View style={[s.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            style={s.input}
            placeholder="Type a message..."
            placeholderTextColor="#6B7280"
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <Pressable
            style={[s.sendBtn, (!message.trim() || isSending) && s.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!message.trim() || isSending}
          >
            {isSending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="send" size={20} color="#fff" />
            }
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#374151', gap: 14 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#F9FAFB' },
  messages: { flex: 1 },
  bubbleWrapper: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  bubbleWrapperOwn: { justifyContent: 'flex-end' },
  bubbleWrapperOther: { justifyContent: 'flex-start' },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  avatarText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  bubble: { maxWidth: '78%', borderRadius: 16, padding: 12 },
  bubbleOwn: { backgroundColor: '#7C3AED', borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#1F2937', borderBottomLeftRadius: 4 },
  senderName: { fontSize: 11, fontWeight: '700', color: '#7C3AED', marginBottom: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextOwn: { color: '#fff' },
  bubbleTextOther: { color: '#E5E7EB' },
  bubbleTime: { fontSize: 10, color: '#9CA3AF', marginTop: 4, alignSelf: 'flex-end' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: '#374151', backgroundColor: '#111827', gap: 10 },
  input: { flex: 1, backgroundColor: '#1F2937', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#F9FAFB', maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#4B5563' },
  emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 32 },
});

export default ChatScreen;