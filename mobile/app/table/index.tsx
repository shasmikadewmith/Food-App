import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Badge from '@/src/components/Badge';
import Button from '@/src/components/Button';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import api from '@/src/services/api';
import { ENDPOINTS } from '@/src/constants/api';
import Toast from 'react-native-toast-message';

const LOCATION_ICONS: Record<string, string> = { indoor: 'home', outdoor: 'sunny', vip: 'diamond' };
const LOCATION_COLORS: Record<string, string> = { indoor: '#42A5F5', outdoor: '#66BB6A', vip: '#FFD700' };

export default function TableScreen() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('');

  const fetchTables = async () => {
    try {
      const params: any = {};
      if (filter) params.status = filter;
      const { data } = await api.get(ENDPOINTS.TABLES, { params });
      setTables(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchTables(); }, [filter]);

  const handleReserve = async (tableId: string) => {
    try {
      await api.put(`${ENDPOINTS.TABLES}/${tableId}/reserve`, { reservationDate: new Date() });
      Toast.show({ type: 'success', text1: 'Reserved!', text2: 'Table has been reserved for you' });
      fetchTables();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Failed', text2: err.message });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchTables(); setRefreshing(false); }} tintColor={COLORS.primary} />}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Table Reservations</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {['', 'available', 'reserved', 'occupied'].map(s => (
          <TouchableOpacity key={s} style={[styles.filterChip, filter === s && styles.filterActive]} onPress={() => setFilter(s)}>
            <Text style={[styles.filterText, filter === s && { color: COLORS.white }]}>{s || 'All'}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.grid}>
        {tables.map(t => (
          <View key={t._id} style={[styles.tableCard, SHADOWS.small]}>
            <View style={styles.tableHeader}>
              <View style={[styles.locationIcon, { backgroundColor: (LOCATION_COLORS[t.location] || COLORS.textMuted) + '22' }]}>
                <Ionicons name={(LOCATION_ICONS[t.location] || 'grid') as any} size={18} color={LOCATION_COLORS[t.location] || COLORS.textMuted} />
              </View>
              <Badge status={t.status} />
            </View>
            <Text style={styles.tableNum}>Table {t.tableNumber}</Text>
            <View style={styles.tableInfo}>
              <Ionicons name="people-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.tableCapacity}>{t.capacity} seats</Text>
              <Text style={styles.tableDot}>•</Text>
              <Text style={styles.tableLocation}>{t.location}</Text>
            </View>
            {t.status === 'available' && (
              <Button title="Reserve" onPress={() => handleReserve(t._id)} size="sm" style={{ marginTop: SPACING.sm }} />
            )}
            {t.reservedBy && <Text style={styles.reservedBy}>By: {t.reservedBy.name}</Text>}
          </View>
        ))}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingTop: 60, paddingBottom: SPACING.md },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.white },
  filterRow: { paddingHorizontal: SPACING.base, gap: SPACING.sm, marginBottom: SPACING.base },
  filterChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceLight, borderWidth: 1, borderColor: COLORS.border },
  filterActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: FONTS.sizes.sm, textTransform: 'capitalize' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.base, gap: SPACING.md },
  tableCard: { width: '47%', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.base },
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  locationIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tableNum: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.lg },
  tableInfo: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  tableCapacity: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs },
  tableDot: { color: COLORS.textMuted },
  tableLocation: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, textTransform: 'capitalize' },
  reservedBy: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: SPACING.xs },
});
