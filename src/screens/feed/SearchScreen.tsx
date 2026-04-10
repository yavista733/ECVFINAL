import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { executeQuery } from '../../database/db';

interface UserResult {
  id: number;
  displayName: string;
  role: string;
  department: string;
  email: string;
}

const SearchScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const getInitials = (name: string) =>
    name.split(' ').map((p) => p[0]).join('').substring(0, 2).toUpperCase();

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (text.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setIsLoading(true);
    setSearched(true);
    try {
      const users = await executeQuery(
        `SELECT id, displayName, role, department, email
         FROM users
         WHERE displayName LIKE ? OR department LIKE ? OR role LIKE ?
         ORDER BY displayName ASC
         LIMIT 20`,
        [`%${text}%`, `%${text}%`, `%${text}%`],
      );
      setResults(users);
    } catch (error) {
      console.error('❌ SearchScreen.handleSearch:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renderUser = ({ item }: { item: UserResult }) => (
    <View style={s.userCard}>
      <View style={s.avatar}>
        <Text style={s.avatarText}>{getInitials(item.displayName)}</Text>
      </View>
      <View style={s.userInfo}>
        <Text style={s.userName}>{item.displayName}</Text>
        <Text style={s.userMeta}>{item.role} · {item.department}</Text>
        <Text style={s.userEmail}>{item.email}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#6B7280" />
    </View>
  );

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View style={s.searchBar}>
          <Ionicons name="search-outline" size={18} color="#6B7280" />
          <TextInput
            style={s.searchInput}
            placeholder="Buscar personas, roles, departamentos..."
            placeholderTextColor="#6B7280"
            value={query}
            onChangeText={handleSearch}
            autoFocus
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
              <Ionicons name="close-circle" size={18} color="#6B7280" />
            </Pressable>
          )}
        </View>
      </View>

      {isLoading && (
        <ActivityIndicator color="#7C3AED" style={{ marginTop: 32 }} />
      )}

      {!isLoading && searched && results.length === 0 && (
        <View style={s.emptyContainer}>
          <Ionicons name="person-outline" size={48} color="#374151" />
          <Text style={s.emptyText}>No se encontraron usuarios</Text>
          <Text style={s.emptySubText}>Intenta con otro nombre o departamento</Text>
        </View>
      )}

      {!isLoading && !searched && (
        <View style={s.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#374151" />
          <Text style={s.emptyText}>Busca personas en tu empresa</Text>
          <Text style={s.emptySubText}>Escribe al menos 2 caracteres</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUser}
        contentContainerStyle={s.listContent}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#374151', gap: 12 },
  backBtn: { padding: 4 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F2937', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, gap: 8, borderWidth: 0.5, borderColor: '#374151' },
  searchInput: { flex: 1, color: '#F9FAFB', fontSize: 14 },
  listContent: { paddingHorizontal: 16, paddingTop: 12 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F2937', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: '#374151', gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '700', color: '#F9FAFB' },
  userMeta: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  userEmail: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  emptyContainer: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
  emptySubText: { fontSize: 13, color: '#4B5563' },
});

export default SearchScreen;