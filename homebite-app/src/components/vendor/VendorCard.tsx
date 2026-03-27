import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../common/Badge';

interface VendorCardProps {
  vendor: {
    id: string;
    businessName: string;
    description?: string;
    logoUrl?: string;
    city: string;
    isAcceptingOrders: boolean;
    _count?: { foodItems: number };
  };
  onPress: () => void;
}

export const VendorCard: React.FC<VendorCardProps> = ({ vendor, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
    <View style={styles.row}>
      <View style={styles.logo}>
        {vendor.logoUrl ? (
          <Image source={{ uri: vendor.logoUrl }} style={styles.logoImg} />
        ) : (
          <Ionicons name="restaurant" size={32} color="#FF6B35" />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{vendor.businessName}</Text>
        {vendor.description && (
          <Text style={styles.desc} numberOfLines={2}>{vendor.description}</Text>
        )}
        <View style={styles.meta}>
          <Ionicons name="location-outline" size={12} color="#9CA3AF" />
          <Text style={styles.metaText}>{vendor.city}</Text>
          {vendor._count && (
            <>
              <Text style={styles.dot}> · </Text>
              <Text style={styles.metaText}>{vendor._count.foodItems} items</Text>
            </>
          )}
        </View>
      </View>
      <Badge
        label={vendor.isAcceptingOrders ? 'Open' : 'Closed'}
        bg={vendor.isAcceptingOrders ? '#D1FAE5' : '#FEE2E2'}
        color={vendor.isAcceptingOrders ? '#065F46' : '#991B1B'}
      />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImg: { width: 56, height: 56 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#111827' },
  desc: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  metaText: { fontSize: 12, color: '#9CA3AF' },
  dot: { color: '#9CA3AF' },
});
