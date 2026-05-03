import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from '@/src/constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.base * 3) / 2;

interface DishCardProps {
  dish: {
    _id: string;
    name: string;
    price: number;
    image: string;
    rating: number;
    category: string;
    prepTime?: number;
    isAvailable?: boolean;
  };
  onPress: () => void;
  onAddToOrder?: () => void;
}

export default function DishCard({ dish, onPress, onAddToOrder }: DishCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.card, SHADOWS.medium]}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: dish.image }} style={styles.image} resizeMode="cover" />
        {!dish.isAvailable && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Sold Out</Text>
          </View>
        )}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color={COLORS.accent} />
          <Text style={styles.ratingText}>{dish.rating.toFixed(1)}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{dish.name}</Text>
        <View style={styles.meta}>
          <Text style={styles.price}>Rs. {dish.price.toLocaleString()}</Text>
          {dish.prepTime && (
            <View style={styles.timeRow}>
              <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.timeText}>{dish.prepTime}m</Text>
            </View>
          )}
        </View>
      </View>
      {onAddToOrder && dish.isAvailable !== false && (
        <TouchableOpacity style={styles.addBtn} onPress={onAddToOrder}>
          <Ionicons name="add" size={18} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH, backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    overflow: 'hidden', marginBottom: SPACING.base,
  },
  imageWrapper: { position: 'relative' },
  image: { width: '100%', height: CARD_WIDTH * 0.7, backgroundColor: COLORS.surfaceLight },
  unavailableBadge: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
  },
  unavailableText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.sm },
  ratingBadge: {
    position: 'absolute', top: SPACING.sm, right: SPACING.sm,
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full,
  },
  ratingText: { color: COLORS.white, fontSize: FONTS.sizes.xs, fontWeight: '700', marginLeft: 3 },
  info: { padding: SPACING.md },
  name: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '700', marginBottom: SPACING.xs },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { color: COLORS.primary, fontSize: FONTS.sizes.md, fontWeight: '800' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  timeText: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs },
  addBtn: {
    position: 'absolute', bottom: SPACING.md, right: SPACING.md,
    backgroundColor: COLORS.primary, width: 30, height: 30, borderRadius: RADIUS.full,
    alignItems: 'center', justifyContent: 'center',
  },
});
