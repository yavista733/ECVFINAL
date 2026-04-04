import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { usePostContext } from '../../context/PostContext';
import { useAuthContext } from '../../context/AuthContext';
import { CommentWithUser } from '../../models/Comment';
import { commentRepository } from '../../repositories/CommentRepository';
import { formatDate } from '../../utils/helpers';

type Props = NativeStackScreenProps<RootStackParamList, 'PostDetail'>;

const PostDetailScreen = ({ route, navigation }: Props) => {
  const { postId } = route.params;
  const insets = useSafeAreaInsets();
  const { posts, loadComments, addComment } = usePostContext();
  const { user } = useAuthContext();

  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const post = posts.find((p) => p.id === postId);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    const data = await loadComments(postId);
    setComments(data);
    setIsLoading(false);
  }, [postId, loadComments]);

  useEffect(() => {
    if (user && post) {
      commentRepository.seedDemoComments(postId, user.id).then(fetchComments);
    }
  }, [postId, user]);

  const handleSend = async () => {
    if (!commentText.trim()) return;
    setIsSending(true);
    try {
      await addComment(postId, commentText.trim());
      setCommentText('');
      const data = await loadComments(postId);
      setComments(data);
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

  const renderComment = ({ item }: { item: CommentWithUser }) => (
    <View style={styles.commentCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(item.userDisplayName)}</Text>
      </View>
      <View style={styles.commentContent}>
        <Text style={styles.commentUser}>{item.userDisplayName}</Text>
        <Text style={styles.commentText}>{item.text}</Text>
        <Text style={styles.commentDate}>{formatDate(item.createdAt)}</Text>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View>
      {post && (
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(post.userDisplayName)}</Text>
            </View>
            <View>
              <Text style={styles.postUser}>{post.userDisplayName}</Text>
              <Text style={styles.postMeta}>{formatDate(post.createdAt)}</Text>
            </View>
          </View>
          <Text style={styles.postContent}>{post.content}</Text>
          <View style={styles.postStats}>
            <Ionicons name="heart-outline" size={14} color="#9CA3AF" />
            <Text style={styles.statText}>{post.reactionsCount} reacciones</Text>
            <Ionicons name="chatbubble-outline" size={14} color="#9CA3AF" style={styles.statIcon} />
            <Text style={styles.statText}>{post.commentsCount} comentarios</Text>
          </View>
        </View>
      )}
      <Text style={styles.sectionTitle}>Comentarios</Text>
      {isLoading && <ActivityIndicator color="#7C3AED" style={{ marginTop: 16 }} />}
      {!isLoading && comments.length === 0 && (
        <Text style={styles.emptyText}>Sé el primero en comentar</Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top + 60}
    >
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.topBarTitle}>Post</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={comments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderComment}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
        />

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Escribe un comentario..."
            placeholderTextColor="#6B7280"
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <Pressable
            onPress={handleSend}
            disabled={isSending || !commentText.trim()}
            style={[styles.sendButton, (!commentText.trim() || isSending) && styles.sendButtonDisabled]}
          >
            {isSending
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Ionicons name="send" size={18} color="#FFFFFF" />
            }
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: { padding: 4 },
  topBarTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  listContent: { padding: 16, paddingBottom: 8 },
  postCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  postUser: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  postMeta: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  postContent: { fontSize: 15, color: '#E5E7EB', lineHeight: 22 },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  statText: { fontSize: 12, color: '#9CA3AF', marginLeft: 4 },
  statIcon: { marginLeft: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
  emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 24 },
  commentCard: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#374151',
  },
  commentContent: { flex: 1, marginLeft: 10 },
  commentUser: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  commentText: { fontSize: 14, color: '#E5E7EB', lineHeight: 20 },
  commentDate: { fontSize: 11, color: '#6B7280', marginTop: 4 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#1F2937',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#374151',
  },
  sendButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: { backgroundColor: '#4B5563' },
});

export default PostDetailScreen;