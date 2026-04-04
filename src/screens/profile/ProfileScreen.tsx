import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthContext';
import { usePostContext } from '../../context/PostContext';
import { PostWithUser } from '../../models/Post';
import { formatDate } from '../../utils/helpers';

const { width: W } = Dimensions.get('window');

const ProfileScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthContext();
  const { posts, isLoading, loadPosts } = usePostContext();
  const [activeTab, setActiveTab] = useState<'storyline' | 'activity'>('activity');
  const [refreshing, setRefreshing] = useState(false);

  const userPosts = posts.filter((p) => p.userId === user?.id);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }, [loadPosts]);

  const getInitials = (name: string) =>
    name.split(' ').map((p) => p[0]).join('').substring(0, 2).toUpperCase();

  const renderPost = ({ item }: { item: PostWithUser }) => (
    <View style={s.activityCard}>
      <View style={s.activityHeader}>
        <Text style={s.activityMeta}>{formatDate(item.createdAt)}</Text>
        {item.communityName ? (
          <Text style={s.activityCommunity}>· {item.communityName}</Text>
        ) : null}
      </View>
      <Text style={s.activityContent}>{item.content}</Text>
      <View style={s.activityStats}>
        <Ionicons name="heart-outline" size={13} color="#6B7280" />
        <Text style={s.statText}>{item.reactionsCount}</Text>
        <Ionicons name="chatbubble-outline" size={13} color="#6B7280" style={s.statIcon} />
        <Text style={s.statText}>{item.commentsCount}</Text>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View>
      <View style={s.coverContainer}>
        <View style={s.cover}>
          <Ionicons name="people" size={40} color="#7C3AED" style={{ opacity: 0.3 }} />
        </View>
        <View style={s.avatarLg}>
          <Text style={s.avatarLgText}>{getInitials(user?.displayName || 'U')}</Text>
        </View>
      </View>

      <View style={s.infoSection}>
        <Text style={s.displayName}>{user?.displayName || 'User'}</Text>
        <Text style={s.roleText}>{user?.role || 'Member'} · {user?.department || 'General'}</Text>
      </View>

      <View style={s.statsRow}>
        <View style={s.statBox}>
          <Text style={s.statNumber}>{user?.communitiesCount || 0}</Text>
          <Text style={s.statLabel}>Communities</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statNumber}>{user?.followersCount || 0}</Text>
          <Text style={s.statLabel}>Followers</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statNumber}>{user?.followingCount || 0}</Text>
          <Text style={s.statLabel}>Following</Text>
        </View>
      </View>

      <View style={s.tabs}>
        <Pressable
          style={[s.tab, activeTab === 'storyline' && s.tabActive]}
          onPress={() => setActiveTab('storyline')}
        >
          <Text style={[s.tabText, activeTab === 'storyline' && s.tabTextActive]}>Storyline</Text>
        </Pressable>
        <Pressable
          style={[s.tab, activeTab === 'activity' && s.tabActive]}
          onPress={() => setActiveTab('activity')}
        >
          <Text style={[s.tabText, activeTab === 'activity' && s.tabTextActive]}>
            All Activity ({userPosts.length})
          </Text>
        </Pressable>
      </View>

      {activeTab === 'storyline' && (
        <View style={s.emptyContainer}>
          <Ionicons name="document-text-outline" size={48} color="#374151" />
          <Text style={s.emptyText}>No storyline yet</Text>
        </View>
      )}

      {activeTab === 'activity' && isLoading && !refreshing && (
        <ActivityIndicator color="#7C3AED" style={{ marginTop: 24 }} />
      )}

      {activeTab === 'activity' && !isLoading && userPosts.length === 0 && (
        <View style={s.emptyContainer}>
          <Ionicons name="newspaper-outline" size={48} color="#374151" />
          <Text style={s.emptyText}>No posts yet</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Profile</Text>
        <Pressable onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={22} color="#E5E7EB" />
        </Pressable>
      </View>

      <FlatList
        data={activeTab === 'activity' ? userPosts : []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={s.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />
        }
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#374151' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#F9FAFB' },
  listContent: { paddingBottom: 100 },
  coverContainer: { position: 'relative', marginBottom: 50 },
  cover: { height: 120, backgroundColor: '#1E3A5F', alignItems: 'center', justifyContent: 'center' },
  avatarLg: { position: 'absolute', bottom: -40, left: 20, width: 80, height: 80, borderRadius: 40, backgroundColor: '#374151', borderWidth: 3, borderColor: '#111827', alignItems: 'center', justifyContent: 'center' },
  avatarLgText: { color: '#E5E7EB', fontSize: 24, fontWeight: '700' },
  infoSection: { paddingHorizontal: 20, marginTop: 8 },
  displayName: { fontSize: 22, fontWeight: '700', color: '#F9FAFB' },
  roleText: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 20, gap: 10 },
  statBox: { flex: 1, backgroundColor: '#1F2937', borderRadius: 10, borderWidth: 0.5, borderColor: '#374151', paddingVertical: 14, alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: '700', color: '#F9FAFB' },
  statLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 20, borderBottomWidth: 0.5, borderBottomColor: '#374151' },
  tab: { paddingBottom: 12, marginRight: 24, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#7C3AED' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#7C3AED' },
  activityCard: { backgroundColor: '#1F2937', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 16, borderWidth: 0.5, borderColor: '#374151' },
  activityHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 4 },
  activityMeta: { fontSize: 12, color: '#9CA3AF' },
  activityCommunity: { fontSize: 12, color: '#9CA3AF' },
  activityContent: { fontSize: 14, color: '#E5E7EB', lineHeight: 21 },
  activityStats: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: '#374151' },
  statText: { fontSize: 12, color: '#6B7280', marginLeft: 4 },
  statIcon: { marginLeft: 12 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 48, gap: 12 },
  emptyText: { fontSize: 14, color: '#6B7280' },
});

export default ProfileScreen;