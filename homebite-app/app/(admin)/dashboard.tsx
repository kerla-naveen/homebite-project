import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Loader } from '../../src/components/common/Loader';
import { adminApi } from '../../src/api/admin.api';
import { formatCurrency } from '../../src/utils/formatCurrency';

interface Stats {
  totalUsers: number;
  totalVendors: number;
  pendingVendors: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await adminApi.getDashboard();
      setStats(res.data.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return <Loader />;

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: '👥', color: '#3B82F6' },
    { label: 'Active Vendors', value: stats?.totalVendors ?? 0, icon: '🏪', color: '#10B981' },
    { label: 'Pending Approvals', value: stats?.pendingVendors ?? 0, icon: '⏳', color: '#F59E0B' },
    { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: '📦', color: '#8B5CF6' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} />}
      >
        <Text style={styles.title}>Admin Dashboard</Text>

        <View style={styles.revenueCard}>
          <Text style={styles.revenueLabel}>Total Revenue</Text>
          <Text style={styles.revenueValue}>{formatCurrency(stats?.totalRevenue ?? 0)}</Text>
        </View>

        <View style={styles.grid}>
          {cards.map((card) => (
            <View key={card.label} style={styles.card}>
              <Text style={styles.cardIcon}>{card.icon}</Text>
              <Text style={[styles.cardValue, { color: card.color }]}>{card.value}</Text>
              <Text style={styles.cardLabel}>{card.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', padding: 20, paddingBottom: 16 },
  revenueCard: {
    backgroundColor: '#FF6B35', marginHorizontal: 16, borderRadius: 16,
    padding: 20, marginBottom: 16,
  },
  revenueLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },
  revenueValue: { color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  card: {
    width: '47%', backgroundColor: '#fff', borderRadius: 14,
    padding: 16, alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  cardIcon: { fontSize: 28 },
  cardValue: { fontSize: 26, fontWeight: '800' },
  cardLabel: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
});
