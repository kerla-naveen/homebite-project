import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../../src/components/common/Badge';
import { Loader } from '../../../src/components/common/Loader';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { adminApi } from '../../../src/api/admin.api';

const STATUS_FILTERS = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: '#FEF3C7', color: '#92400E' },
  APPROVED: { bg: '#D1FAE5', color: '#065F46' },
  REJECTED: { bg: '#FEE2E2', color: '#991B1B' },
  SUSPENDED: { bg: '#F3F4F6', color: '#374151' },
};

export default function AdminVendorsScreen() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('PENDING');

  const fetchVendors = async () => {
    try {
      const res = await adminApi.getAllVendors({ status: filter });
      setVendors(res.data.data.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchVendors(); }, [filter]);

  if (loading) return <Loader />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Vendors</Text>

      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.filterChip, filter === s && styles.filterChipActive]}
            onPress={() => { setFilter(s); setLoading(true); }}
          >
            <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={vendors}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchVendors(); }} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(admin)/vendors/${item.id}`)}
          >
            <View>
              <Text style={styles.bizName}>{item.businessName}</Text>
              <Text style={styles.ownerName}>{item.user?.name} · {item.city}</Text>
              <Text style={styles.email}>{item.user?.email}</Text>
            </View>
            <Badge
              label={item.status}
              bg={STATUS_COLORS[item.status]?.bg || '#F3F4F6'}
              color={STATUS_COLORS[item.status]?.color || '#374151'}
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState icon="storefront-outline" title={`No ${filter.toLowerCase()} vendors`} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', padding: 20, paddingBottom: 12 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  filterChipActive: { borderColor: '#FF6B35', backgroundColor: '#FFF7ED' },
  filterText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  filterTextActive: { color: '#FF6B35' },
  card: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  bizName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  ownerName: { fontSize: 13, color: '#6B7280', marginTop: 3 },
  email: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
});
