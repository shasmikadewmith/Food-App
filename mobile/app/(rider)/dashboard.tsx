import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import api from '@/src/services/api';
import { ENDPOINTS } from '@/src/constants/api';

const STATUS_COLORS: Record<string, string> = {
  assigned: '#42A5F5',
  'picked-up': '#AB47BC',
  'in-transit': COLORS.info,
  delivered: COLORS.success,
};

export default function RiderDashboard() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const { data } = await api.get(ENDPOINTS.DELIVERIES.MY);
      setDeliveries(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  if (loading) return <LoadingSpinner />;

  const active = deliveries.filter(d => ['assigned', 'picked-up', 'in-transit'].includes(d.status));
  const completed = deliveries.filter(d => d.status === 'delivered');

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting()} 👋</Text>
          <Text style={styles.name}>{user?.name || 'Rider'}</Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.statusText}>Online</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, SHADOWS.small]}>
          <View style={[styles.statIconBg, { backgroundColor: COLORS.info + '22' }]}>
            <Ionicons name="bicycle" size={22} color={COLORS.info} />
          </View>
          <Text style={styles.statValue}>{active.length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={[styles.statCard, SHADOWS.small]}>
          <View style={[styles.statIconBg, { backgroundColor: COLORS.success + '22' }]}>
            <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
          </View>
          <Text style={styles.statValue}>{completed.length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={[styles.statCard, SHADOWS.small]}>
          <View style={[styles.statIconBg, { backgroundColor: COLORS.accent + '22' }]}>
            <Ionicons name="cash" size={22} color={COLORS.accent} />
          </View>
          <Text style={styles.statValue}>{deliveries.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Active Deliveries */}
      <Text style={styles.sectionTitle}>
        Active Deliveries {active.length > 0 && `(${active.length})`}
      </Text>

      {active.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="bicycle-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No active deliveries</Text>
          <Text style={styles.emptySubtext}>Wait for new assignments from the admin</Text>
        </View>
      ) : (
        active.map(delivery => (
          <View key={delivery._id} style={[styles.deliveryCard, SHADOWS.small]}>
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.orderId}>
                  Order #{delivery.order?._id?.slice(-6).toUpperCase() || 'N/A'}
                </Text>
                <Text style={styles.orderItems}>
                  {delivery.order?.items?.length || 0} items • Rs. {delivery.order?.totalPrice?.toLocaleString() || 0}
                </Text>
              </View>
              <View style={[styles.statusChip, { backgroundColor: (STATUS_COLORS[delivery.status] || COLORS.textMuted) + '22' }]}>
                <Text style={[styles.chipText, { color: STATUS_COLORS[delivery.status] || COLORS.textMuted }]}>
                  {delivery.status.replace('-', ' ')}
                </Text>
              </View>
            </View>

            <View style={styles.customerInfo}>
              <View style={styles.infoItem}>
                <Ionicons name="person" size={16} color={COLORS.primary} />
                <Text style={styles.infoText}>{delivery.user?.name || 'Customer'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="call" size={16} color={COLORS.success} />
                <Text style={styles.infoText}>{delivery.phone || delivery.user?.phone || 'N/A'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="location" size={16} color={COLORS.error} />
                <Text style={styles.infoText} numberOfLines={2}>{delivery.address}</Text>
              </View>
              {delivery.notes ? (
                <View style={styles.infoItem}>
                  <Ionicons name="chatbubble" size={16} color={COLORS.accent} />
                  <Text style={styles.infoText}>{delivery.notes}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Delivery Fee</Text>
              <Text style={styles.feeValue}>Rs. {delivery.deliveryFee}</Text>
            </View>

            <TouchableOpacity
              style={styles.nextBtn}
              onPress={async () => {
                try {
                  await api.put(`${ENDPOINTS.DELIVERIES.MY}/${delivery._id}`);
                  fetchData();
                } catch (e: any) { console.error(e); }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.nextBtnText}>
                {delivery.status === 'assigned' && '🍔 Mark Picked Up'}
                {delivery.status === 'picked-up' && '🚗 Start Delivery'}
                {delivery.status === 'in-transit' && '✅ Mark Delivered'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        ))
      )}

      {/* Recent Completed */}
      {completed.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recently Completed</Text>
          {completed.slice(0, 5).map(d => (
            <View key={d._id} style={[styles.completedCard, SHADOWS.small]}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <Text style={styles.completedOrder}>Order #{d.order?._id?.slice(-6).toUpperCase()}</Text>
                <Text style={styles.completedMeta}>{d.user?.name} • Rs. {d.deliveryFee}</Text>
              </View>
              <Text style={styles.completedTime}>
                {new Date(d.deliveredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          ))}
        </>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingTop: 60, paddingBottom: SPACING.md },
  greeting: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  name: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.white },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.success + '1A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  statusText: { color: COLORS.success, fontWeight: '700', fontSize: FONTS.sizes.xs },
  // Stats
  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.base, gap: SPACING.sm, marginBottom: SPACING.md },
  statCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center' },
  statIconBg: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xs },
  statValue: { color: COLORS.white, fontSize: FONTS.sizes.xl, fontWeight: '800' },
  statLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  // Section
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.white, paddingHorizontal: SPACING.base, marginTop: SPACING.md, marginBottom: SPACING.sm },
  // Delivery Card
  deliveryCard: { marginHorizontal: SPACING.base, marginBottom: SPACING.md, backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.base, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
  orderId: { color: COLORS.white, fontWeight: '800', fontSize: FONTS.sizes.base },
  orderItems: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginTop: 2 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  chipText: { fontWeight: '700', fontSize: FONTS.sizes.xs, textTransform: 'capitalize' },
  customerInfo: { gap: 8, marginBottom: SPACING.md, paddingBottom: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  infoText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, flex: 1 },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md },
  feeLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
  feeValue: { color: COLORS.success, fontWeight: '800', fontSize: FONTS.sizes.base },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingVertical: SPACING.md, borderRadius: RADIUS.lg },
  nextBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.base },
  // Empty
  emptyCard: { alignItems: 'center', marginHorizontal: SPACING.base, paddingVertical: 40, backgroundColor: COLORS.card, borderRadius: RADIUS.xl },
  emptyText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.lg, marginTop: SPACING.md },
  emptySubtext: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginTop: 4 },
  // Completed
  completedCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.base, marginBottom: SPACING.sm, backgroundColor: COLORS.card, borderRadius: RADIUS.md, padding: SPACING.md },
  completedOrder: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.sm },
  completedMeta: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  completedTime: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs },
});
