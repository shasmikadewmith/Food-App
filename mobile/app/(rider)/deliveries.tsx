import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import api from '@/src/services/api';
import { ENDPOINTS } from '@/src/constants/api';
import Toast from 'react-native-toast-message';

type Filter = 'all' | 'active' | 'delivered';

const STATUS_COLORS: Record<string, string> = {
  assigned: '#42A5F5',
  'picked-up': '#AB47BC',
  'in-transit': COLORS.info,
  delivered: COLORS.success,
  cancelled: COLORS.error,
};

export default function RiderDeliveriesScreen() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const { data } = await api.get(ENDPOINTS.DELIVERIES.MY);
      setDeliveries(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = deliveries.filter(d => {
    if (filter === 'active') return ['assigned', 'picked-up', 'in-transit'].includes(d.status);
    if (filter === 'delivered') return d.status === 'delivered';
    return true;
  });

  const handleAdvance = async (id: string) => {
    try {
      await api.put(`${ENDPOINTS.DELIVERIES.MY}/${id}`);
      Toast.show({ type: 'success', text1: 'Status updated!' });
      fetchData();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed', text2: e.response?.data?.message || e.message });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Deliveries</Text>
        <Text style={styles.count}>{filtered.length} deliveries</Text>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'active', 'delivered'] as Filter[]).map(f => (
          <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterBtnActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && { color: COLORS.white }]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        contentContainerStyle={{ paddingHorizontal: SPACING.base, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchData(); setRefreshing(false); }} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No deliveries found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, SHADOWS.small]}>
            <View style={styles.cardRow}>
              <Text style={styles.orderId}>#{item.order?._id?.slice(-6).toUpperCase()}</Text>
              <View style={[styles.statusChip, { backgroundColor: (STATUS_COLORS[item.status] || COLORS.textMuted) + '22' }]}>
                <Text style={[styles.chipText, { color: STATUS_COLORS[item.status] }]}>{item.status.replace('-', ' ')}</Text>
              </View>
            </View>
            <View style={styles.detail}>
              <Ionicons name="person" size={14} color={COLORS.textMuted} />
              <Text style={styles.detailText}>{item.user?.name}</Text>
            </View>
            <View style={styles.detail}>
              <Ionicons name="location" size={14} color={COLORS.textMuted} />
              <Text style={styles.detailText} numberOfLines={1}>{item.address}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.fee}>Rs. {item.deliveryFee}</Text>
              <Text style={styles.time}>
                {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            {['assigned', 'picked-up', 'in-transit'].includes(item.status) && (
              <TouchableOpacity style={styles.advanceBtn} onPress={() => handleAdvance(item._id)}>
                <Text style={styles.advanceBtnText}>
                  {item.status === 'assigned' && 'Mark Picked Up'}
                  {item.status === 'picked-up' && 'Start Delivery'}
                  {item.status === 'in-transit' && 'Mark Delivered'}
                </Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.base, paddingTop: 60, paddingBottom: SPACING.sm },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.white },
  count: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
  filterRow: { flexDirection: 'row', paddingHorizontal: SPACING.base, gap: SPACING.sm, marginBottom: SPACING.md },
  filterBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceLight },
  filterBtnActive: { backgroundColor: COLORS.primary },
  filterText: { color: COLORS.textMuted, fontWeight: '600', fontSize: FONTS.sizes.sm },
  card: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  orderId: { color: COLORS.white, fontWeight: '800', fontSize: FONTS.sizes.base },
  statusChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.full },
  chipText: { fontWeight: '700', fontSize: FONTS.sizes.xs, textTransform: 'capitalize' },
  detail: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  detailText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, flex: 1 },
  fee: { color: COLORS.success, fontWeight: '700', fontSize: FONTS.sizes.sm },
  time: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs },
  advanceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.primary, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, marginTop: SPACING.sm },
  advanceBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.sm },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: COLORS.textMuted, marginTop: SPACING.md },
});
