import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import DishCard from '@/src/components/DishCard';
import SearchBar from '@/src/components/SearchBar';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import api from '@/src/services/api';
import { ENDPOINTS } from '@/src/constants/api';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { key: '', label: 'All', icon: 'grid' as const },
  { key: 'main-course', label: 'Mains', icon: 'flame' as const },
  { key: 'appetizer', label: 'Starters', icon: 'leaf' as const },
  { key: 'dessert', label: 'Desserts', icon: 'ice-cream' as const },
  { key: 'beverage', label: 'Drinks', icon: 'cafe' as const },
  { key: 'special', label: 'Specials', icon: 'star' as const },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const [dishes, setDishes] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchDishes = useCallback(async () => {
    try {
      const params: any = {};
      if (selectedCategory) params.category = selectedCategory;
      if (search) params.search = search;
      const { data } = await api.get(ENDPOINTS.DISHES, { params });
      setDishes(data);
      if (!search && !selectedCategory) {
        setFeatured(data.filter((d: any) => d.rating >= 4.5).slice(0, 5));
      }
    } catch (e) { console.error(e); }
  }, [selectedCategory, search]);

  useEffect(() => { fetchDishes(); }, [fetchDishes]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDishes();
    setRefreshing(false);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting()} 👋</Text>
          <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <SearchBar value={search} onChangeText={setSearch} />

      {/* Featured Section */}
      {featured.length > 0 && !search && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Featured Dishes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.base }}>
            {featured.map((item) => (
              <TouchableOpacity key={item._id} style={[styles.featuredCard, SHADOWS.medium]} activeOpacity={0.85} onPress={() => router.push(`/dish/${item._id}` as any)}>
                <Image source={{ uri: item.image }} style={styles.featuredImage} />
                <View style={styles.featuredOverlay}>
                  <Text style={styles.featuredName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.featuredPrice}>Rs. {item.price.toLocaleString()}</Text>
                </View>
                <View style={styles.featuredRating}>
                  <Ionicons name="star" size={12} color={COLORS.accent} />
                  <Text style={styles.featuredRatingText}>{item.rating}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.base, gap: SPACING.sm }}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key || 'all'}
              style={[styles.catChip, selectedCategory === cat.key && styles.catChipActive]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Ionicons name={cat.icon} size={16} color={selectedCategory === cat.key ? COLORS.white : COLORS.textSecondary} />
              <Text style={[styles.catText, selectedCategory === cat.key && styles.catTextActive]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Quick Actions */}
      <View style={[styles.section, { paddingHorizontal: SPACING.base }]}>
        <View style={styles.quickRow}>
          <TouchableOpacity style={[styles.quickCard, { backgroundColor: '#FF6B351A' }]} onPress={() => router.push('/table/' as any)}>
            <Ionicons name="grid-outline" size={28} color={COLORS.primary} />
            <Text style={styles.quickText}>Book Table</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickCard, { backgroundColor: '#FFD7001A' }]} onPress={() => router.push('/order/create' as any)}>
            <Ionicons name="cart-outline" size={28} color={COLORS.accent} />
            <Text style={styles.quickText}>Order Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickCard, { backgroundColor: '#4CAF501A' }]} onPress={() => router.push('/review/create' as any)}>
            <Ionicons name="chatbubble-ellipses-outline" size={28} color={COLORS.success} />
            <Text style={styles.quickText}>Review</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* All Dishes Grid */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { paddingHorizontal: SPACING.base }]}>
          {selectedCategory ? CATEGORIES.find(c => c.key === selectedCategory)?.label : 'All Dishes'}
        </Text>
        <View style={styles.dishGrid}>
          {dishes.map((dish) => (
            <DishCard key={dish._id} dish={dish} onPress={() => router.push(`/dish/${dish._id}` as any)} onAddToOrder={() => router.push({ pathname: '/order/create' as any, params: { dishId: dish._id } })} />
          ))}
        </View>
        {dishes.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No dishes found</Text>
          </View>
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingTop: 60, paddingBottom: SPACING.lg },
  greeting: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary },
  userName: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.white },
  notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  section: { marginBottom: SPACING.lg },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.white, marginBottom: SPACING.md, paddingHorizontal: SPACING.base },
  // Featured
  featuredCard: { width: width * 0.65, height: 180, borderRadius: RADIUS.xl, overflow: 'hidden', marginRight: SPACING.md },
  featuredImage: { width: '100%', height: '100%', backgroundColor: COLORS.surfaceLight },
  featuredOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: SPACING.md, backgroundColor: 'rgba(0,0,0,0.55)' },
  featuredName: { color: COLORS.white, fontSize: FONTS.sizes.base, fontWeight: '700' },
  featuredPrice: { color: COLORS.primary, fontSize: FONTS.sizes.md, fontWeight: '800', marginTop: 2 },
  featuredRating: { position: 'absolute', top: SPACING.md, right: SPACING.md, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full },
  featuredRatingText: { color: COLORS.white, fontSize: FONTS.sizes.xs, fontWeight: '700', marginLeft: 3 },
  // Categories
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceLight, borderWidth: 1, borderColor: COLORS.border },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  catTextActive: { color: COLORS.white },
  // Quick Actions
  quickRow: { flexDirection: 'row', gap: SPACING.md },
  quickCard: { flex: 1, alignItems: 'center', paddingVertical: SPACING.lg, borderRadius: RADIUS.lg },
  quickText: { color: COLORS.white, fontSize: FONTS.sizes.xs, fontWeight: '600', marginTop: SPACING.sm },
  // Dish Grid
  dishGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: SPACING.base },
  empty: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.sizes.base, marginTop: SPACING.md },
});
