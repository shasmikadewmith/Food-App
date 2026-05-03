import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
  Alert, Modal, KeyboardAvoidingView, Platform, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from '@/src/components/Badge';
import Button from '@/src/components/Button';
import Input from '@/src/components/Input';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import api from '@/src/services/api';
import { ENDPOINTS } from '@/src/constants/api';
import Toast from 'react-native-toast-message';

type Tab = 'overview' | 'deliveries' | 'riders';

const STATUS_COLORS: Record<string, string> = {
  pending: COLORS.warning,
  assigned: '#42A5F5',
  'picked-up': '#AB47BC',
  'in-transit': COLORS.info,
  delivered: COLORS.success,
  cancelled: COLORS.error,
};

export default function AdminDeliveriesScreen() {
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Rider form
  const [showRiderModal, setShowRiderModal] = useState(false);
  const [riderName, setRiderName] = useState('');
  const [riderEmail, setRiderEmail] = useState('');
  const [riderPhone, setRiderPhone] = useState('');
  const [riderSubmitting, setRiderSubmitting] = useState(false);

  // Assign modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignDeliveryId, setAssignDeliveryId] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, delRes, riderRes] = await Promise.all([
        api.get(ENDPOINTS.DELIVERIES.STATS),
        api.get(ENDPOINTS.DELIVERIES.BASE),
        api.get(ENDPOINTS.DELIVERIES.RIDERS),
      ]);
      setStats(statsRes.data);
      setDeliveries(delRes.data);
      setRiders(riderRes.data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onRefresh = async () => { setRefreshing(true); await fetchAll(); setRefreshing(false); };

  // ===== Rider Actions =====
  const handleAddRider = async () => {
    if (!riderName.trim() || !riderEmail.trim()) {
      Toast.show({ type: 'error', text1: 'Name and email required' }); return;
    }
    setRiderSubmitting(true);
    try {
      await api.post(ENDPOINTS.DELIVERIES.RIDERS, {
        name: riderName.trim(), email: riderEmail.trim().toLowerCase(),
        phone: riderPhone.trim(), password: 'rider123',
      });
      Toast.show({ type: 'success', text1: 'Rider Added!', text2: `${riderName} has been registered` });
      setShowRiderModal(false);
      setRiderName(''); setRiderEmail(''); setRiderPhone('');
      fetchAll();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Failed', text2: err.response?.data?.message || err.message });
    } finally { setRiderSubmitting(false); }
  };

  const handleDeleteRider = (id: string, name: string) => {
    Alert.alert('Remove Rider', `Remove "${name}"? Active deliveries will be unassigned.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`${ENDPOINTS.DELIVERIES.RIDERS}/${id}`);
          Toast.show({ type: 'success', text1: 'Rider removed' });
          fetchAll();
        } catch (err: any) { Toast.show({ type: 'error', text1: err.message }); }
      }},
    ]);
  };

  // ===== Delivery Actions =====
  const handleAssignRider = async (riderId: string) => {
    try {
      await api.put(ENDPOINTS.DELIVERIES.ASSIGN(assignDeliveryId), { riderId });
      Toast.show({ type: 'success', text1: 'Rider assigned!' });
      setShowAssignModal(false);
      fetchAll();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Failed', text2: err.response?.data?.message || err.message });
    }
  };

  const handleStatusUpdate = (deliveryId: string, currentStatus: string) => {
    const statusFlow: Record<string, string> = {
      assigned: 'picked-up', 'picked-up': 'in-transit', 'in-transit': 'delivered',
    };
    const nextStatus = statusFlow[currentStatus];
    if (!nextStatus) {
      Toast.show({ type: 'info', text1: 'No further status update available' }); return;
    }
    Alert.alert('Update Status', `Change status to "${nextStatus}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Update', onPress: async () => {
        try {
          await api.put(`${ENDPOINTS.DELIVERIES.BASE}/${deliveryId}`, { status: nextStatus });
          Toast.show({ type: 'success', text1: `Status: ${nextStatus}` });
          fetchAll();
        } catch (err: any) { Toast.show({ type: 'error', text1: err.message }); }
      }},
    ]);
  };

  const handleCancelDelivery = (deliveryId: string) => {
    Alert.alert('Cancel Delivery', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      { text: 'Cancel Delivery', style: 'destructive', onPress: async () => {
        try {
          await api.put(`${ENDPOINTS.DELIVERIES.BASE}/${deliveryId}`, { status: 'cancelled' });
          Toast.show({ type: 'success', text1: 'Delivery cancelled' });
          fetchAll();
        } catch (err: any) { Toast.show({ type: 'error', text1: err.message }); }
      }},
    ]);
  };

  const handleUpdateFee = (deliveryId: string) => {
    Alert.prompt?.('Update Fee', 'Enter new delivery fee (Rs.)',
      (text: string) => {
        const fee = Number(text);
        if (isNaN(fee) || fee < 0) { Toast.show({ type: 'error', text1: 'Invalid amount' }); return; }
        api.put(`${ENDPOINTS.DELIVERIES.BASE}/${deliveryId}`, { deliveryFee: fee })
          .then(() => { Toast.show({ type: 'success', text1: `Fee updated to Rs. ${fee}` }); fetchAll(); })
          .catch((e: any) => Toast.show({ type: 'error', text1: e.message }));
      }
    );
  };

  if (loading) return <LoadingSpinner />;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // ===== RENDER TABS =====
  const renderOverview = () => (
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}>
      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        {[
          { label: 'Total', value: stats?.total || 0, icon: 'cube', color: COLORS.primary },
          { label: 'Pending', value: stats?.pending || 0, icon: 'time', color: COLORS.warning },
          { label: 'In Transit', value: stats?.inTransit || 0, icon: 'bicycle', color: COLORS.info },
          { label: 'Delivered', value: stats?.delivered || 0, icon: 'checkmark-circle', color: COLORS.success },
        ].map((s, i) => (
          <View key={i} style={[styles.statCard, SHADOWS.small]}>
            <View style={[styles.statIconBg, { backgroundColor: s.color + '22' }]}>
              <Ionicons name={s.icon as any} size={22} color={s.color} />
            </View>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Revenue + Performance */}
      <View style={[styles.summaryCard, SHADOWS.medium]}>
        <Text style={styles.summaryTitle}>Performance</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Delivery Fees</Text>
          <Text style={[styles.summaryValue, { color: COLORS.success }]}>Rs. {(stats?.totalFees || 0).toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Avg. Delivery Time</Text>
          <Text style={styles.summaryValue}>{stats?.avgDeliveryTime || 0} min</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Active Riders</Text>
          <Text style={styles.summaryValue}>{stats?.riderCount || 0}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Cancelled</Text>
          <Text style={[styles.summaryValue, { color: COLORS.error }]}>{stats?.cancelled || 0}</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderDeliveries = () => (
    <FlatList
      data={deliveries}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="cube-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No deliveries yet</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={[styles.deliveryCard, SHADOWS.small]}>
          <View style={styles.deliveryTop}>
            <View>
              <Text style={styles.orderId}>#{item.order?._id?.slice(-6).toUpperCase() || 'N/A'}</Text>
              <Text style={styles.deliveryDate}>{formatDate(item.createdAt)}</Text>
            </View>
            <View style={[styles.statusChip, { backgroundColor: (STATUS_COLORS[item.status] || COLORS.textMuted) + '22' }]}>
              <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] || COLORS.textMuted }]}>
                {item.status.replace('-', ' ')}
              </Text>
            </View>
          </View>

          <View style={styles.deliveryMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="person" size={14} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{item.user?.name || 'Customer'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location" size={14} color={COLORS.textMuted} />
              <Text style={styles.metaText} numberOfLines={1}>{item.address}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="bicycle" size={14} color={COLORS.primary} />
              <Text style={[styles.metaText, { color: item.rider ? COLORS.white : COLORS.warning }]}>
                {item.rider?.name || 'Unassigned'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="cash" size={14} color={COLORS.success} />
              <Text style={styles.metaText}>Rs. {item.deliveryFee}</Text>
            </View>
          </View>

          <View style={styles.deliveryActions}>
            {!item.rider && item.status === 'pending' && (
              <TouchableOpacity style={[styles.dActionBtn, { backgroundColor: COLORS.primary + '22' }]}
                onPress={() => { setAssignDeliveryId(item._id); setShowAssignModal(true); }}>
                <Ionicons name="person-add" size={14} color={COLORS.primary} />
                <Text style={[styles.dActionText, { color: COLORS.primary }]}>Assign</Text>
              </TouchableOpacity>
            )}
            {item.rider && !['delivered', 'cancelled'].includes(item.status) && (
              <TouchableOpacity style={[styles.dActionBtn, { backgroundColor: COLORS.success + '22' }]}
                onPress={() => handleStatusUpdate(item._id, item.status)}>
                <Ionicons name="arrow-forward" size={14} color={COLORS.success} />
                <Text style={[styles.dActionText, { color: COLORS.success }]}>Next</Text>
              </TouchableOpacity>
            )}
            {!['delivered', 'cancelled'].includes(item.status) && (
              <TouchableOpacity style={[styles.dActionBtn, { backgroundColor: COLORS.error + '22' }]}
                onPress={() => handleCancelDelivery(item._id)}>
                <Ionicons name="close-circle" size={14} color={COLORS.error} />
                <Text style={[styles.dActionText, { color: COLORS.error }]}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    />
  );

  const renderRiders = () => (
    <FlatList
      data={riders}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No riders registered</Text>
          <Button title="Add Rider" size="sm" fullWidth={false} onPress={() => setShowRiderModal(true)}
            icon={<Ionicons name="add-circle" size={16} color={COLORS.white} />}
            style={{ marginTop: SPACING.md }} />
        </View>
      }
      renderItem={({ item }) => (
        <View style={[styles.riderCard, SHADOWS.small]}>
          <View style={styles.riderTop}>
            <View style={styles.riderAvatar}>
              <Text style={styles.riderAvatarText}>{item.name?.charAt(0)?.toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.riderName}>{item.name}</Text>
              <Text style={styles.riderEmail}>{item.email}</Text>
              {item.phone ? <Text style={styles.riderPhone}>{item.phone}</Text> : null}
            </View>
            <TouchableOpacity onPress={() => handleDeleteRider(item._id, item.name)}>
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            </TouchableOpacity>
          </View>
          <View style={styles.riderStats}>
            <View style={styles.riderStat}>
              <Text style={[styles.riderStatValue, { color: COLORS.info }]}>{item.activeDeliveries || 0}</Text>
              <Text style={styles.riderStatLabel}>Active</Text>
            </View>
            <View style={styles.riderStatDivider} />
            <View style={styles.riderStat}>
              <Text style={[styles.riderStatValue, { color: COLORS.success }]}>{item.completedDeliveries || 0}</Text>
              <Text style={styles.riderStatLabel}>Completed</Text>
            </View>
          </View>
        </View>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Deliveries</Text>
        {tab === 'riders' && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowRiderModal(true)}>
            <Ionicons name="person-add" size={20} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Selector */}
      <View style={styles.tabBar}>
        {([
          { key: 'overview', label: 'Overview', icon: 'analytics' },
          { key: 'deliveries', label: 'Deliveries', icon: 'cube' },
          { key: 'riders', label: 'Riders', icon: 'people' },
        ] as { key: Tab; label: string; icon: string }[]).map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabItem, tab === t.key && styles.tabItemActive]}
            onPress={() => setTab(t.key)}
          >
            <Ionicons name={t.icon as any} size={18} color={tab === t.key ? COLORS.primary : COLORS.textMuted} />
            <Text style={[styles.tabLabel, tab === t.key && { color: COLORS.primary }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tabContent}>
          {tab === 'overview' && renderOverview()}
          {tab === 'deliveries' && renderDeliveries()}
          {tab === 'riders' && renderRiders()}
      </View>

      {/* Add Rider Modal */}
      <Modal visible={showRiderModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Rider</Text>
                <TouchableOpacity onPress={() => setShowRiderModal(false)}>
                  <Ionicons name="close-circle" size={28} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
              <Input label="Name *" placeholder="Rider name" icon="person-outline" value={riderName} onChangeText={setRiderName} />
              <Input label="Email *" placeholder="rider@example.com" icon="mail-outline" value={riderEmail} onChangeText={setRiderEmail} keyboardType="email-address" autoCapitalize="none" />
              <Input label="Phone" placeholder="+94 77 XXX XXXX" icon="call-outline" value={riderPhone} onChangeText={setRiderPhone} keyboardType="phone-pad" />
              <Text style={styles.hint}>Default password: rider123</Text>
              <Button title="Register Rider" onPress={handleAddRider} loading={riderSubmitting}
                icon={<Ionicons name="person-add" size={18} color={COLORS.white} />}
                style={{ marginTop: SPACING.md }} />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Assign Rider Modal */}
      <Modal visible={showAssignModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '70%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign Rider</Text>
              <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                <Ionicons name="close-circle" size={28} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            {riders.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No riders available. Add riders first.</Text>
              </View>
            ) : (
              <ScrollView>
                {riders.map(rider => (
                  <TouchableOpacity
                    key={rider._id}
                    style={[styles.assignCard, SHADOWS.small]}
                    onPress={() => handleAssignRider(rider._id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.riderAvatar}>
                      <Text style={styles.riderAvatarText}>{rider.name?.charAt(0)?.toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.riderName}>{rider.name}</Text>
                      <Text style={styles.riderEmail}>{rider.activeDeliveries || 0} active deliveries</Text>
                    </View>
                    <Ionicons name="arrow-forward-circle" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingTop: 60, paddingBottom: SPACING.sm },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.white },
  addBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  // Tabs
  tabBar: { flexDirection: 'row', marginHorizontal: SPACING.base, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 4, marginBottom: SPACING.md },
  tabItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: SPACING.sm, borderRadius: RADIUS.md },
  tabItemActive: { backgroundColor: COLORS.primary + '1A' },
  tabLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, fontWeight: '700' },
  tabContent: { flex: 1, paddingHorizontal: SPACING.base },
  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  statCard: { width: '48%', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.base },
  statIconBg: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  statValue: { color: COLORS.white, fontSize: FONTS.sizes.xxl, fontWeight: '800' },
  statLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginTop: 2 },
  summaryCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.xl, marginTop: SPACING.md },
  summaryTitle: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.lg, marginBottom: SPACING.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.xs },
  summaryLabel: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md },
  summaryValue: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '700' },
  // Deliveries
  deliveryCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm },
  deliveryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  orderId: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.base },
  deliveryDate: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  statusText: { fontWeight: '700', fontSize: FONTS.sizes.xs, textTransform: 'capitalize' },
  deliveryMeta: { gap: 6, marginBottom: SPACING.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, flex: 1 },
  deliveryActions: { flexDirection: 'row', gap: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm },
  dActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.sm },
  dActionText: { fontSize: FONTS.sizes.xs, fontWeight: '700' },
  // Riders
  riderCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.sm },
  riderTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  riderAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  riderAvatarText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '800' },
  riderName: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.base },
  riderEmail: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
  riderPhone: { color: COLORS.textSecondary, fontSize: FONTS.sizes.xs, marginTop: 2 },
  riderStats: { flexDirection: 'row', marginTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm },
  riderStat: { flex: 1, alignItems: 'center' },
  riderStatDivider: { width: 1, backgroundColor: COLORS.border },
  riderStatValue: { fontSize: FONTS.sizes.xl, fontWeight: '800' },
  riderStatLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  // Assign modal
  assignCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.background, borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, padding: SPACING.xl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.white },
  hint: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, fontStyle: 'italic', marginTop: SPACING.xs },
  // Empty
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: COLORS.textMuted, marginTop: SPACING.sm, fontSize: FONTS.sizes.sm },
});
