import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import api from '@/src/services/api';
import { ENDPOINTS } from '@/src/constants/api';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ orders: 0, dishes: 0, tables: 0, revenue: 0, expenses: 0, profit: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [ordersRes, dishesRes, tablesRes, finRes] = await Promise.all([
        api.get(ENDPOINTS.ORDERS.BASE), api.get(ENDPOINTS.DISHES),
        api.get(ENDPOINTS.TABLES), api.get(ENDPOINTS.FINANCIALS.SUMMARY),
      ]);
      setStats({
        orders: ordersRes.data.length, dishes: dishesRes.data.length,
        tables: tablesRes.data.length, revenue: finRes.data.totalRevenue,
        expenses: finRes.data.totalExpenses, profit: finRes.data.profit,
      });
      setRecentOrders(ordersRes.data.slice(0, 5));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { label: 'Total Orders', value: stats.orders, icon: 'receipt', color: '#42A5F5', bg: '#42A5F522' },
    { label: 'Dishes', value: stats.dishes, icon: 'fast-food', color: COLORS.primary, bg: COLORS.primary + '22' },
    { label: 'Tables', value: stats.tables, icon: 'grid', color: '#66BB6A', bg: '#66BB6A22' },
    { label: 'Revenue', value: `Rs.${(stats.revenue / 1000).toFixed(1)}k`, icon: 'trending-up', color: COLORS.accent, bg: COLORS.accent + '22' },
  ];

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Dashboard</Text>
          <Text style={styles.name}>{user?.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={async () => { await logout(); router.replace('/(auth)/login' as any); }}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      {/* Stat Cards */}
      <View style={styles.statsGrid}>
        {statCards.map((s, i) => (
          <View key={i} style={[styles.statCard, SHADOWS.small]}>
            <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
              <Ionicons name={s.icon as any} size={22} color={s.color} />
            </View>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Financial Summary */}
      <View style={[styles.finCard, SHADOWS.medium]}>
        <Text style={styles.finTitle}>Financial Summary</Text>
        <View style={styles.finRow}><Text style={styles.finLabel}>Revenue</Text><Text style={[styles.finValue, { color: COLORS.success }]}>Rs. {stats.revenue.toLocaleString()}</Text></View>
        <View style={styles.finRow}><Text style={styles.finLabel}>Expenses</Text><Text style={[styles.finValue, { color: COLORS.error }]}>Rs. {stats.expenses.toLocaleString()}</Text></View>
        <View style={[styles.finRow, styles.finDivider]}><Text style={styles.finLabel}>Profit</Text><Text style={[styles.finValue, { color: stats.profit >= 0 ? COLORS.accent : COLORS.error, fontWeight: '800' }]}>Rs. {stats.profit.toLocaleString()}</Text></View>
      </View>

      {/* Recent Orders */}
      <Text style={styles.sectionTitle}>Recent Orders</Text>
      {recentOrders.map((o) => (
        <View key={o._id} style={[styles.orderCard, SHADOWS.small]}>
          <View style={styles.orderRow}>
            <Text style={styles.orderId}>#{o._id.slice(-6).toUpperCase()}</Text>
            <Text style={[styles.orderStatus, { color: o.status === 'pending' ? COLORS.warning : o.status === 'completed' ? COLORS.success : COLORS.info }]}>{o.status}</Text>
          </View>
          <Text style={styles.orderInfo}>{o.items?.length || 0} items • Rs. {o.totalPrice?.toLocaleString()}</Text>
        </View>
      ))}

      {/* Quick Links */}
      <Text style={styles.sectionTitle}>Management</Text>
      <View style={styles.quickGrid}>
        {[
          { label: 'Dishes', icon: 'fast-food', route: '/(admin)/dishes' },
          { label: 'Orders', icon: 'receipt', route: '/(admin)/orders' },
          { label: 'Tables', icon: 'grid', route: '/(admin)/tables' },
          { label: 'Finance', icon: 'wallet', route: '/(admin)/financials' },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={styles.quickItem} onPress={() => router.push(item.route as any)}>
            <Ionicons name={item.icon as any} size={24} color={COLORS.primary} />
            <Text style={styles.quickLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingTop: 60, paddingBottom: SPACING.md },
  greeting: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  name: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.white },
  logoutBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.error + '1A', alignItems: 'center', justifyContent: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.base, gap: SPACING.md },
  statCard: { width: '47%', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.base },
  statIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  statValue: { color: COLORS.white, fontSize: FONTS.sizes.xxl, fontWeight: '800' },
  statLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginTop: 2 },
  finCard: { backgroundColor: COLORS.card, margin: SPACING.base, padding: SPACING.xl, borderRadius: RADIUS.xl },
  finTitle: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.lg, marginBottom: SPACING.md },
  finRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.xs },
  finLabel: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md },
  finValue: { fontSize: FONTS.sizes.md, fontWeight: '700' },
  finDivider: { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: SPACING.sm, paddingTop: SPACING.sm },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.white, paddingHorizontal: SPACING.base, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  orderCard: { backgroundColor: COLORS.card, marginHorizontal: SPACING.base, marginBottom: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.md },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  orderId: { color: COLORS.white, fontWeight: '700' },
  orderStatus: { fontWeight: '700', textTransform: 'capitalize', fontSize: FONTS.sizes.sm },
  orderInfo: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginTop: 4 },
  quickGrid: { flexDirection: 'row', paddingHorizontal: SPACING.base, gap: SPACING.md },
  quickItem: { flex: 1, alignItems: 'center', backgroundColor: COLORS.card, paddingVertical: SPACING.lg, borderRadius: RADIUS.lg },
  quickLabel: { color: COLORS.textSecondary, fontSize: FONTS.sizes.xs, fontWeight: '600', marginTop: SPACING.xs },
});
