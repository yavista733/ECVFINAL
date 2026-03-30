import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ChatScreenProps } from '../../navigation/types';

const DEMO_CHAT = [
  { id: 1, text: 'Hi! Have you reviewed the project timeline?', isOwn: false, time: '10:30 AM' },
  { id: 2, text: 'Yes, I just finished reviewing it. Looks good overall!', isOwn: true, time: '10:32 AM' },
  { id: 3, text: 'Great! Can we discuss the Q2 milestones tomorrow?', isOwn: false, time: '10:35 AM' },
  { id: 4, text: 'Sure, I\'ll set up a meeting. Does 2 PM work for you?', isOwn: true, time: '10:36 AM' },
  { id: 5, text: 'Perfect! See you then 👍', isOwn: false, time: '10:37 AM' },
];

const ChatScreen = ({ route, navigation }: ChatScreenProps) => {
  const insets = useSafeAreaInsets();
  const { title } = route.params;
  const [message, setMessage] = useState('');

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#fff" /></Pressable>
        <Text style={s.headerTitle} numberOfLines={1}>{title}</Text>
        <Pressable><Ionicons name="ellipsis-vertical" size={20} color="#E5E7EB" /></Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <ScrollView style={s.messages} contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 12 }}>
          {DEMO_CHAT.map((msg) => (
            <View key={msg.id} style={[s.bubble, msg.isOwn ? s.bubbleOwn : s.bubbleOther]}>
              <Text style={[s.bubbleText, msg.isOwn ? s.bubbleTextOwn : s.bubbleTextOther]}>{msg.text}</Text>
              <Text style={s.bubbleTime}>{msg.time}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={[s.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            style={s.input}
            placeholder="Type a message..."
            placeholderTextColor="#6B7280"
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <Pressable style={s.sendBtn}>
            <Ionicons name="send" size={20} color="#fff" />
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
  bubble: { maxWidth: '80%', borderRadius: 16, padding: 12, marginBottom: 10 },
  bubbleOwn: { alignSelf: 'flex-end', backgroundColor: '#7C3AED', borderBottomRightRadius: 4 },
  bubbleOther: { alignSelf: 'flex-start', backgroundColor: '#1F2937', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextOwn: { color: '#fff' },
  bubbleTextOther: { color: '#E5E7EB' },
  bubbleTime: { fontSize: 10, color: '#9CA3AF', marginTop: 4, alignSelf: 'flex-end' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: '#374151', backgroundColor: '#111827', gap: 10 },
  input: { flex: 1, backgroundColor: '#1F2937', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#F9FAFB', maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
});

export default ChatScreen;
