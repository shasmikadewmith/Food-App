import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, RefreshControl, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from '@/src/components/Badge';
import Button from '@/src/components/Button';
import Input from '@/src/components/Input';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import api from '@/src/services/api';
import { ENDPOINTS } from '@/src/constants/api';
import Toast from 'react-native-toast-message';

const CATEGORIES = [
  { value: 'appetizer', label: 'Appetizer' },
  { value: 'main-course', label: 'Main Course' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'beverage', label: 'Beverage' },
  { value: 'side', label: 'Side' },
  { value: 'special', label: 'Special' },
];

const EMPTY_FORM = {
  name: '', description: '', price: '', category: 'main-course',
  image: '', ingredients: '', prepTime: '15',
};

export default function AdminDishesScreen() {
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDish, setEditingDish] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchDishes = useCallback(async () => {
    try {
      const { data } = await api.get(ENDPOINTS.DISHES);
      setDishes(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDishes(); }, [fetchDishes]);

  const openAddModal = () => {
    setEditingDish(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (dish: any) => {
    setEditingDish(dish);
    setForm({
      name: dish.name,
      description: dish.description,
      price: dish.price.toString(),
      category: dish.category,
      image: dish.image || '',
      ingredients: (dish.ingredients || []).join(', '),
      prepTime: (dish.prepTime || 15).toString(),
    });
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = 'Valid price required';
    if (!form.category) e.category = 'Category is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        image: form.image.trim() || undefined,
        ingredients: form.ingredients ? form.ingredients.split(',').map(s => s.trim()).filter(Boolean) : [],
        prepTime: Number(form.prepTime) || 15,
      };

      if (editingDish) {
        await api.put(`${ENDPOINTS.DISHES}/${editingDish._id}`, payload);
        Toast.show({ type: 'success', text1: 'Dish Updated!' });
      } else {
        await api.post(ENDPOINTS.DISHES, payload);
        Toast.show({ type: 'success', text1: 'Dish Created!', text2: `${payload.name} has been added` });
      }
      setShowModal(false);
      fetchDishes();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Failed', text2: err.message });
    } finally { setSubmitting(false); }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Dish', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`${ENDPOINTS.DISHES}/${id}`);
          Toast.show({ type: 'success', text1: 'Deleted' });
          fetchDishes();
        } catch (err: any) { Toast.show({ type: 'error', text1: err.message }); }
      }},
    ]);
  };

  const toggleAvailability = async (dish: any) => {
    try {
      await api.put(`${ENDPOINTS.DISHES}/${dish._id}`, { isAvailable: !dish.isAvailable });
      Toast.show({ type: 'success', text1: dish.isAvailable ? 'Marked unavailable' : 'Marked available' });
      fetchDishes();
    } catch (err: any) { Toast.show({ type: 'error', text1: err.message }); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Manage Dishes</Text>
          <Text style={styles.count}>{dishes.length} dishes</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={dishes}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: SPACING.base, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchDishes(); setRefreshing(false); }} tintColor={COLORS.primary} />}
        renderItem={({ item }) => (
          <View style={[styles.card, SHADOWS.small]}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.price}>Rs. {item.price.toLocaleString()}</Text>
              <View style={styles.metaRow}>
                <Badge status={item.isAvailable ? 'available' : 'occupied'} />
                <Text style={styles.category}>{item.category}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openEditModal(item)} style={[styles.actionBtn, { backgroundColor: COLORS.info + '22' }]}>
                <Ionicons name="create" size={18} color={COLORS.info} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleAvailability(item)} style={[styles.actionBtn, { backgroundColor: item.isAvailable ? COLORS.warning + '22' : COLORS.success + '22' }]}>
                <Ionicons name={item.isAvailable ? 'eye-off' : 'eye'} size={18} color={item.isAvailable ? COLORS.warning : COLORS.success} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item._id, item.name)} style={[styles.actionBtn, { backgroundColor: COLORS.error + '22' }]}>
                <Ionicons name="trash" size={18} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Add/Edit Dish Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingDish ? 'Edit Dish' : 'Add New Dish'}</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Ionicons name="close-circle" size={28} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Input label="Dish Name *" placeholder="e.g. Margherita Pizza" icon="fast-food-outline" value={form.name} onChangeText={(t) => setForm(f => ({ ...f, name: t }))} error={errors.name} />
                <Input label="Description *" placeholder="Describe the dish" icon="document-text-outline" value={form.description} onChangeText={(t) => setForm(f => ({ ...f, description: t }))} error={errors.description} />

                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Input label="Price (Rs.) *" placeholder="1500" icon="cash-outline" value={form.price} onChangeText={(t) => setForm(f => ({ ...f, price: t }))} keyboardType="numeric" error={errors.price} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input label="Prep Time (min)" placeholder="15" icon="time-outline" value={form.prepTime} onChangeText={(t) => setForm(f => ({ ...f, prepTime: t }))} keyboardType="numeric" />
                  </View>
                </View>

                <Text style={styles.fieldLabel}>Category *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat.value}
                      style={[styles.categoryChip, form.category === cat.value && styles.categoryChipActive]}
                      onPress={() => setForm(f => ({ ...f, category: cat.value }))}
                    >
                      <Text style={[styles.categoryChipText, form.category === cat.value && { color: COLORS.white }]}>{cat.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

                <Input label="Image URL (Optional)" placeholder="https://example.com/dish.jpg" icon="image-outline" value={form.image} onChangeText={(t) => setForm(f => ({ ...f, image: t }))} autoCapitalize="none" />
                <Input label="Ingredients (comma-separated)" placeholder="Cheese, Tomato, Basil" icon="leaf-outline" value={form.ingredients} onChangeText={(t) => setForm(f => ({ ...f, ingredients: t }))} />

                <Button
                  title={editingDish ? 'Update Dish' : 'Create Dish'}
                  onPress={handleSubmit}
                  loading={submitting}
                  icon={<Ionicons name={editingDish ? 'checkmark-circle' : 'add-circle'} size={20} color={COLORS.white} />}
                  style={{ marginTop: SPACING.md }}
                />
                <View style={{ height: 30 }} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingTop: 60, paddingBottom: SPACING.md },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.white },
  count: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
  addBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOWS.glow },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.sm, marginBottom: SPACING.sm },
  image: { width: 60, height: 60, borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceLight },
  info: { flex: 1, marginLeft: SPACING.md },
  name: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },
  price: { color: COLORS.primary, fontWeight: '700', fontSize: FONTS.sizes.sm, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: 4 },
  category: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, textTransform: 'capitalize' },
  actions: { gap: SPACING.xs },
  actionBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { backgroundColor: COLORS.background, borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, padding: SPACING.xl, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.white },
  row: { flexDirection: 'row', gap: SPACING.sm },
  fieldLabel: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: '600', marginBottom: SPACING.xs, marginLeft: SPACING.xs, marginTop: SPACING.xs },
  categoryRow: { gap: SPACING.sm, paddingBottom: SPACING.sm },
  categoryChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceLight, borderWidth: 1, borderColor: COLORS.border },
  categoryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryChipText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: FONTS.sizes.sm },
  errorText: { color: COLORS.error, fontSize: FONTS.sizes.xs, marginLeft: SPACING.xs, marginTop: -SPACING.xs },
});
