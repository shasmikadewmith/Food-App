import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import Button from '@/src/components/Button';
import Input from '@/src/components/Input';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import Toast from 'react-native-toast-message';

interface Address {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
}

export default function DeliveryAddressesScreen() {
  const { user, updateProfile } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>(
    user?.address
      ? [{ id: '1', label: 'Home', address: user.address, isDefault: true }]
      : []
  );
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [addressText, setAddressText] = useState('');

  const handleSave = async () => {
    if (!label.trim() || !addressText.trim()) {
      Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Label and address are required' });
      return;
    }

    let updatedAddresses: Address[];

    if (editingId) {
      updatedAddresses = addresses.map(a => a.id === editingId ? { ...a, label, address: addressText } : a);
      Toast.show({ type: 'success', text1: 'Address Updated' });
    } else {
      const newAddr: Address = { id: Date.now().toString(), label, address: addressText, isDefault: addresses.length === 0 };
      updatedAddresses = [...addresses, newAddr];
      Toast.show({ type: 'success', text1: 'Address Added' });
    }

    setAddresses(updatedAddresses);
    resetForm();

    // Sync the default/first address to the user profile
    try {
      const defaultAddr = updatedAddresses.find(a => a.isDefault)?.address || addressText;
      await updateProfile({ address: defaultAddr } as any);
    } catch (e) { /* silent */ }
  };

  const handleSetDefault = async (id: string) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    setAddresses(updated);
    const defaultAddr = updated.find(a => a.isDefault);
    if (defaultAddr) {
      try {
        await updateProfile({ address: defaultAddr.address } as any);
        Toast.show({ type: 'success', text1: 'Default address updated' });
      } catch (e) { /* silent */ }
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          setAddresses(prev => prev.filter(a => a.id !== id));
          Toast.show({ type: 'success', text1: 'Address removed' });
        },
      },
    ]);
  };

  const handleEdit = (addr: Address) => {
    setEditingId(addr.id);
    setLabel(addr.label);
    setAddressText(addr.address);
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setLabel('');
    setAddressText('');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Delivery Addresses</Text>
        <TouchableOpacity onPress={() => { resetForm(); setShowForm(true); }} style={styles.addBtn}>
          <Ionicons name="add" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={[styles.formCard, SHADOWS.medium]}>
          <Text style={styles.formTitle}>{editingId ? 'Edit Address' : 'New Address'}</Text>
          <Input label="Label" placeholder="e.g. Home, Office, etc." icon="pricetag-outline" value={label} onChangeText={setLabel} />
          <Input label="Address" placeholder="Enter full address" icon="location-outline" value={addressText} onChangeText={setAddressText} />
          <View style={styles.formActions}>
            <Button title="Cancel" onPress={resetForm} variant="ghost" size="sm" fullWidth={false} />
            <Button title={editingId ? 'Update' : 'Add Address'} onPress={handleSave} size="sm" fullWidth={false} icon={<Ionicons name="checkmark" size={16} color={COLORS.white} />} />
          </View>
        </View>
      )}

      {addresses.length === 0 && !showForm && (
        <View style={styles.empty}>
          <Ionicons name="location-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Addresses Yet</Text>
          <Text style={styles.emptySubtitle}>Add a delivery address to get started</Text>
          <Button title="Add Address" onPress={() => setShowForm(true)} size="sm" fullWidth={false} style={{ marginTop: SPACING.lg }} icon={<Ionicons name="add-circle" size={18} color={COLORS.white} />} />
        </View>
      )}

      {addresses.map(addr => (
        <View key={addr.id} style={[styles.addressCard, SHADOWS.small]}>
          <View style={styles.addrTop}>
            <View style={styles.addrLabelRow}>
              <View style={[styles.addrIcon, addr.isDefault && { backgroundColor: COLORS.primary + '22' }]}>
                <Ionicons name={addr.label.toLowerCase() === 'home' ? 'home' : addr.label.toLowerCase() === 'office' ? 'business' : 'location'} size={20} color={addr.isDefault ? COLORS.primary : COLORS.textMuted} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                  <Text style={styles.addrLabel}>{addr.label}</Text>
                  {addr.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.addrText} numberOfLines={2}>{addr.address}</Text>
              </View>
            </View>
          </View>
          <View style={styles.addrActions}>
            {!addr.isDefault && (
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleSetDefault(addr.id)}>
                <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.success} />
                <Text style={[styles.actionText, { color: COLORS.success }]}>Set Default</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(addr)}>
              <Ionicons name="create-outline" size={16} color={COLORS.info} />
              <Text style={[styles.actionText, { color: COLORS.info }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(addr.id)}>
              <Ionicons name="trash-outline" size={16} color={COLORS.error} />
              <Text style={[styles.actionText, { color: COLORS.error }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingTop: 60, paddingBottom: SPACING.md },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primary + '1A', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.white },
  formCard: { margin: SPACING.base, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.primary + '33' },
  formTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.white, marginBottom: SPACING.md },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.sm, marginTop: SPACING.sm },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.white, marginTop: SPACING.lg },
  emptySubtitle: { color: COLORS.textSecondary, marginTop: SPACING.xs },
  addressCard: { marginHorizontal: SPACING.base, marginTop: SPACING.md, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.base },
  addrTop: { marginBottom: SPACING.sm },
  addrLabelRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  addrIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  addrLabel: { fontSize: FONTS.sizes.base, fontWeight: '700', color: COLORS.white },
  addrText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  defaultBadge: { backgroundColor: COLORS.primary + '22', paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  defaultText: { color: COLORS.primary, fontSize: FONTS.sizes.xs, fontWeight: '700' },
  addrActions: { flexDirection: 'row', gap: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
});
