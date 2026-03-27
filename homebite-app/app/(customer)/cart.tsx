import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Loader } from '../../src/components/common/Loader';
import { Button } from '../../src/components/common/Button';
import { EmptyState } from '../../src/components/common/EmptyState';
import { cartApi } from '../../src/api/cart.api';
import { useCartStore } from '../../src/store/cartStore';
import { formatCurrency } from '../../src/utils/formatCurrency';

export default function CartScreen() {
  const { items, subtotal, setCart } = useCartStore();
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await cartApi.get();
      const cart = res.data.data;
      setCart(cart.items || [], cart.vendorId, cart.subtotal);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCart(); }, []);

  const handleUpdateQty = async (foodItemId: string, qty: number) => {
    try {
      await cartApi.updateItem(foodItemId, qty);
      fetchCart();
    } catch {}
  };

  const handleRemove = async (foodItemId: string) => {
    try {
      await cartApi.removeItem(foodItemId);
      fetchCart();
    } catch {}
  };

  const handleClear = () => {
    Alert.alert('Clear Cart', 'Remove all items from cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => { await cartApi.clear(); fetchCart(); } },
    ]);
  };

  if (loading) return <Loader />;

  const DELIVERY_FEE = 40;
  const total = subtotal + DELIVERY_FEE;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Cart</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearBtn}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <EmptyState icon="bag-outline" title="Your cart is empty" subtitle="Add items from a home kitchen to get started" />
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemName}>{item.foodItem.name}</Text>
                  <Text style={styles.itemPrice}>
                    {formatCurrency(Number(item.foodItem.discountedPrice || item.foodItem.price))}
                  </Text>
                </View>
                <View style={styles.qtyRow}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => handleUpdateQty(item.foodItemId, item.quantity - 1)}>
                    <Ionicons name={item.quantity === 1 ? 'trash-outline' : 'remove'} size={16} color="#FF6B35" />
                  </TouchableOpacity>
                  <Text style={styles.qty}>{item.quantity}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => handleUpdateQty(item.foodItemId, item.quantity + 1)}>
                    <Ionicons name="add" size={16} color="#FF6B35" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>{formatCurrency(DELIVERY_FEE)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>
            <Button title="Proceed to Checkout" onPress={() => router.push('/(customer)/checkout')} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  clearBtn: { fontSize: 15, color: '#EF4444', fontWeight: '600' },
  item: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  itemLeft: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  itemPrice: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 8, borderWidth: 1.5,
    borderColor: '#FF6B35', justifyContent: 'center', alignItems: 'center',
  },
  qty: { fontSize: 16, fontWeight: '700', color: '#111827', minWidth: 20, textAlign: 'center' },
  summary: {
    backgroundColor: '#fff', padding: 20,
    borderTopWidth: 1, borderTopColor: '#F3F4F6', gap: 12,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 15, color: '#6B7280' },
  summaryValue: { fontSize: 15, color: '#111827' },
  totalRow: { paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', marginBottom: 4 },
  totalLabel: { fontSize: 17, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 17, fontWeight: '700', color: '#FF6B35' },
});
