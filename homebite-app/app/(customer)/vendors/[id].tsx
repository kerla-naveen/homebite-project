import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, Alert
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { FoodItemCard } from '../../../src/components/food/FoodItemCard';
import { Loader } from '../../../src/components/common/Loader';
import { Button } from '../../../src/components/common/Button';
import { vendorApi } from '../../../src/api/vendor.api';
import { cartApi } from '../../../src/api/cart.api';
import { useCartStore } from '../../../src/store/cartStore';

export default function VendorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { items: cartItems, vendorId: cartVendorId, setCart } = useCartStore();

  const fetchVendor = useCallback(async () => {
    try {
      const res = await vendorApi.getById(id);
      setVendor(res.data.data);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load vendor' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchCart = useCallback(async () => {
    try {
      const res = await cartApi.get();
      const cart = res.data.data;
      setCart(cart.items || [], cart.vendorId, cart.subtotal);
    } catch {}
  }, []);

  useEffect(() => {
    fetchVendor();
    fetchCart();
  }, []);

  const getCartQty = (foodItemId: string) =>
    cartItems.find((i) => i.foodItemId === foodItemId)?.quantity || 0;

  const handleAddToCart = async (foodItemId: string) => {
    if (cartVendorId && cartVendorId !== id) {
      Alert.alert(
        'Different vendor',
        'Your cart has items from another vendor. Clear cart to add this item?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear & Add',
            style: 'destructive',
            onPress: async () => {
              await cartApi.clear();
              await cartApi.addItem(foodItemId);
              fetchCart();
            },
          },
        ]
      );
      return;
    }
    try {
      await cartApi.addItem(foodItemId);
      fetchCart();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to add item' });
    }
  };

  const handleUpdateQty = async (foodItemId: string, qty: number) => {
    try {
      await cartApi.updateItem(foodItemId, qty);
      fetchCart();
    } catch {}
  };

  if (loading) return <Loader />;
  if (!vendor) return null;

  const totalInCart = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{vendor.businessName}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={vendor.foodItems}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            {vendor.bannerUrl ? (
              <Image source={{ uri: vendor.bannerUrl }} style={styles.banner} />
            ) : (
              <View style={styles.bannerPlaceholder}>
                <Text style={styles.bannerEmoji}>🍱</Text>
              </View>
            )}
            <View style={styles.infoSection}>
              <Text style={styles.vendorName}>{vendor.businessName}</Text>
              {vendor.description && <Text style={styles.desc}>{vendor.description}</Text>}
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={14} color="#9CA3AF" />
                <Text style={styles.meta}>{vendor.city}, {vendor.state}</Text>
                <View style={[styles.statusDot, { backgroundColor: vendor.isAcceptingOrders ? '#10B981' : '#EF4444' }]} />
                <Text style={styles.meta}>{vendor.isAcceptingOrders ? 'Accepting orders' : 'Closed'}</Text>
              </View>
            </View>
            <Text style={styles.menuTitle}>Menu</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.itemWrap}>
            <FoodItemCard
              item={item}
              cartQuantity={getCartQty(item.id)}
              onAddToCart={() => handleAddToCart(item.id)}
              onIncrease={() => handleUpdateQty(item.id, getCartQty(item.id) + 1)}
              onDecrease={() => handleUpdateQty(item.id, getCartQty(item.id) - 1)}
            />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No items available</Text>}
        contentContainerStyle={{ paddingBottom: totalInCart > 0 ? 100 : 24 }}
      />

      {totalInCart > 0 && (
        <View style={styles.cartBar}>
          <Text style={styles.cartCount}>{totalInCart} item{totalInCart > 1 ? 's' : ''} in cart</Text>
          <Button
            title="View Cart"
            onPress={() => router.push('/(customer)/cart')}
            fullWidth={false}
            style={styles.cartBtn}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#111827' },
  banner: { width: '100%', height: 180 },
  bannerPlaceholder: { width: '100%', height: 180, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center' },
  bannerEmoji: { fontSize: 64 },
  infoSection: { backgroundColor: '#fff', padding: 16 },
  vendorName: { fontSize: 22, fontWeight: '700', color: '#111827' },
  desc: { fontSize: 14, color: '#6B7280', marginTop: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  meta: { fontSize: 13, color: '#6B7280' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
  menuTitle: { fontSize: 18, fontWeight: '700', color: '#111827', margin: 16, marginBottom: 8 },
  itemWrap: { paddingHorizontal: 16, marginBottom: 4 },
  empty: { textAlign: 'center', color: '#9CA3AF', padding: 32 },
  cartBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 8,
  },
  cartCount: { fontSize: 16, fontWeight: '600', color: '#111827' },
  cartBtn: { width: 'auto', paddingHorizontal: 24 },
});
