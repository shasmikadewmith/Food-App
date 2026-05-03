import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DishCard from '@/src/components/DishCard';
import SearchBar from '@/src/components/SearchBar';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { COLORS, FONTS, SPACING, RADIUS } from '@/src/constants/theme';
import api from '@/src/services/api';
import { ENDPOINTS } from '@/src/constants/api';

const CATEGORIES = [
  { key: '', label: 'All' }, { key: 'appetizer', label: 'Appetizers' },
  { key: 'main-course', label: 'Main Course' }, { key: 'dessert', label: 'Desserts' },
  { key: 'beverage', label: 'Beverages' }, { key: 'side', label: 'Sides' },
  { key: 'special', label: 'Specials' },
];

export default function MenuScreen() {
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const fetchDishes = useCallback(async () => {
    try {
      const params: any = {};
      if (category) params.category = category;
      if (search) params.search = search;
      const { data } = await api.get(ENDPOINTS.DISHES, { params });
      setDishes(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [category, search]);

  useEffect(() => { fetchDishes(); }, [fetchDishes]);

  const onRefresh = async () => { setRefreshing(true); await fetchDishes(); setRefreshing(false); };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Our Menu</Text>
        <Text style={styles.subtitle}>{dishes.length} dishes available</Text>
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Search menu..." />

      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catRow}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catChip, category === item.key && styles.catActive]}
            onPress={() => setCategory(item.key)}
          >
            <Text style={[styles.catText, category === item.key && styles.catTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={dishes}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingHorizontal: SPACING.base, paddingBottom: 100 }}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        renderItem={({ item }) => (
          <DishCard dish={item} onPress={() => router.push(`/dish/${item._id}`)} onAddToOrder={() => router.push({ pathname: '/order/create', params: { dishId: item._id } })} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="restaurant-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No dishes found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.base, paddingTop: 60, paddingBottom: SPACING.md },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.white },
  subtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  catRow: { paddingHorizontal: SPACING.base, gap: SPACING.sm, marginBottom: SPACING.base },
  catChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceLight, borderWidth: 1, borderColor: COLORS.border },
  catActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  catTextActive: { color: COLORS.white },
  row: { justifyContent: 'space-between' },
  empty: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.sizes.base, marginTop: SPACING.md },
});
