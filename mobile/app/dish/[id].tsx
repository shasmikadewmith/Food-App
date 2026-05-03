import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Badge from '@/src/components/Badge';
import Button from '@/src/components/Button';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import api from '@/src/services/api';
import { ENDPOINTS } from '@/src/constants/api';

const { width } = Dimensions.get('window');

export default function DishDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [dish, setDish] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [dishRes, revRes] = await Promise.all([
          api.get(`${ENDPOINTS.DISHES}/${id}`),
          api.get(`${ENDPOINTS.REVIEWS.BASE}/dish/${id}`),
        ]);
        setDish(dishRes.data);
        setReviews(revRes.data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading || !dish) return <LoadingSpinner />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: dish.image }} style={styles.image} />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        {!dish.isAvailable && <View style={styles.soldOut}><Text style={styles.soldOutText}>Sold Out</Text></View>}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{dish.name}</Text>
            <Text style={styles.category}>{dish.category.replace('-', ' ')}</Text>
          </View>
          <Text style={styles.price}>Rs. {dish.price.toLocaleString()}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="star" size={18} color={COLORS.accent} />
            <Text style={styles.statValue}>{dish.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>({dish.numReviews})</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={18} color={COLORS.primary} />
            <Text style={styles.statValue}>{dish.prepTime}min</Text>
          </View>
          <Badge status={dish.isAvailable ? 'available' : 'occupied'} size="md" />
        </View>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{dish.description}</Text>

        {dish.ingredients.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.tagsRow}>
              {dish.ingredients.map((ing: string, i: number) => (
                <View key={i} style={styles.tag}><Text style={styles.tagText}>{ing}</Text></View>
              ))}
            </View>
          </>
        )}

        {reviews.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
            {reviews.slice(0, 5).map((r: any) => (
              <View key={r._id} style={[styles.reviewCard, SHADOWS.small]}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewUser}>{r.user?.name || 'User'}</Text>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons key={s} name={s <= r.rating ? 'star' : 'star-outline'} size={14} color={COLORS.accent} />
                    ))}
                  </View>
                </View>
                {r.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
              </View>
            ))}
          </>
        )}

        <View style={styles.actionRow}>
          <Button title="Add to Order" onPress={() => router.push({ pathname: '/order/create', params: { dishId: dish._id } })} disabled={!dish.isAvailable} icon={<Ionicons name="cart" size={20} color={COLORS.white} />} />
        </View>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  imageContainer: { position: 'relative' },
  image: { width, height: width * 0.75, backgroundColor: COLORS.surfaceLight },
  backBtn: { position: 'absolute', top: 50, left: SPACING.base, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  soldOut: { position: 'absolute', top: 50, right: SPACING.base, backgroundColor: COLORS.error, paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full },
  soldOutText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.sm },
  content: { padding: SPACING.xl, marginTop: -SPACING.xxl, backgroundColor: COLORS.background, borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
  name: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.white },
  category: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textTransform: 'capitalize', marginTop: 4 },
  price: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.primary },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg, marginBottom: SPACING.xl, paddingBottom: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.md },
  statLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.white, marginBottom: SPACING.sm, marginTop: SPACING.lg },
  description: { color: COLORS.textSecondary, fontSize: FONTS.sizes.base, lineHeight: 24 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  tag: { backgroundColor: COLORS.surfaceLight, paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full },
  tagText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
  reviewCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  reviewUser: { color: COLORS.white, fontWeight: '600', fontSize: FONTS.sizes.md },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewComment: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, lineHeight: 20 },
  actionRow: { marginTop: SPACING.xxl },
});
