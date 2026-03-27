import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';
import { authApi } from '../../src/api/auth.api';
import { useAuthStore } from '../../src/store/authStore';
import { saveRefreshToken } from '../../src/utils/storage';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit Indian phone number').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['CUSTOMER', 'VENDOR']),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, watch, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'CUSTOMER' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = data;
      const res = await authApi.register({ ...payload, phone: payload.phone || undefined });
      const { user, accessToken, refreshToken } = res.data.data;
      await saveRefreshToken(refreshToken);
      setAuth(user, accessToken);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err.response?.data?.message || 'Registration failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>🍱 HomeBite</Text>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join the home food community</Text>
        </View>

        <View style={styles.roleRow}>
          {(['CUSTOMER', 'VENDOR'] as const).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.roleBtn, selectedRole === r && styles.roleBtnActive]}
              onPress={() => setValue('role', r)}
            >
              <Text style={[styles.roleBtnText, selectedRole === r && styles.roleBtnTextActive]}>
                {r === 'CUSTOMER' ? '🛒 Customer' : '👨‍🍳 Home Cook'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.form}>
          <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
            <Input label="Full Name" placeholder="Priya Sharma" value={value} onChangeText={onChange} error={errors.name?.message} />
          )} />
          <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
            <Input label="Email" placeholder="you@example.com" keyboardType="email-address" value={value} onChangeText={onChange} error={errors.email?.message} />
          )} />
          <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
            <Input label="Phone (optional)" placeholder="9876543210" keyboardType="phone-pad" value={value} onChangeText={onChange} error={errors.phone?.message} />
          )} />
          <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
            <Input label="Password" placeholder="Min 6 characters" isPassword value={value} onChangeText={onChange} error={errors.password?.message} />
          )} />
          <Controller control={control} name="confirmPassword" render={({ field: { onChange, value } }) => (
            <Input label="Confirm Password" placeholder="Repeat password" isPassword value={value} onChangeText={onChange} error={errors.confirmPassword?.message} />
          )} />

          <Button title="Create Account" onPress={handleSubmit(onSubmit)} loading={loading} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.link}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', padding: 24 },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 32 },
  logo: { fontSize: 40, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 15, color: '#6B7280', marginTop: 6 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  roleBtn: {
    flex: 1, height: 50, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    justifyContent: 'center', alignItems: 'center',
  },
  roleBtnActive: { borderColor: '#FF6B35', backgroundColor: '#FFF7ED' },
  roleBtnText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  roleBtnTextActive: { color: '#FF6B35' },
  form: { gap: 4 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#6B7280', fontSize: 15 },
  link: { color: '#FF6B35', fontWeight: '600', fontSize: 15 },
});
