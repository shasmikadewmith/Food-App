import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import Button from '@/src/components/Button';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import api from '@/src/services/api';
import { ENDPOINTS } from '@/src/constants/api';
import Toast from 'react-native-toast-message';

export default function MyReviewsScreen() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const { data } = await api.get(ENDPOINTS.REVIEWS.MY);
      setReviews(data);
    } catch (e: any) {
      console.error(e);
      Toast.show({ type: 'error', text1: 'Failed to load reviews', text2: e.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Review', 'Are you sure you want to delete this review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`${ENDPOINTS.REVIEWS.BASE}/${id}`);
            setReviews(prev => prev.filter(r => r._id !== id));
            Toast.show({ type: 'success', text1: 'Review deleted' });
          } catch (err: any) {
            Toast.show({ type: 'error', text1: 'Failed', text2: err.message });
          }
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchReviews(); setRefreshing(false); }} tintColor={COLORS.primary} />}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>My Reviews</Text>
        <TouchableOpacity onPress={() => router.push('/review/create' as any)} style={styles.addBtn}>
          <Ionicons name="add" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {reviews.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="star-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Reviews Yet</Text>
          <Text style={styles.emptySubtitle}>Share your thoughts on dishes you've tried</Text>
          <Button title="Write a Review" onPress={() => router.push('/review/create' as any)} size="sm" fullWidth={false} style={{ marginTop: SPACING.lg }} icon={<Ionicons name="create" size={18} color={COLORS.white} />} />
        </View>
      ) : (
        reviews.map(review => (
          <View key={review._id} style={[styles.reviewCard, SHADOWS.small]}>
            <View style={styles.reviewTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dishName}>{review.dish?.name || 'Unknown Dish'}</Text>
                <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: review.isApproved ? COLORS.success + '22' : COLORS.warning + '22' }]}>
                <Text style={[styles.statusText, { color: review.isApproved ? COLORS.success : COLORS.warning }]}>
                  {review.isApproved ? 'Approved' : 'Pending'}
                </Text>
              </View>
            </View>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(s => (
                <Ionicons key={s} name={s <= review.rating ? 'star' : 'star-outline'} size={18} color={COLORS.accent} />
              ))}
              <Text style={styles.ratingText}>{review.rating}/5</Text>
            </View>

            {review.comment ? <Text style={styles.comment}>{review.comment}</Text> : null}

            <View style={styles.reviewActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(review._id)}>
                <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                <Text style={[styles.actionText, { color: COLORS.error }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingTop: 60, paddingBottom: SPACING.md },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primary + '1A', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.white },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.white, marginTop: SPACING.lg },
  emptySubtitle: { color: COLORS.textSecondary, marginTop: SPACING.xs },
  reviewCard: { marginHorizontal: SPACING.base, marginTop: SPACING.md, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.base },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  dishName: { fontSize: FONTS.sizes.base, fontWeight: '700', color: COLORS.white },
  reviewDate: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  statusText: { fontSize: FONTS.sizes.xs, fontWeight: '700' },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: SPACING.sm },
  ratingText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginLeft: SPACING.sm },
  comment: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, lineHeight: 20, marginBottom: SPACING.sm },
  reviewActions: { flexDirection: 'row', gap: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
});
