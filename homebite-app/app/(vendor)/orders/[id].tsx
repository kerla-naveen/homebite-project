import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Badge } from '../../../src/components/common/Badge';
import { Loader } from '../../../src/components/common/Loader';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ORDER_STATUS } from '../../../src/constants/orderStatus';
import { orderApi } from '../../../src/api/order.api';
import { formatCurrency, formatDate } from '../../../src/utils/formatCurrency';

const NEXT_STATUS: Record<string, string> = {
  CONFIRMED: 'PREPARING',
  PREPARING: 'READY_FOR_PICKUP',
  READY_FOR_PICKUP: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
};

const NEXT_STATUS_LABEL: Record<string, string> = {
  CONFIRMED: 'Start Preparing',
  PREPARING: 'Mark Ready',
  READY_FOR_PICKUP: 'Dispatched',
  OUT_FOR_DELIVERY: 'Mark Delivered',
};

export default function VendorOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await orderApi.getById(id);
      setOrder(res.data.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrder(); }, []);

  const handleUpdateStatus = async () => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;

    Alert.alert('Update Status', `Change order status to "${ORDER_STATUS_LABELS[next as keyof typeof ORDER_STATUS_LABELS]}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          setUpdating(true);
          try {
            await orderApi.updateStatus(id, next);
            fetchOrder();
            Toast.show({ type: 'success', text1: 'Status updated' });
          } catch (err: any) {
            Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to update' });
          } finally { setUpdating(false); }
        },
      },
    ]);
  };

  if (loading) return <Loader />;
  if (!order) return null;

  const statusLabel = ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status;
  const statusColor = ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] || '#6B7280';
  const nextStatusLabel = NEXT_STATUS_LABEL[order.status];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Order #{order.id.slice(-8).toUpperCase()}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 100 }}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Badge label={statusLabel} bg={statusColor} color="#fff" />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Placed</Text>
            <Text style={styles.value}>{formatDate(order.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer</Text>
          <Text style={styles.value}>{order.customer?.name}</Text>
          {order.customer?.phone && <Text style={styles.meta}>{order.customer.phone}</Text>}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          {order.address && (
            <>
              <Text style={styles.value}>{order.address.line1}</Text>
              <Text style={styles.meta}>{order.address.city}, {order.address.state} - {order.address.pincode}</Text>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items.map((item: any) => (
            <View key={item.id} style={styles.row}>
              <Text style={{ flex: 1 }}>{item.name} × {item.quantity}</Text>
              <Text>{formatCurrency(Number(item.total))}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(Number(order.total))}</Text>
          </View>
        </View>

        {order.notes && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <Text style={styles.meta}>{order.notes}</Text>
          </View>
        )}
      </ScrollView>

      {nextStatusLabel && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.updateBtn, updating && { opacity: 0.6 }]}
            onPress={handleUpdateStatus}
            disabled={updating}
          >
            <Text style={styles.updateBtnText}>{nextStatusLabel}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 17, fontWeight: '700', color: '#111827' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  label: { fontSize: 14, color: '#6B7280' },
  value: { fontSize: 15, fontWeight: '500', color: '#111827' },
  meta: { fontSize: 13, color: '#6B7280' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 16, fontWeight: '700', color: '#FF6B35' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  updateBtn: {
    height: 52, borderRadius: 12, backgroundColor: '#FF6B35',
    justifyContent: 'center', alignItems: 'center',
  },
  updateBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
