import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';
import { vendorApi } from '../../src/api/vendor.api';

const schema = z.object({
  businessName: z.string().min(2, 'Business name required'),
  description: z.string().min(10, 'Please add a brief description').optional().or(z.literal('')),
  fssaiNumber: z.string().optional().or(z.literal('')),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  pincode: z.string().regex(/^\d{6}$/, '6-digit pincode required'),
  upiId: z.string().optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

export default function VendorOnboardingScreen() {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await vendorApi.onboard(data);
      Toast.show({ type: 'success', text1: 'Profile submitted!', text2: 'Awaiting admin approval.' });
      router.replace('/(vendor)/dashboard');
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to submit' });
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Set Up Your Kitchen</Text>
        <Text style={styles.subtitle}>Tell customers about your home kitchen</Text>

        <Controller control={control} name="businessName" render={({ field: { onChange, value } }) => (
          <Input label="Kitchen / Business Name *" placeholder="Priya's Home Kitchen" value={value} onChangeText={onChange} error={errors.businessName?.message} />
        )} />
        <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
          <Input label="Description" placeholder="Describe your speciality and cuisine..." value={value} onChangeText={onChange} error={errors.description?.message} multiline numberOfLines={3} />
        )} />
        <Controller control={control} name="fssaiNumber" render={({ field: { onChange, value } }) => (
          <Input label="FSSAI License Number (optional)" placeholder="e.g. 1234567890123" value={value} onChangeText={onChange} error={errors.fssaiNumber?.message} />
        )} />

        <Text style={styles.sectionHeader}>Location</Text>
        <Controller control={control} name="city" render={({ field: { onChange, value } }) => (
          <Input label="City *" placeholder="Bengaluru" value={value} onChangeText={onChange} error={errors.city?.message} />
        )} />
        <Controller control={control} name="state" render={({ field: { onChange, value } }) => (
          <Input label="State *" placeholder="Karnataka" value={value} onChangeText={onChange} error={errors.state?.message} />
        )} />
        <Controller control={control} name="pincode" render={({ field: { onChange, value } }) => (
          <Input label="Pincode *" placeholder="560001" keyboardType="number-pad" value={value} onChangeText={onChange} error={errors.pincode?.message} />
        )} />

        <Text style={styles.sectionHeader}>Payment Details</Text>
        <Controller control={control} name="upiId" render={({ field: { onChange, value } }) => (
          <Input label="UPI ID (optional)" placeholder="yourname@upi" value={value} onChangeText={onChange} error={errors.upiId?.message} />
        )} />

        <Button title="Submit for Approval" onPress={handleSubmit(onSubmit)} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 26, fontWeight: '700', color: '#111827', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 24 },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#374151', marginTop: 8, marginBottom: 4 },
});
