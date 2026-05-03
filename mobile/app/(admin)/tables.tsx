import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from '@/src/components/Badge';
import Button from '@/src/components/Button';
import Input from '@/src/components/Input';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import api from '@/src/services/api';
import { ENDPOINTS } from '@/src/constants/api';
import Toast from 'react-native-toast-message';

const LOCATIONS = [
  { value: 'indoor', label: 'Indoor', icon: 'home', color: '#42A5F5' },
  { value: 'outdoor', label: 'Outdoor', icon: 'sunny', color: '#66BB6A' },
  { value: 'vip', label: 'VIP', icon: 'diamond', color: '#FFD700' },
];

export default function AdminTablesScreen() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [location, setLocation] = useState('indoor');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchTables = useCallback(async () => {
    try {
      const { data } = await api.get(ENDPOINTS.TABLES);
      setTables(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  const openAddModal = () => {
    setEditingTable(null);
    const nextNum = tables.length > 0 ? Math.max(...tables.map(t => t.tableNumber)) + 1 : 1;
    setTableNumber(nextNum.toString());
    setCapacity('4');
    setLocation('indoor');
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (table: any) => {
    setEditingTable(table);
    setTableNumber(table.tableNumber.toString());
    setCapacity(table.capacity.toString());
    setLocation(table.location);
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!tableNumber || isNaN(Number(tableNumber)) || Number(tableNumber) <= 0) e.tableNumber = 'Valid table number required';
    if (!capacity || isNaN(Number(capacity)) || Number(capacity) < 1 || Number(capacity) > 20) e.capacity = 'Capacity: 1-20';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        tableNumber: Number(tableNumber),
        capacity: Number(capacity),
        location,
      };

      if (editingTable) {
        await api.put(`${ENDPOINTS.TABLES}/${editingTable._id}`, payload);
        Toast.show({ type: 'success', text1: 'Table Updated!' });
      } else {
        await api.post(ENDPOINTS.TABLES, payload);
        Toast.show({ type: 'success', text1: 'Table Created!', text2: `Table ${payload.tableNumber} has been added` });
      }
      setShowModal(false);
      fetchTables();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Failed', text2: err.message });
    } finally { setSubmitting(false); }
  };

  const handleDelete = (id: string, num: number) => {
    Alert.alert('Delete Table', `Delete Table ${num}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`${ENDPOINTS.TABLES}/${id}`);
          Toast.show({ type: 'success', text1: 'Table deleted' });
          fetchTables();
        } catch (err: any) { Toast.show({ type: 'error', text1: err.message }); }
      }},
    ]);
  };

  const handleRelease = (id: string) => {
    Alert.alert('Release Table', 'Mark this table as available?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Release', onPress: async () => {
        try {
          await api.put(`${ENDPOINTS.TABLES}/${id}/release`);
          Toast.show({ type: 'success', text1: 'Table released' });
          fetchTables();
        } catch (err: any) { Toast.show({ type: 'error', text1: err.message }); }
      }},
    ]);
  };

  const handleStatusChange = (id: string) => {
    Alert.alert('Change Status', 'Select status', [
      { text: 'Available', onPress: () => updateTable(id, 'available') },
      { text: 'Occupied', onPress: () => updateTable(id, 'occupied') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const updateTable = async (id: string, status: string) => {
    try {
      await api.put(`${ENDPOINTS.TABLES}/${id}`, { status });
      Toast.show({ type: 'success', text1: `Status: ${status}` });
      fetchTables();
    } catch (err: any) { Toast.show({ type: 'error', text1: err.message }); }
  };

  if (loading) return <LoadingSpinner />;

  const availableCount = tables.filter(t => t.status === 'available').length;
  const reservedCount = tables.filter(t => t.status === 'reserved').length;
  const occupiedCount = tables.filter(t => t.status === 'occupied').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Table Management</Text>
          <Text style={styles.subtitle}>
            {availableCount} available • {reservedCount} reserved • {occupiedCount} occupied
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tables}
        numColumns={2}
        columnWrapperStyle={styles.rowStyle}
        contentContainerStyle={{ paddingHorizontal: SPACING.base, paddingBottom: 100 }}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchTables(); setRefreshing(false); }} tintColor={COLORS.primary} />}
        renderItem={({ item }) => (
          <View style={[styles.card, SHADOWS.small]}>
            <View style={styles.cardHeader}>
              <Text style={styles.tableNum}>T{item.tableNumber}</Text>
              <Badge status={item.status} />
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="people" size={14} color={COLORS.textMuted} />
              <Text style={styles.infoText}>{item.capacity} seats</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={14} color={COLORS.textMuted} />
              <Text style={styles.infoText}>{item.location}</Text>
            </View>
            {item.reservedBy && <Text style={styles.reservedBy}>Reserved: {item.reservedBy.name}</Text>}

            <View style={styles.cardActions}>
              {item.status === 'reserved' ? (
                <TouchableOpacity style={[styles.cardActionBtn, { backgroundColor: COLORS.success + '22' }]} onPress={() => handleRelease(item._id)}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={[styles.cardActionText, { color: COLORS.success }]}>Release</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.cardActionBtn, { backgroundColor: COLORS.info + '22' }]} onPress={() => handleStatusChange(item._id)}>
                  <Ionicons name="swap-horizontal" size={16} color={COLORS.info} />
                  <Text style={[styles.cardActionText, { color: COLORS.info }]}>Status</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.cardActionBtn, { backgroundColor: COLORS.primary + '22' }]} onPress={() => openEditModal(item)}>
                <Ionicons name="create" size={16} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cardActionBtn, { backgroundColor: COLORS.error + '22' }]} onPress={() => handleDelete(item._id, item.tableNumber)}>
                <Ionicons name="trash" size={16} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Add/Edit Table Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingTable ? 'Edit Table' : 'Add New Table'}</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Ionicons name="close-circle" size={28} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Input label="Table Number *" placeholder="1" icon="grid-outline" value={tableNumber} onChangeText={setTableNumber} keyboardType="numeric" error={errors.tableNumber} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input label="Capacity *" placeholder="4" icon="people-outline" value={capacity} onChangeText={setCapacity} keyboardType="numeric" error={errors.capacity} />
                  </View>
                </View>

                <Text style={styles.fieldLabel}>Location *</Text>
                <View style={styles.locationRow}>
                  {LOCATIONS.map(loc => (
                    <TouchableOpacity
                      key={loc.value}
                      style={[styles.locationCard, location === loc.value && { borderColor: loc.color, backgroundColor: loc.color + '15' }]}
                      onPress={() => setLocation(loc.value)}
                    >
                      <View style={[styles.locationIcon, { backgroundColor: loc.color + '22' }]}>
                        <Ionicons name={loc.icon as any} size={22} color={loc.color} />
                      </View>
                      <Text style={[styles.locationLabel, location === loc.value && { color: COLORS.white }]}>{loc.label}</Text>
                      {location === loc.value && (
                        <View style={styles.checkMark}>
                          <Ionicons name="checkmark-circle" size={18} color={loc.color} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                <Button
                  title={editingTable ? 'Update Table' : 'Create Table'}
                  onPress={handleSubmit}
                  loading={submitting}
                  icon={<Ionicons name={editingTable ? 'checkmark-circle' : 'add-circle'} size={20} color={COLORS.white} />}
                  style={{ marginTop: SPACING.lg }}
                />
                <View style={{ height: 30 }} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingTop: 60, paddingBottom: SPACING.md },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.white },
  subtitle: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginTop: 4 },
  addBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOWS.glow },
  rowStyle: { justifyContent: 'space-between', marginBottom: SPACING.md },
  card: { width: '48%', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.base },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  tableNum: { color: COLORS.white, fontWeight: '800', fontSize: FONTS.sizes.xl },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  infoText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, textTransform: 'capitalize' },
  reservedBy: { color: COLORS.primary, fontSize: FONTS.sizes.xs, fontWeight: '600', marginTop: SPACING.sm },
  cardActions: { flexDirection: 'row', gap: SPACING.xs, marginTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm },
  cardActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 6, borderRadius: RADIUS.sm },
  cardActionText: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { backgroundColor: COLORS.background, borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, padding: SPACING.xl, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.white },
  formRow: { flexDirection: 'row', gap: SPACING.sm },
  fieldLabel: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: '600', marginBottom: SPACING.sm, marginLeft: SPACING.xs, marginTop: SPACING.xs },
  locationRow: { flexDirection: 'row', gap: SPACING.sm },
  locationCard: { flex: 1, alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.border },
  locationIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  locationLabel: { color: COLORS.textSecondary, fontWeight: '700', fontSize: FONTS.sizes.sm },
  checkMark: { position: 'absolute', top: 6, right: 6 },
});
