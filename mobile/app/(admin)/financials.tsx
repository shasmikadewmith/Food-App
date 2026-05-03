import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Badge from '@/src/components/Badge';
import Button from '@/src/components/Button';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import api from '@/src/services/api';
import { ENDPOINTS } from '@/src/constants/api';
import Toast from 'react-native-toast-message';

export default function AdminFinancialsScreen() {
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalRevenue: 0, totalExpenses: 0, profit: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newRecord, setNewRecord] = useState({ type: 'expense', amount: '', description: '', category: 'other' });

  const fetchData = useCallback(async () => {
    try {
      const params: any = {};
      if (typeFilter) params.type = typeFilter;
      const [recRes, sumRes] = await Promise.all([
        api.get(ENDPOINTS.FINANCIALS.BASE, { params }),
        api.get(ENDPOINTS.FINANCIALS.SUMMARY),
      ]);
      setRecords(recRes.data);
      setSummary(sumRes.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async () => {
    if (!newRecord.amount || !newRecord.description) return Toast.show({ type: 'error', text1: 'Fill all fields' });
    try {
      await api.post(ENDPOINTS.FINANCIALS.BASE, { ...newRecord, amount: parseFloat(newRecord.amount) });
      Toast.show({ type: 'success', text1: 'Record added' });
      setShowAdd(false);
      setNewRecord({ type: 'expense', amount: '', description: '', category: 'other' });
      fetchData();
    } catch (err: any) { Toast.show({ type: 'error', text1: err.message }); }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Remove this record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.delete(`${ENDPOINTS.FINANCIALS.BASE}/${id}`); fetchData(); } catch (e) {}
      }},
    ]);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Financials</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(!showAdd)}>
          <Ionicons name={showAdd ? 'close' : 'add'} size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.sumCard, { borderLeftColor: COLORS.success }]}>
          <Text style={styles.sumLabel}>Revenue</Text>
          <Text style={[styles.sumValue, { color: COLORS.success }]}>Rs. {summary.totalRevenue.toLocaleString()}</Text>
        </View>
        <View style={[styles.sumCard, { borderLeftColor: COLORS.error }]}>
          <Text style={styles.sumLabel}>Expenses</Text>
          <Text style={[styles.sumValue, { color: COLORS.error }]}>Rs. {summary.totalExpenses.toLocaleString()}</Text>
        </View>
      </View>
      <View style={[styles.profitCard, SHADOWS.medium]}>
        <Text style={styles.profitLabel}>Net Profit</Text>
        <Text style={[styles.profitValue, { color: summary.profit >= 0 ? COLORS.accent : COLORS.error }]}>Rs. {summary.profit.toLocaleString()}</Text>
      </View>

      {/* Add Form */}
      {showAdd && (
        <View style={[styles.formCard, SHADOWS.small]}>
          <View style={styles.typeToggle}>
            {(['revenue', 'expense'] as const).map(t => (
              <TouchableOpacity key={t} style={[styles.typeBtn, newRecord.type === t && (t === 'revenue' ? styles.revBtn : styles.expBtn)]} onPress={() => setNewRecord({ ...newRecord, type: t })}>
                <Text style={[styles.typeBtnText, newRecord.type === t && { color: COLORS.white }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={styles.input} placeholder="Amount" placeholderTextColor={COLORS.textMuted} keyboardType="numeric" value={newRecord.amount} onChangeText={v => setNewRecord({ ...newRecord, amount: v })} />
          <TextInput style={styles.input} placeholder="Description" placeholderTextColor={COLORS.textMuted} value={newRecord.description} onChangeText={v => setNewRecord({ ...newRecord, description: v })} />
          <Button title="Add Record" onPress={handleAdd} size="sm" />
        </View>
      )}

      {/* Filters */}
      <View style={styles.filterRow}>
        {['', 'revenue', 'expense'].map(t => (
          <TouchableOpacity key={t} style={[styles.chip, typeFilter === t && styles.chipActive]} onPress={() => setTypeFilter(t)}>
            <Text style={[styles.chipText, typeFilter === t && { color: COLORS.white }]}>{t || 'All'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={records}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: SPACING.base, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchData(); setRefreshing(false); }} tintColor={COLORS.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.recordCard, SHADOWS.small]} onLongPress={() => handleDelete(item._id)}>
            <View style={styles.recordLeft}>
              <View style={[styles.recordIcon, { backgroundColor: (item.type === 'revenue' ? COLORS.success : COLORS.error) + '22' }]}>
                <Ionicons name={item.type === 'revenue' ? 'trending-up' : 'trending-down'} size={18} color={item.type === 'revenue' ? COLORS.success : COLORS.error} />
              </View>
              <View>
                <Text style={styles.recordDesc} numberOfLines={1}>{item.description}</Text>
                <Text style={styles.recordDate}>{new Date(item.date).toLocaleDateString()}</Text>
              </View>
            </View>
            <Text style={[styles.recordAmount, { color: item.type === 'revenue' ? COLORS.success : COLORS.error }]}>
              {item.type === 'revenue' ? '+' : '-'}Rs. {item.amount.toLocaleString()}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingTop: 60, paddingBottom: SPACING.md },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.white },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  summaryRow: { flexDirection: 'row', paddingHorizontal: SPACING.base, gap: SPACING.md },
  sumCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.base, borderLeftWidth: 3 },
  sumLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
  sumValue: { fontWeight: '800', fontSize: FONTS.sizes.lg, marginTop: 4 },
  profitCard: { backgroundColor: COLORS.card, margin: SPACING.base, padding: SPACING.base, borderRadius: RADIUS.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profitLabel: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.base },
  profitValue: { fontWeight: '800', fontSize: FONTS.sizes.xl },
  formCard: { backgroundColor: COLORS.card, margin: SPACING.base, padding: SPACING.base, borderRadius: RADIUS.lg },
  typeToggle: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  typeBtn: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceLight },
  revBtn: { backgroundColor: COLORS.success },
  expBtn: { backgroundColor: COLORS.error },
  typeBtnText: { color: COLORS.textMuted, fontWeight: '600', textTransform: 'capitalize' },
  input: { backgroundColor: COLORS.surfaceLight, color: COLORS.white, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: 10, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  filterRow: { flexDirection: 'row', paddingHorizontal: SPACING.base, gap: SPACING.sm, marginBottom: SPACING.md },
  chip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceLight, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: FONTS.sizes.sm, textTransform: 'capitalize' },
  recordCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  recordLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  recordIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  recordDesc: { color: COLORS.white, fontWeight: '600', fontSize: FONTS.sizes.md, maxWidth: 150 },
  recordDate: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  recordAmount: { fontWeight: '800', fontSize: FONTS.sizes.md },
});
