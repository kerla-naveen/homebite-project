import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/formatCurrency';

interface FoodItemCardProps {
  item: {
    id: string;
    name: string;
    description?: string;
    price: number;
    discountedPrice?: number;
    imageUrl?: string;
    dietaryTag: string;
    isAvailable: boolean;
    preparationTime?: number;
  };
  onAddToCart: () => void;
  cartQuantity?: number;
  onIncrease?: () => void;
  onDecrease?: () => void;
}

export const FoodItemCard: React.FC<FoodItemCardProps> = ({
  item, onAddToCart, cartQuantity = 0, onIncrease, onDecrease,
}) => {
  const isVeg = item.dietaryTag === 'VEG' || item.dietaryTag === 'VEGAN';

  return (
    <View style={[styles.card, !item.isAvailable && styles.unavailable]}>
      <View style={styles.left}>
        <View style={[styles.dot, { borderColor: isVeg ? '#10B981' : '#EF4444' }]}>
          <View style={[styles.dotInner, { backgroundColor: isVeg ? '#10B981' : '#EF4444' }]} />
        </View>
        <Text style={styles.name}>{item.name}</Text>
        {item.description && (
          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
        )}
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {formatCurrency(Number(item.discountedPrice || item.price))}
          </Text>
          {item.discountedPrice && (
            <Text style={styles.oldPrice}>{formatCurrency(Number(item.price))}</Text>
          )}
        </View>
        {item.preparationTime && (
          <View style={styles.prepRow}>
            <Ionicons name="time-outline" size={12} color="#9CA3AF" />
            <Text style={styles.prepText}>{item.preparationTime} min</Text>
          </View>
        )}
      </View>
      <View style={styles.right}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="fast-food-outline" size={28} color="#D1D5DB" />
          </View>
        )}
        {item.isAvailable ? (
          cartQuantity > 0 ? (
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={onDecrease}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qty}>{cartQuantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={onIncrease}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addBtn} onPress={onAddToCart}>
              <Text style={styles.addBtnText}>ADD</Text>
            </TouchableOpacity>
          )
        ) : (
          <Text style={styles.unavailableText}>Unavailable</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  unavailable: { opacity: 0.6 },
  left: { flex: 1, paddingRight: 12 },
  dot: { width: 14, height: 14, borderRadius: 3, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  dotInner: { width: 6, height: 6, borderRadius: 2 },
  name: { fontSize: 15, fontWeight: '600', color: '#111827' },
  desc: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  price: { fontSize: 15, fontWeight: '700', color: '#111827' },
  oldPrice: { fontSize: 13, color: '#9CA3AF', textDecorationLine: 'line-through' },
  prepRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  prepText: { fontSize: 11, color: '#9CA3AF' },
  right: { alignItems: 'center', justifyContent: 'space-between' },
  image: { width: 90, height: 80, borderRadius: 10 },
  imagePlaceholder: {
    width: 90, height: 80, borderRadius: 10,
    backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center',
  },
  addBtn: {
    borderWidth: 1.5, borderColor: '#FF6B35', borderRadius: 8,
    paddingHorizontal: 18, paddingVertical: 6, marginTop: 8,
  },
  addBtnText: { color: '#FF6B35', fontWeight: '700', fontSize: 13 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  qty: { fontSize: 15, fontWeight: '700', color: '#111827', minWidth: 20, textAlign: 'center' },
  unavailableText: { fontSize: 11, color: '#9CA3AF', marginTop: 8 },
});
