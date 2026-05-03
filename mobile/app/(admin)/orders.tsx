import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from '@/src/components/Badge';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import api from '@/src/services/api';
import { ENDPOINTS } from '@/src/constants/api';
import Toast from 'react-native-toast-message';

const STATUSES = ['pending', 'preparing', 'completed', 'delivered', 'cancelled'];

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get(ENDPOINTS.ORDERS.BASE, { params });
      setOrders(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = (orderId: string, current: string) => {
    const nextStatuses = STATUSES.filter(s => s !== current);
    Alert.alert('Update Status', 'Select new status', [
      ...nextStatuses.map(s => ({
        text: s.charAt(0).toUpperCase() + s.slice(1),
        onPress: async () => {
          try {
            await api.put(`${ENDPOINTS.ORDERS.BASE}/${orderId}/status`, { status: s });
            Toast.show({ type: 'success', text1: `Status: ${s}` });
            fetchOrders();
          } catch (err: any) { Toast.show({ type: 'error', text1: err.message }); }
        },
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Orders</Text>
        <Text style={styles.count}>{orders.length} orders</Text>
      </View>

      <FlatList data={['', ...STATUSES]} horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACING.base, gap: SPACING.sm, marginBottom: SPACING.base }}
        keyExtractor={(i) => i}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.chip, statusFilter === item && styles.chipActive]} onPress={() => setStatusFilter(item)}>
            <Text style={[styles.chipText, statusFilter === item && { color: COLORS.white }]}>{item || 'All'}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: SPACING.base, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchOrders(); setRefreshing(false); }} tintColor={COLORS.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, SHADOWS.small]} onPress={() => updateStatus(item._id, item.status)} activeOpacity={0.8}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>#{item._id.slice(-6).toUpperCase()}</Text>
              <Badge status={item.status} />
            </View>
            <Text style={styles.customer}>{item.user?.name || 'Unknown'} • {item.user?.email}</Text>
            <Text style={styles.items}>{item.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}</Text>
            <View style={styles.cardFooter}>
              <View style={styles.typeRow}>
                <Ionicons name={item.orderType === 'delivery' ? 'bicycle' : 'restaurant'} size={14} color={COLORS.textMuted} />
                <Text style={styles.type}>{item.orderType}</Text>
              </View>
              <Text style={styles.total}>Rs. {item.totalPrice?.toLocaleString()}</Text>
            </View>
            <Text style={styles.tapHint}>Tap to update status</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.base, paddingTop: 60, paddingBottom: SPACING.md },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.white },
  count: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
  chip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceLight, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: FONTS.sizes.sm, textTransform: 'capitalize' },
  card: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  orderId: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.base },
  customer: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginBottom: 4 },
  items: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginBottom: SPACING.sm },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  type: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, textTransform: 'capitalize' },
  total: { color: COLORS.primary, fontWeight: '800', fontSize: FONTS.sizes.base },
  tapHint: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, textAlign: 'center', marginTop: SPACING.sm, fontStyle: 'italic' },
});
