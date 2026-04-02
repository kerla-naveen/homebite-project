import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
import { Loader } from '../../src/components/common/Loader';
import { userApi, AddressPayload } from '../../src/api/user.api';

interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const EMPTY_FORM: AddressPayload = {
  label: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false,
};

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AddressPayload>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<AddressPayload>>({});

  const fetchAddresses = async () => {
    try {
      const res = await userApi.getAddresses();
      setAddresses(res.data.data);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load addresses' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const validate = (): boolean => {
    const e: Partial<AddressPayload> = {};
    if (!form.label.trim()) e.label = 'Label is required';
    if (!form.line1.trim()) e.line1 = 'Address line 1 is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state.trim()) e.state = 'State is required';
    if (!form.pincode.trim()) e.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter a valid 6-digit pincode';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await userApi.addAddress(form);
      Toast.show({ type: 'success', text1: 'Address saved' });
      setShowForm(false);
      setForm(EMPTY_FORM);
      setErrors({});
      await fetchAddresses();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to save address' });
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (address: Address) => {
    if (address.isDefault) return;
    try {
      await userApi.updateAddress(address.id, { isDefault: true });
      await fetchAddresses();
      Toast.show({ type: 'success', text1: 'Default address updated' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update address' });
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await userApi.deleteAddress(id);
            setAddresses((prev) => prev.filter((a) => a.id !== id));
            Toast.show({ type: 'success', text1: 'Address deleted' });
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to delete address' });
          }
        },
      },
    ]);
  };

  if (loading) return <Loader />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Saved Addresses</Text>
        <TouchableOpacity onPress={() => setShowForm(true)}>
          <Ionicons name="add" size={28} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        {addresses.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="location-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No addresses saved yet</Text>
            <Text style={styles.emptySubText}>Tap + to add a delivery address</Text>
          </View>
        ) : (
          addresses.map((addr) => (
            <View key={addr.id} style={[styles.card, addr.isDefault && styles.cardDefault]}>
              <View style={styles.cardTop}>
                <View style={styles.labelRow}>
                  <Ionicons name="location" size={16} color="#FF6B35" />
                  <Text style={styles.label}>{addr.label}</Text>
                  {addr.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleDelete(addr.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
              <Text style={styles.addrText}>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</Text>
              <Text style={styles.addrText}>{addr.city}, {addr.state} - {addr.pincode}</Text>
              {!addr.isDefault && (
                <TouchableOpacity style={styles.setDefaultBtn} onPress={() => handleSetDefault(addr)}>
                  <Text style={styles.setDefaultText}>Set as default</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Address Modal */}
      <Modal visible={showForm} animationType="slide" onRequestClose={() => setShowForm(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => { setShowForm(false); setForm(EMPTY_FORM); setErrors({}); }}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
              <Text style={styles.title}>New Address</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
              <Input
                label="Label (e.g. Home, Office)"
                placeholder="Home"
                value={form.label}
                onChangeText={(v) => setForm((f) => ({ ...f, label: v }))}
                error={errors.label}
              />
              <Input
                label="Address Line 1"
                placeholder="House / Flat / Street"
                value={form.line1}
                onChangeText={(v) => setForm((f) => ({ ...f, line1: v }))}
                error={errors.line1}
                autoCapitalize="words"
              />
              <Input
                label="Address Line 2 (optional)"
                placeholder="Landmark, Area"
                value={form.line2}
                onChangeText={(v) => setForm((f) => ({ ...f, line2: v }))}
                autoCapitalize="words"
              />
              <Input
                label="City"
                placeholder="City"
                value={form.city}
                onChangeText={(v) => setForm((f) => ({ ...f, city: v }))}
                error={errors.city}
                autoCapitalize="words"
              />
              <Input
                label="State"
                placeholder="State"
                value={form.state}
                onChangeText={(v) => setForm((f) => ({ ...f, state: v }))}
                error={errors.state}
                autoCapitalize="words"
              />
              <Input
                label="Pincode"
                placeholder="6-digit pincode"
                value={form.pincode}
                onChangeText={(v) => setForm((f) => ({ ...f, pincode: v }))}
                error={errors.pincode}
                keyboardType="numeric"
                maxLength={6}
              />

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setForm((f) => ({ ...f, isDefault: !f.isDefault }))}
              >
                <View style={[styles.checkbox, form.isDefault && styles.checkboxChecked]}>
                  {form.isDefault && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <Text style={styles.checkboxLabel}>Set as default address</Text>
              </TouchableOpacity>

              <Button title={saving ? 'Saving...' : 'Save Address'} onPress={handleSave} loading={saving} />
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  empty: { alignItems: 'center', marginTop: 80, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptySubText: { fontSize: 14, color: '#9CA3AF' },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    borderWidth: 1.5, borderColor: '#E5E7EB', gap: 4,
  },
  cardDefault: { borderColor: '#FF6B35', backgroundColor: '#FFF7ED' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: 15, fontWeight: '700', color: '#111827' },
  defaultBadge: { backgroundColor: '#FF6B35', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  defaultBadgeText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  addrText: { fontSize: 13, color: '#6B7280' },
  setDefaultBtn: { marginTop: 8 },
  setDefaultText: { fontSize: 13, color: '#FF6B35', fontWeight: '600' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#D1D5DB',
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  checkboxLabel: { fontSize: 14, color: '#374151' },
});
