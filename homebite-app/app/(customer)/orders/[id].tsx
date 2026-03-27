import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Badge } from '../../../src/components/common/Badge';
import { Button } from '../../../src/components/common/Button';
import { Loader } from '../../../src/components/common/Loader';
import { OrderTracker } from '../../../src/components/order/OrderTracker';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../../src/constants/orderStatus';
import { orderApi } from '../../../src/api/order.api';
import { formatCurrency, formatDate } from '../../../src/utils/formatCurrency';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    orderApi.getById(id).then((res) => setOrder(res.data.data)).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            await orderApi.cancel(id);
            const res = await orderApi.getById(id);
            setOrder(res.data.data);
            Toast.show({ type: 'success', text1: 'Order cancelled' });
          } catch (err: any) {
            Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to cancel' });
          } finally { setCancelling(false); }
        },
      },
    ]);
  };

  if (loading) return <Loader />;
  if (!order) return null;

  const statusLabel = ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status;
  const statusColor = ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] || '#6B7280';
  const canCancel = ['PENDING_PAYMENT', 'CONFIRMED'].includes(order.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Order Detail</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</Text>
            <Badge label={statusLabel} bg={statusColor} color="#fff" />
          </View>
          <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
          <Text style={styles.vendor}>{order.vendor?.businessName}</Text>
        </View>

        {/* Order tracking stepper */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <OrderTracker status={order.status} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items.map((item: any) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name} × {item.quantity}</Text>
              <Text style={styles.itemPrice}>{formatCurrency(Number(item.total))}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.label}>Subtotal</Text>
            <Text>{formatCurrency(Number(order.subtotal))}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.label}>Delivery Fee</Text>
            <Text>{formatCurrency(Number(order.deliveryFee))}</Text>
          </View>
          <View style={[styles.itemRow, { marginTop: 8 }]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(Number(order.total))}</Text>
          </View>
        </View>

        {order.address && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <Text style={styles.addrLabel}>{order.address.label}</Text>
            <Text style={styles.addrText}>{order.address.line1}</Text>
            <Text style={styles.addrText}>{order.address.city}, {order.address.state} - {order.address.pincode}</Text>
          </View>
        )}

        {order.payment && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Status</Text>
              <Badge label={order.payment.status} bg={order.payment.status === 'SUCCESS' ? '#D1FAE5' : '#FEE2E2'} color={order.payment.status === 'SUCCESS' ? '#065F46' : '#991B1B'} />
            </View>
          </View>
        )}

        {canCancel && (
          <Button title="Cancel Order" onPress={handleCancel} loading={cancelling} variant="danger" />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 13, fontWeight: '700', color: '#374151', fontFamily: 'monospace' },
  date: { fontSize: 13, color: '#9CA3AF' },
  vendor: { fontSize: 16, fontWeight: '600', color: '#111827' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { fontSize: 14, color: '#374151', flex: 1 },
  itemPrice: { fontSize: 14, color: '#374151' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },
  label: { fontSize: 14, color: '#6B7280' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 16, fontWeight: '700', color: '#FF6B35' },
  addrLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  addrText: { fontSize: 13, color: '#6B7280' },
});
