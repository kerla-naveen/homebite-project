import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  FlatList, RefreshControl, TextInput
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VendorCard } from '../../src/components/vendor/VendorCard';
import { Loader } from '../../src/components/common/Loader';
import { vendorApi } from '../../src/api/vendor.api';
import { useAuthStore } from '../../src/store/authStore';

export default function CustomerHome() {
  const user = useAuthStore((s) => s.user);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchVendors = async () => {
    try {
      const res = await vendorApi.list({ limit: '10' });
      setVendors(res.data.data.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchVendors(); }, []);

  const filtered = vendors.filter((v) =>
    v.businessName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchVendors(); }} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.tagline}>What are you craving today?</Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search home kitchens..."
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <Text style={styles.sectionTitle}>Home Kitchens Near You</Text>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VendorCard
              vendor={item}
              onPress={() => router.push(`/(customer)/vendors/${item.id}`)}
            />
          )}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={styles.empty}>No vendors found</Text>
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 8 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#111827' },
  tagline: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 20,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  searchInput: { flex: 1, fontSize: 15, color: '#111827' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginLeft: 16, marginBottom: 12 },
  empty: { textAlign: 'center', color: '#9CA3AF', padding: 32 },
});
