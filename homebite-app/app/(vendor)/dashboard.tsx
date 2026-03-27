import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Loader } from '../../src/components/common/Loader';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { vendorApi } from '../../src/api/vendor.api';
import { orderApi } from '../../src/api/order.api';
import { useAuthStore } from '../../src/store/authStore';
import { formatCurrency } from '../../src/utils/formatCurrency';

export default function VendorDashboard() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toggling, setToggling] = useState(false);

  const fetchData = async () => {
    try {
      const [profileRes, ordersRes] = await Promise.all([
        vendorApi.getMyProfile(),
        orderApi.getVendorOrders({ limit: '5' }),
      ]);
      setProfile(profileRes.data.data);
      setOrders(ordersRes.data.data.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Vendor not onboarded yet
      }
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggleOrders = async (value: boolean) => {
    setToggling(true);
    try {
      await vendorApi.updateMyProfile({ isAcceptingOrders: value });
      setProfile((p: any) => ({ ...p, isAcceptingOrders: value }));
      Toast.show({ type: 'success', text1: value ? 'Now accepting orders' : 'Stopped accepting orders' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update status' });
    } finally { setToggling(false); }
  };

  if (loading) return <Loader />;

  if (!profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.onboardingPrompt}>
          <Text style={styles.emoji}>👨‍🍳</Text>
          <Text style={styles.onboardTitle}>Complete your vendor profile</Text>
          <Text style={styles.onboardDesc}>Set up your home kitchen to start receiving orders</Text>
          <Button title="Get Started" onPress={() => router.push('/(vendor)/onboarding')} />
        </View>
      </SafeAreaView>
    );
  }

  const isPending = profile.status === 'PENDING';
  const isRejected = profile.status === 'REJECTED';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.kitchenName}>{profile.businessName}</Text>
          </View>
          <Badge
            label={profile.status}
            bg={profile.status === 'APPROVED' ? '#D1FAE5' : profile.status === 'PENDING' ? '#FEF3C7' : '#FEE2E2'}
            color={profile.status === 'APPROVED' ? '#065F46' : profile.status === 'PENDING' ? '#92400E' : '#991B1B'}
          />
        </View>

        {isPending && (
          <View style={styles.alertCard}>
            <Ionicons name="time-outline" size={20} color="#92400E" />
            <Text style={styles.alertText}>Your account is under review. We'll notify you once approved.</Text>
          </View>
        )}

        {isRejected && (
          <View style={[styles.alertCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
            <Ionicons name="close-circle-outline" size={20} color="#991B1B" />
            <Text style={[styles.alertText, { color: '#991B1B' }]}>
              Application rejected: {profile.rejectionReason || 'No reason provided'}
            </Text>
          </View>
        )}

        {profile.status === 'APPROVED' && (
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Accepting Orders</Text>
            <Switch
              value={profile.isAcceptingOrders}
              onValueChange={handleToggleOrders}
              disabled={toggling}
              trackColor={{ false: '#D1D5DB', true: '#FF6B35' }}
              thumbColor="#fff"
            />
          </View>
        )}

        {/* Recent Orders */}
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        {orders.length === 0 ? (
          <Text style={styles.empty}>No orders yet</Text>
        ) : (
          orders.map((order) => (
            <TouchableOpacity key={order.id} style={styles.orderCard} onPress={() => router.push(`/(vendor)/orders/${order.id}`)}>
              <View>
                <Text style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</Text>
                <Text style={styles.customerName}>{order.customer?.name}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.amount}>{formatCurrency(Number(order.total))}</Text>
                <Badge label={order.status} bg="#FFF7ED" color="#FF6B35" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, paddingBottom: 8 },
  greeting: { fontSize: 15, color: '#6B7280' },
  kitchenName: { fontSize: 22, fontWeight: '700', color: '#111827', marginTop: 2 },
  onboardingPrompt: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 },
  emoji: { fontSize: 64 },
  onboardTitle: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center' },
  onboardDesc: { fontSize: 15, color: '#6B7280', textAlign: 'center' },
  alertCard: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A',
    margin: 16, padding: 14, borderRadius: 12,
  },
  alertText: { flex: 1, fontSize: 14, color: '#92400E' },
  statusCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', margin: 16, padding: 16, borderRadius: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  statusLabel: { fontSize: 16, fontWeight: '600', color: '#111827' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginLeft: 16, marginTop: 8, marginBottom: 10 },
  empty: { textAlign: 'center', color: '#9CA3AF', padding: 24 },
  orderCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8,
    padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6',
  },
  orderId: { fontSize: 12, fontWeight: '700', color: '#374151', fontFamily: 'monospace' },
  customerName: { fontSize: 15, fontWeight: '600', color: '#111827', marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '700', color: '#FF6B35', marginBottom: 4 },
});
