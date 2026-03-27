import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Badge } from '../../../src/components/common/Badge';
import { Loader } from '../../../src/components/common/Loader';
import { adminApi } from '../../../src/api/admin.api';
import { formatDate } from '../../../src/utils/formatCurrency';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data.data.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleBlock = (user: any) => {
    Alert.alert(
      user.isBlocked ? 'Unblock User' : 'Block User',
      `${user.isBlocked ? 'Unblock' : 'Block'} ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: user.isBlocked ? 'Unblock' : 'Block',
          style: user.isBlocked ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await adminApi.toggleBlockUser(user.id);
              fetchUsers();
              Toast.show({ type: 'success', text1: `User ${user.isBlocked ? 'unblocked' : 'blocked'}` });
            } catch {
              Toast.show({ type: 'error', text1: 'Action failed' });
            }
          },
        },
      ]
    );
  };

  if (loading) return <Loader />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Users</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.left}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <Text style={styles.date}>Joined {formatDate(item.createdAt)}</Text>
              </View>
            </View>
            <View style={styles.right}>
              <Badge
                label={item.role}
                bg={item.role === 'VENDOR' ? '#EDE9FE' : '#DBEAFE'}
                color={item.role === 'VENDOR' ? '#5B21B6' : '#1D4ED8'}
              />
              <TouchableOpacity
                style={[styles.blockBtn, item.isBlocked && styles.unblockBtn]}
                onPress={() => handleToggleBlock(item)}
              >
                <Text style={[styles.blockBtnText, item.isBlocked && styles.unblockBtnText]}>
                  {item.isBlocked ? 'Unblock' : 'Block'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', padding: 20, paddingBottom: 12 },
  card: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  name: { fontSize: 15, fontWeight: '600', color: '#111827' },
  email: { fontSize: 12, color: '#6B7280' },
  date: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 8 },
  blockBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: '#EF4444' },
  unblockBtn: { borderColor: '#10B981' },
  blockBtnText: { fontSize: 12, color: '#EF4444', fontWeight: '600' },
  unblockBtnText: { color: '#10B981' },
});
