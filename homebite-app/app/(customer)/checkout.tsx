import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Button } from '../../src/components/common/Button';
import { Loader } from '../../src/components/common/Loader';
import { orderApi } from '../../src/api/order.api';
import { useCartStore } from '../../src/store/cartStore';
import { useRazorpay } from '../../src/hooks/useRazorpay';
import { RazorpayWebView } from '../../src/components/payment/RazorpayWebView';
import { formatCurrency } from '../../src/utils/formatCurrency';
import api from '../../src/api/axiosInstance';

export default function CheckoutScreen() {
  const { items, subtotal, clearLocalCart } = useCartStore();
  const { paymentOptions, openPayment, resolvePayment } = useRazorpay();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [notes, setNotes] = useState('');

  const DELIVERY_FEE = 40;
  const total = subtotal + DELIVERY_FEE;

  useEffect(() => {
    api.get('/users/me/addresses').then((res) => {
      const addrs = res.data.data;
      setAddresses(addrs);
      const def = addrs.find((a: any) => a.isDefault);
      if (def) setSelectedAddressId(def.id);
    }).finally(() => setLoading(false));
  }, []);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      Toast.show({ type: 'error', text1: 'Please select a delivery address' });
      return;
    }

    // Step 1: place the order
    setPlacing(true);
    let orderId: string;
    try {
      const res = await orderApi.place(selectedAddressId, notes || undefined);
      orderId = res.data.data.id;
      clearLocalCart();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to place order' });
      setPlacing(false);
      return;
    }
    setPlacing(false);

    // Step 2: launch Razorpay checkout
    setPaying(true);
    try {
      const result = await openPayment(orderId);
      if (result === 'success') {
        Toast.show({ type: 'success', text1: 'Payment successful!', text2: 'Your order is confirmed.' });
      } else if (result === 'cancelled') {
        Toast.show({ type: 'info', text1: 'Payment cancelled', text2: 'Pay from Order Details to confirm your order.' });
      } else {
        Toast.show({ type: 'error', text1: 'Payment failed', text2: 'You can retry from Order Details.' });
      }
    } finally {
      setPaying(false);
      router.replace(`/(customer)/orders/${orderId}`);
    }
  };

  if (loading) return <Loader />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 120 }}>
        {/* Address Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          {addresses.length === 0 ? (
            <Text style={styles.noAddress}>No addresses saved. Please add an address in your profile.</Text>
          ) : (
            addresses.map((addr) => (
              <TouchableOpacity
                key={addr.id}
                style={[styles.addrCard, selectedAddressId === addr.id && styles.addrCardSelected]}
                onPress={() => setSelectedAddressId(addr.id)}
              >
                <View style={styles.addrRadio}>
                  {selectedAddressId === addr.id && <View style={styles.addrRadioInner} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.addrLabel}>{addr.label}</Text>
                  <Text style={styles.addrText}>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</Text>
                  <Text style={styles.addrText}>{addr.city}, {addr.state} - {addr.pincode}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={styles.itemName}>{item.foodItem.name} × {item.quantity}</Text>
              <Text style={styles.itemPrice}>
                {formatCurrency(Number(item.foodItem.discountedPrice || item.foodItem.price) * item.quantity)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.orderItem}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.orderItem}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text>{formatCurrency(DELIVERY_FEE)}</Text>
          </View>
          <View style={[styles.orderItem, { marginTop: 8 }]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        <View style={styles.paymentNote}>
          <Ionicons name="lock-closed-outline" size={20} color="#FF6B35" />
          <Text style={styles.paymentText}>Secured payment via Razorpay · UPI, Cards, Net Banking & more</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={paying ? 'Processing payment…' : `Place Order · ${formatCurrency(total)}`}
          onPress={handlePlaceOrder}
          loading={placing || paying}
          disabled={!selectedAddressId || placing || paying}
        />
      </View>

      {paymentOptions && (
        <RazorpayWebView
          options={paymentOptions}
          onResult={(result) => {
            resolvePayment(result);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  section: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  noAddress: { fontSize: 14, color: '#6B7280' },
  addrCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    padding: 12, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  addrCardSelected: { borderColor: '#FF6B35', backgroundColor: '#FFF7ED' },
  addrRadio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    borderColor: '#FF6B35', justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  addrRadioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF6B35' },
  addrLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  addrText: { fontSize: 13, color: '#6B7280' },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { fontSize: 14, color: '#374151', flex: 1 },
  itemPrice: { fontSize: 14, color: '#374151' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 16, fontWeight: '700', color: '#FF6B35' },
  paymentNote: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF7ED', padding: 12, borderRadius: 10 },
  paymentText: { fontSize: 13, color: '#92400E', flex: 1 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
});
