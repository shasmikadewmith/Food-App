import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '@/src/constants/theme';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  available: { bg: '#1B5E20', text: '#4CAF50' },
  reserved: { bg: '#E65100', text: '#FF9800' },
  occupied: { bg: '#B71C1C', text: '#FF5252' },
  pending: { bg: '#E65100', text: '#FF9800' },
  preparing: { bg: '#1565C0', text: '#42A5F5' },
  completed: { bg: '#1B5E20', text: '#4CAF50' },
  delivered: { bg: '#1B5E20', text: '#4CAF50' },
  cancelled: { bg: '#B71C1C', text: '#FF5252' },
  assigned: { bg: '#1565C0', text: '#42A5F5' },
  'picked-up': { bg: '#4A148C', text: '#CE93D8' },
  'in-transit': { bg: '#E65100', text: '#FF9800' },
  paid: { bg: '#1B5E20', text: '#4CAF50' },
  refunded: { bg: '#B71C1C', text: '#FF5252' },
  revenue: { bg: '#1B5E20', text: '#4CAF50' },
  expense: { bg: '#B71C1C', text: '#FF5252' },
};

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export default function Badge({ status, size = 'sm' }: BadgeProps) {
  const colors = STATUS_COLORS[status] || { bg: COLORS.surfaceLight, text: COLORS.textSecondary };
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg + '33' }, size === 'md' && styles.md]}>
      <View style={[styles.dot, { backgroundColor: colors.text }]} />
      <Text style={[styles.text, { color: colors.text }, size === 'md' && styles.mdText]}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.sm, paddingVertical: 4,
    borderRadius: RADIUS.full, alignSelf: 'flex-start',
  },
  md: { paddingHorizontal: SPACING.md, paddingVertical: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: SPACING.xs },
  text: { fontSize: FONTS.sizes.xs, fontWeight: '700' },
  mdText: { fontSize: FONTS.sizes.sm },
});
