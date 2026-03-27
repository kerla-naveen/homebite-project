import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { VendorCard } from '../../../src/components/vendor/VendorCard';
import { Loader } from '../../../src/components/common/Loader';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { vendorApi } from '../../../src/api/vendor.api';

export default function VendorListScreen() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchVendors = async (s?: string) => {
    try {
      const res = await vendorApi.list(s ? { search: s } : undefined);
      setVendors(res.data.data.data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchVendors(); }, []);

  if (loading) return <Loader />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#9CA3AF" />
        <TextInput
          placeholder="Search vendors..."
          style={styles.searchInput}
          value={search}
          onChangeText={(t) => { setSearch(t); fetchVendors(t); }}
          placeholderTextColor="#9CA3AF"
        />
      </View>
      <FlatList
        data={vendors}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchVendors(search); }} />}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
        renderItem={({ item }) => (
          <VendorCard vendor={item} onPress={() => router.push(`/(customer)/vendors/${item.id}`)} />
        )}
        ListEmptyComponent={<EmptyState icon="storefront-outline" title="No vendors found" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', margin: 16, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  searchInput: { flex: 1, fontSize: 15, color: '#111827' },
});
