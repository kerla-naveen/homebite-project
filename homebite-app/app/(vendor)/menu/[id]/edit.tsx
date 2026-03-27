import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../../../src/components/common/Input';
import { Button } from '../../../../src/components/common/Button';
import { Loader } from '../../../../src/components/common/Loader';
import api from '../../../../src/api/axiosInstance';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  description: z.string().optional().or(z.literal('')),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Enter valid price'),
  preparationTime: z.string().optional().or(z.literal('')),
  servingSize: z.string().optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

const DIETARY_TAGS = ['VEG', 'NON_VEG', 'VEGAN', 'JAIN', 'GLUTEN_FREE'] as const;

export default function EditFoodItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('VEG');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('');

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    Promise.all([
      api.get(`/food-items/${id}`),
      api.get('/categories'),
    ]).then(([itemRes, catRes]) => {
      const item = itemRes.data.data;
      setCategories(catRes.data.data);
      setSelectedTag(item.dietaryTag);
      setSelectedCat(item.categoryId);
      reset({
        name: item.name,
        description: item.description || '',
        price: String(item.price),
        preparationTime: item.preparationTime ? String(item.preparationTime) : '',
        servingSize: item.servingSize || '',
      });
    }).finally(() => setLoading(false));
  }, [id]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await api.put(`/food-items/${id}`, {
        ...data,
        price: parseFloat(data.price),
        dietaryTag: selectedTag,
        categoryId: selectedCat,
        preparationTime: data.preparationTime ? parseInt(data.preparationTime) : undefined,
      });
      Toast.show({ type: 'success', text1: 'Item updated!' });
      router.back();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.message || 'Failed to update' });
    } finally { setSaving(false); }
  };

  if (loading) return <Loader />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Item</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
            <Input label="Item Name *" placeholder="e.g. Dal Makhani" value={value} onChangeText={onChange} error={errors.name?.message} />
          )} />
          <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
            <Input label="Description" placeholder="Describe the dish..." value={value} onChangeText={onChange} multiline numberOfLines={3} />
          )} />
          <Controller control={control} name="price" render={({ field: { onChange, value } }) => (
            <Input label="Price (₹) *" keyboardType="decimal-pad" value={value} onChangeText={onChange} error={errors.price?.message} />
          )} />
          <Controller control={control} name="preparationTime" render={({ field: { onChange, value } }) => (
            <Input label="Prep Time (minutes)" keyboardType="number-pad" value={value} onChangeText={onChange} />
          )} />
          <Controller control={control} name="servingSize" render={({ field: { onChange, value } }) => (
            <Input label="Serving Size" placeholder="Serves 1-2" value={value} onChangeText={onChange} />
          )} />

          <Text style={styles.label}>Category *</Text>
          <View style={styles.chipRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, selectedCat === cat.id && styles.chipSelected]}
                onPress={() => setSelectedCat(cat.id)}
              >
                <Text style={[styles.chipText, selectedCat === cat.id && styles.chipTextSelected]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Dietary Tag *</Text>
          <View style={styles.chipRow}>
            {DIETARY_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[styles.chip, selectedTag === tag && styles.chipSelected]}
                onPress={() => setSelectedTag(tag)}
              >
                <Text style={[styles.chipText, selectedTag === tag && styles.chipTextSelected]}>{tag.replace('_', ' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button title="Save Changes" onPress={handleSubmit(onSubmit)} loading={saving} style={{ marginTop: 8 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  form: { padding: 16, gap: 4, paddingBottom: 32 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB' },
  chipSelected: { borderColor: '#FF6B35', backgroundColor: '#FFF7ED' },
  chipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  chipTextSelected: { color: '#FF6B35' },
});
