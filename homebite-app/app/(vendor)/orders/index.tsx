import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrderCard } from '../../../src/components/order/OrderCard';
import { Loader } from '../../../src/components/common/Loader';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { orderApi } from '../../../src/api/order.api';

const STATUS_FILTERS = ['ALL', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'];

export default function VendorOrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const fetchOrders = async () => {
    try {
      const params: Record<string, string> = {};
      if (filter !== 'ALL') params.status = filter;
      const res = await orderApi.getVendorOrders(params);
      setOrders(res.data.data.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  if (loading) return <Loader />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Incoming Orders</Text>

      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.filterChip, filter === s && styles.filterChipActive]}
            onPress={() => { setFilter(s); setLoading(true); }}
          >
            <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>
              {s === 'ALL' ? 'All' : s.replace(/_/g, ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} />}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => router.push(`/(vendor)/orders/${item.id}`)}
            role="VENDOR"
          />
        )}
        ListEmptyComponent={
          <EmptyState icon="receipt-outline" title="No orders" subtitle="Orders will appear here" />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', padding: 20, paddingBottom: 12 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  filterChipActive: { borderColor: '#FF6B35', backgroundColor: '#FFF7ED' },
  filterText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  filterTextActive: { color: '#FF6B35' },
});
