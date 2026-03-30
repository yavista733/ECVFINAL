import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PostType } from '../../models/Post';
import { usePostContext } from '../../context/PostContext';


const POST_TYPES: { key: PostType; label: string }[] = [
  { key: 'post', label: 'Post' },
  { key: 'announcement', label: 'Announcement' },
  { key: 'event', label: 'Event' },
];

const CreatePostScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { createPost } = usePostContext();
  const [content, setContent] = useState('');
  const [type, setType] = useState<PostType>('post');
  const [community, setCommunity] = useState('');

  const handlePublish = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'El contenido no puede estar vacio');
      return;
    }
    try {
      await createPost(content.trim(), type, '', community);
      navigation.goBack();
    } catch {}
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#fff" /></Pressable>
        <Text style={s.headerTitle}>New Post</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={s.content}>
        <Text style={s.label}>Type</Text>
        <View style={s.typeRow}>
          {POST_TYPES.map((pt) => (
            <Pressable key={pt.key} style={[s.typeBtn, type === pt.key && s.typeBtnActive]} onPress={() => setType(pt.key)}>
              <Text style={[s.typeBtnText, type === pt.key && s.typeBtnTextActive]}>{pt.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={s.label}>What would you like to share?</Text>
        <TextInput
          style={s.textArea}
          placeholder="Share your thoughts, updates, or announcements..."
          placeholderTextColor="#6B7280"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        <Pressable style={s.imageBtn}>
          <Ionicons name="image-outline" size={20} color="#9CA3AF" />
          <Text style={s.imageBtnText}>Add Image</Text>
        </Pressable>

        <Text style={s.label}>Community (Optional)</Text>
        <View style={s.selectContainer}>
          <Text style={s.selectText}>{community || 'Select a community'}</Text>
          <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
        </View>

        <Pressable style={s.publishBtn} onPress={handlePublish}>
          <Text style={s.publishText}>Publish</Text>
        </Pressable>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#374151' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#F9FAFB' },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#D1D5DB', marginBottom: 8, marginTop: 16 },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#1F2937', borderWidth: 1, borderColor: '#374151' },
  typeBtnActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  typeBtnText: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
  typeBtnTextActive: { color: '#fff' },
  textArea: { backgroundColor: '#1F2937', borderWidth: 1, borderColor: '#374151', borderRadius: 12, padding: 16, fontSize: 14, color: '#F9FAFB', minHeight: 140, lineHeight: 21 },
  imageBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1F2937', borderWidth: 1, borderColor: '#374151', borderRadius: 12, paddingVertical: 14, marginTop: 12, gap: 8 },
  imageBtnText: { fontSize: 14, color: '#9CA3AF' },
  selectContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1F2937', borderWidth: 1, borderColor: '#374151', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 },
  selectText: { fontSize: 14, color: '#6B7280' },
  publishBtn: { backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 28, opacity: 0.9 },
  publishText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

export default CreatePostScreen;
