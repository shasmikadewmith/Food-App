import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/src/components/Button';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import api from '@/src/services/api';
import { ENDPOINTS } from '@/src/constants/api';
import Toast from 'react-native-toast-message';

export default function CreateReviewScreen() {
  const [dishes, setDishes] = useState<any[]>([]);
  const [selectedDish, setSelectedDish] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(ENDPOINTS.DISHES);
        setDishes(data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSubmit = async () => {
    if (!selectedDish) return Toast.show({ type: 'error', text1: 'Select a dish' });
    if (rating === 0) return Toast.show({ type: 'error', text1: 'Select a rating' });
    setSubmitting(true);
    try {
      await api.post(ENDPOINTS.REVIEWS.BASE, { dish: selectedDish, rating, comment });
      Toast.show({ type: 'success', text1: 'Review Submitted!', text2: 'Thank you for your feedback' });
      router.back();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Failed', text2: err.message });
    } finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Write a Review</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.label}>Select Dish</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.base, gap: SPACING.sm }}>
        {dishes.map(d => (
          <TouchableOpacity key={d._id} style={[styles.dishChip, selectedDish === d._id && styles.dishChipActive]} onPress={() => setSelectedDish(d._id)}>
            <Text style={[styles.dishChipText, selectedDish === d._id && { color: COLORS.white }]} numberOfLines={1}>{d.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Your Rating</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map(s => (
          <TouchableOpacity key={s} onPress={() => setRating(s)}>
            <Ionicons name={s <= rating ? 'star' : 'star-outline'} size={40} color={COLORS.accent} />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Comment (Optional)</Text>
      <View style={styles.textAreaWrap}>
        <Ionicons name="chatbubble-outline" size={18} color={COLORS.textMuted} style={{ marginTop: 12 }} />
        <TextInput
          style={styles.textArea}
          placeholder="Share your experience..."
          placeholderTextColor={COLORS.textMuted}
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={{ paddingHorizontal: SPACING.base, marginTop: SPACING.xxl }}>
        <Button title="Submit Review" onPress={handleSubmit} loading={submitting} icon={<Ionicons name="send" size={18} color={COLORS.white} />} />
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingTop: 60, paddingBottom: SPACING.md },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.white },
  label: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.white, paddingHorizontal: SPACING.base, marginTop: SPACING.xl, marginBottom: SPACING.md },
  dishChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, maxWidth: 150 },
  dishChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dishChipText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: FONTS.sizes.sm },
  starsRow: { flexDirection: 'row', gap: SPACING.md, paddingHorizontal: SPACING.base },
  textAreaWrap: { flexDirection: 'row', marginHorizontal: SPACING.base, backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.md, padding: SPACING.md, minHeight: 80, borderWidth: 1, borderColor: COLORS.border },
  textArea: { flex: 1, color: COLORS.white, fontSize: FONTS.sizes.base, marginLeft: SPACING.sm, minHeight: 80, paddingTop: 8 },
});
