import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Badge } from '../common/Badge';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../constants/orderStatus';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';

interface OrderCardProps {
  order: {
    id: string;
    status: string;
    total: number;
    createdAt: string;
    vendor?: { businessName: string };
    customer?: { name: string };
    items: Array<{ name: string; quantity: number }>;
  };
  onPress: () => void;
  role?: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onPress, role = 'CUSTOMER' }) => {
  const statusLabel = ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status;
  const statusColor = ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] || '#6B7280';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.header}>
        <Text style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</Text>
        <Badge label={statusLabel} bg={statusColor} color="#fff" />
      </View>
      {role === 'CUSTOMER' && order.vendor && (
        <Text style={styles.sub}>{order.vendor.businessName}</Text>
      )}
      {role !== 'CUSTOMER' && order.customer && (
        <Text style={styles.sub}>{order.customer.name}</Text>
      )}
      <Text style={styles.items} numberOfLines={1}>
        {order.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
        <Text style={styles.amount}>{formatCurrency(Number(order.total))}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  orderId: { fontSize: 13, fontWeight: '700', color: '#374151', fontFamily: 'monospace' },
  sub: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  items: { fontSize: 13, color: '#6B7280', marginBottom: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 12, color: '#9CA3AF' },
  amount: { fontSize: 16, fontWeight: '700', color: '#FF6B35' },
});
