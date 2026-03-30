import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthContext';
import SyncStatusIndicator from '../../components/Common/SyncStatusIndicator';

const DEMO_POSTS = [
  {
    id: 1, userName: 'Sarah Johnson', userRole: 'Senior Product Manager', timeAgo: '2h ago', community: 'General',
    content: 'Excited to announce our new Q2 product roadmap! We\'ve received incredible feedback from our beta testers and can\'t wait to share what\'s coming next. Big thanks to the entire team for making this happen! 🚀',
    imageUrl: '', reactions: 24, comments: 8, shares: 3, views: 156, reactedBy: 'Marcus Chen, Emily Roberts',
  },
  {
    id: 2, userName: 'David Martinez', userRole: 'Engineering Lead', timeAgo: '5h ago', community: 'Engineering',
    content: 'Great team meeting today! Looking forward to collaborating with everyone on the upcoming projects. Let\'s make this quarter amazing! 💪',
    imageUrl: '', reactions: 12, comments: 4, shares: 1, views: 89, reactedBy: 'Sarah Johnson, David Martinez',
  },
  {
    id: 3, userName: 'Jennifer Smith', userRole: 'HR Director', timeAgo: '1d ago', community: 'Announcements',
    content: '📢 ANNOUNCEMENT: All-Hands Meeting Tomorrow at 10 AM. We\'ll be discussing Q1 results and our plans for the rest of the year. Please make sure to attend!',
    imageUrl: '', reactions: 45, comments: 12, shares: 8, views: 312, reactedBy: 'Emily Roberts, Marcus Chen',
  },
];

const FeedScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthContext();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

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

      <ScrollView style={s.feed} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />}>
        {DEMO_POSTS.map((post) => (
          <View key={post.id} style={s.postCard}>
            <View style={s.postHeader}>
              <View style={s.postAvatar}><Text style={s.postAvatarText}>{getInitials(post.userName)}</Text></View>
              <View style={s.postHeaderText}>
                <Text style={s.postUserName}>{post.userName}</Text>
                <Text style={s.postMeta}>{post.timeAgo} · {post.community}</Text>
              </View>
              <Pressable><Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" /></Pressable>
            </View>

            <Text style={s.postContent}>{post.content}</Text>

            <View style={s.reactedRow}>
              <Text style={s.reactedEmoji}>👍</Text>
              <Text style={s.reactedText}>{post.reactedBy}</Text>
            </View>

            <View style={s.postActions}>
              <View style={s.postActionsLeft}>
                <Pressable style={s.actionBtn}><Ionicons name="thumbs-up-outline" size={20} color="#9CA3AF" /><Text style={s.actionText}>{post.reactions}</Text></Pressable>
                <Pressable style={s.actionBtn}><Ionicons name="chatbubble-outline" size={18} color="#9CA3AF" /><Text style={s.actionText}>{post.comments}</Text></Pressable>
                <Pressable style={s.actionBtn}><Ionicons name="share-social-outline" size={18} color="#9CA3AF" /><Text style={s.actionText}>{post.shares}</Text></Pressable>
              </View>
              <View style={s.viewsRow}><Ionicons name="eye-outline" size={16} color="#6B7280" /><Text style={s.viewsText}>{post.views}</Text></View>
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
