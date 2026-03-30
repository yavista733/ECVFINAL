import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthContext';
import { usePostContext } from '../../context/PostContext';
import SyncStatusIndicator from '../../components/Common/SyncStatusIndicator';
import { formatDate } from '../../utils/helpers';
import { ReactionType } from '../../models/Post';

const REACTION_ICONS: Record<ReactionType, { name: string; color: string }> = {
  like: { name: 'thumbs-up', color: '#7C3AED' },
  celebrate: { name: 'sparkles', color: '#F59E0B' },
  support: { name: 'heart', color: '#EF4444' },
  insightful: { name: 'bulb', color: '#10B981' },
};

const FeedScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthContext();
  const { posts, isLoading, loadPosts, toggleReaction } = usePostContext();

  const getInitials = (name: string) => name.split(' ').map(p => p[0]).join('').substring(0, 2);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.avatarSm}>
            <Text style={s.avatarText}>{getInitials(user?.displayName || 'U')}</Text>
          </View>
          <Text style={s.headerTitle}>Home Feed</Text>
        </View>
        <View style={s.headerRight}>
          <SyncStatusIndicator />
          <Pressable style={s.headerIcon}><Ionicons name="search-outline" size={22} color="#E5E7EB" /></Pressable>
          <Pressable style={s.headerIcon}><Ionicons name="notifications-outline" size={22} color="#E5E7EB" /></Pressable>
        </View>
      </View>

      <ScrollView style={s.feed} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadPosts} tintColor="#7C3AED" />}>
        {posts.length === 0 && !isLoading ? (
          <View style={s.emptyState}>
            <Ionicons name="newspaper-outline" size={48} color="#374151" />
            <Text style={s.emptyTitle}>No hay posts</Text>
            <Text style={s.emptyText}>Crea el primer post de tu red corporativa</Text>
          </View>
        ) : null}

        {posts.map((post) => (
          <View key={post.id} style={s.postCard}>
            <View style={s.postHeader}>
              <View style={s.postAvatar}><Text style={s.postAvatarText}>{getInitials(post.userDisplayName || 'U')}</Text></View>
              <View style={s.postHeaderText}>
                <Text style={s.postUserName}>{post.userDisplayName}</Text>
                <Text style={s.postMeta}>{formatDate(post.createdAt)} · {post.communityName || 'General'}</Text>
              </View>
              <Pressable><Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" /></Pressable>
            </View>

            <Text style={s.postContent}>{post.content}</Text>

            {post.reactionsCount > 0 ? (
              <View style={s.reactedRow}>
                <Text style={s.reactedEmoji}>👍</Text>
                <Text style={s.reactedText}>{post.reactionsCount} reactions</Text>
              </View>
            ) : null}

            <View style={s.postActions}>
              <View style={s.postActionsLeft}>
                {(Object.keys(REACTION_ICONS) as ReactionType[]).slice(0, 1).map((rType) => {
                  const isActive = post.userReaction === rType;
                  return (
                    <Pressable key={rType} style={s.actionBtn} onPress={() => toggleReaction(post.id, rType)}>
                      <Ionicons
                        name={(isActive ? REACTION_ICONS[rType].name : REACTION_ICONS[rType].name + '-outline') as any}
                        size={20}
                        color={isActive ? REACTION_ICONS[rType].color : '#9CA3AF'}
                      />
                      <Text style={[s.actionText, isActive && { color: REACTION_ICONS[rType].color }]}>
                        {post.reactionsCount || ''}
                      </Text>
                    </Pressable>
                  );
                })}
                <Pressable style={s.actionBtn} onPress={() => navigation.navigate('PostDetail', { postId: post.id })}>
                  <Ionicons name="chatbubble-outline" size={18} color="#9CA3AF" />
                  <Text style={s.actionText}>{post.commentsCount || ''}</Text>
                </Pressable>
                <Pressable style={s.actionBtn}>
                  <Ionicons name="share-social-outline" size={18} color="#9CA3AF" />
                  <Text style={s.actionText}>{post.sharesCount || ''}</Text>
                </Pressable>
              </View>
              <View style={s.viewsRow}>
                <Ionicons name="eye-outline" size={16} color="#6B7280" />
                <Text style={s.viewsText}>{post.viewsCount}</Text>
              </View>
            </View>
          </View>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>

      <Pressable style={s.fab} onPress={() => navigation.navigate('CreatePost')}>
        <Ionicons name="create-outline" size={24} color="#fff" />
      </Pressable>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#374151' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIcon: { padding: 4 },
  avatarSm: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#F9FAFB' },
  feed: { flex: 1 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#6B7280', marginTop: 16 },
  emptyText: { fontSize: 13, color: '#4B5563', marginTop: 4 },
  postCard: { backgroundColor: '#1F2937', marginHorizontal: 12, marginTop: 12, borderRadius: 12, padding: 16, borderWidth: 0.5, borderColor: '#374151' },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  postAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#374151', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  postAvatarText: { color: '#E5E7EB', fontSize: 15, fontWeight: '700' },
  postHeaderText: { flex: 1 },
  postUserName: { fontSize: 15, fontWeight: '700', color: '#F9FAFB' },
  postMeta: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  postContent: { fontSize: 14, color: '#E5E7EB', lineHeight: 21, marginBottom: 12 },
  reactedRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#374151' },
  reactedEmoji: { fontSize: 16, marginRight: 6 },
  reactedText: { fontSize: 12, color: '#9CA3AF' },
  postActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  postActionsLeft: { flexDirection: 'row', gap: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { fontSize: 13, color: '#9CA3AF' },
  viewsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewsText: { fontSize: 12, color: '#6B7280' },
  fab: { position: 'absolute', bottom: 90, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
});

export default FeedScreen;