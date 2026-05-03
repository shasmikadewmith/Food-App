import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Badge from '@/src/components/Badge';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import api from '@/src/services/api';
import { ENDPOINTS } from '@/src/constants/api';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'active' | 'history'>('active');

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await api.get(ENDPOINTS.ORDERS.MY);
      setOrders(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const onRefresh = async () => { setRefreshing(true); await fetchOrders(); setRefreshing(false); };

  const activeStatuses = ['pending', 'preparing'];
  const filtered = orders.filter((o) =>
    tab === 'active' ? activeStatuses.includes(o.status) : !activeStatuses.includes(o.status)
  );

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'active' && styles.tabActive]} onPress={() => setTab('active')}>
          <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'history' && styles.tabActive]} onPress={() => setTab('history')}>
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>History</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: SPACING.base, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.orderCard, SHADOWS.small]} onPress={() => router.push(`/order/${item._id}`)} activeOpacity={0.85}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
                <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
              <Badge status={item.status} />
            </View>
            <View style={styles.orderBody}>
              <Text style={styles.orderItems} numberOfLines={1}>
                {item.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
              </Text>
              <View style={styles.orderFooter}>
                <View style={styles.orderTypeRow}>
                  <Ionicons name={item.orderType === 'delivery' ? 'bicycle-outline' : 'restaurant-outline'} size={14} color={COLORS.textMuted} />
                  <Text style={styles.orderType}>{item.orderType === 'delivery' ? 'Delivery' : 'Dine-in'}</Text>
                </View>
                <Text style={styles.orderTotal}>Rs. {item.totalPrice.toLocaleString()}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>{tab === 'active' ? 'No active orders' : 'No order history'}</Text>
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
  tabs: { flexDirection: 'row', marginHorizontal: SPACING.base, marginBottom: SPACING.base, backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.lg, padding: 4 },
  tab: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: RADIUS.md },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontWeight: '600', fontSize: FONTS.sizes.md },
  tabTextActive: { color: COLORS.white },
  orderCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
  orderId: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.base },
  orderDate: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  orderBody: {},
  orderItems: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginBottom: SPACING.sm },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  orderType: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs },
  orderTotal: { color: COLORS.primary, fontWeight: '800', fontSize: FONTS.sizes.base },
  empty: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.sizes.base, marginTop: SPACING.md },
});
