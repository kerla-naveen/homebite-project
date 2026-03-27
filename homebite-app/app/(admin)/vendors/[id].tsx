import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Badge } from '../../../src/components/common/Badge';
import { Button } from '../../../src/components/common/Button';
import { Loader } from '../../../src/components/common/Loader';
import { adminApi } from '../../../src/api/admin.api';
import { formatDate } from '../../../src/utils/formatCurrency';

export default function AdminVendorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  useEffect(() => {
    adminApi.getVendorById(id).then((res) => setVendor(res.data.data)).finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    Alert.alert('Approve Vendor', `Approve ${vendor.businessName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: async () => {
          setActionLoading(true);
          try {
            await adminApi.approveVendor(id);
            Toast.show({ type: 'success', text1: 'Vendor approved!' });
            router.back();
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to approve' });
          } finally { setActionLoading(false); }
        },
      },
    ]);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      Toast.show({ type: 'error', text1: 'Please provide a rejection reason' });
      return;
    }
    setActionLoading(true);
    try {
      await adminApi.rejectVendor(id, rejectReason);
      Toast.show({ type: 'success', text1: 'Vendor rejected' });
      router.back();
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to reject' });
    } finally { setActionLoading(false); }
  };

  const handleSuspend = async () => {
    Alert.alert('Suspend Vendor', 'This will prevent the vendor from accepting orders.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Suspend',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await adminApi.suspendVendor(id);
            Toast.show({ type: 'success', text1: 'Vendor suspended' });
            router.back();
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to suspend' });
          } finally { setActionLoading(false); }
        },
      },
    ]);
  };

  if (loading) return <Loader />;
  if (!vendor) return null;

  const isPending = vendor.status === 'PENDING';
  const isApproved = vendor.status === 'APPROVED';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{vendor.businessName}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.bizName}>{vendor.businessName}</Text>
            <Badge
              label={vendor.status}
              bg={vendor.status === 'APPROVED' ? '#D1FAE5' : vendor.status === 'PENDING' ? '#FEF3C7' : '#FEE2E2'}
              color={vendor.status === 'APPROVED' ? '#065F46' : vendor.status === 'PENDING' ? '#92400E' : '#991B1B'}
            />
          </View>
          {vendor.description && <Text style={styles.desc}>{vendor.description}</Text>}
          <Text style={styles.meta}>Applied: {formatDate(vendor.createdAt)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Owner Details</Text>
          <Text style={styles.value}>{vendor.user?.name}</Text>
          <Text style={styles.meta}>{vendor.user?.email}</Text>
          {vendor.user?.phone && <Text style={styles.meta}>{vendor.user.phone}</Text>}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.value}>{vendor.city}, {vendor.state}</Text>
          <Text style={styles.meta}>Pincode: {vendor.pincode}</Text>
        </View>

        {vendor.fssaiNumber && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>FSSAI Number</Text>
            <Text style={styles.value}>{vendor.fssaiNumber}</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Stats</Text>
          <View style={styles.row}>
            <Text style={styles.meta}>Food Items</Text>
            <Text style={styles.value}>{vendor._count?.foodItems ?? 0}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.meta}>Total Orders</Text>
            <Text style={styles.value}>{vendor._count?.orders ?? 0}</Text>
          </View>
        </View>

        {isPending && (
          <View style={styles.actionSection}>
            <Button title="Approve Vendor" onPress={handleApprove} loading={actionLoading} />
            {!showRejectInput ? (
              <Button title="Reject" onPress={() => setShowRejectInput(true)} variant="danger" />
            ) : (
              <View style={styles.rejectSection}>
                <TextInput
                  style={styles.rejectInput}
                  placeholder="Reason for rejection..."
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#9CA3AF"
                />
                <View style={styles.rejectBtns}>
                  <Button title="Cancel" onPress={() => setShowRejectInput(false)} variant="outline" style={{ flex: 1 }} />
                  <Button title="Confirm Reject" onPress={handleReject} variant="danger" loading={actionLoading} style={{ flex: 1 }} />
                </View>
              </View>
            )}
          </View>
        )}

        {isApproved && (
          <Button title="Suspend Vendor" onPress={handleSuspend} variant="danger" loading={actionLoading} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#111827' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bizName: { fontSize: 20, fontWeight: '700', color: '#111827', flex: 1 },
  desc: { fontSize: 14, color: '#6B7280' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 2 },
  value: { fontSize: 15, color: '#111827' },
  meta: { fontSize: 13, color: '#6B7280' },
  actionSection: { gap: 10 },
  rejectSection: { gap: 10 },
  rejectInput: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10,
    padding: 12, fontSize: 14, color: '#111827',
    backgroundColor: '#fff', minHeight: 80, textAlignVertical: 'top',
  },
  rejectBtns: { flexDirection: 'row', gap: 10 },
});
