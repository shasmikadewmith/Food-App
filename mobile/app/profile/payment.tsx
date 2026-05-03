import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/src/components/Button';
import Input from '@/src/components/Input';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import Toast from 'react-native-toast-message';

interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'cash';
  last4: string;
  holderName: string;
  isDefault: boolean;
}

const CARD_ICONS: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  visa: { icon: 'card', color: '#1A1F71' },
  mastercard: { icon: 'card', color: '#EB001B' },
  cash: { icon: 'cash', color: COLORS.success },
};

export default function PaymentMethodsScreen() {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'cash', last4: '', holderName: 'Cash on Delivery', isDefault: true },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [holderName, setHolderName] = useState('');

  const handleAddCard = () => {
    if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length < 12) {
      Toast.show({ type: 'error', text1: 'Invalid card number' });
      return;
    }
    if (!holderName.trim()) {
      Toast.show({ type: 'error', text1: 'Cardholder name is required' });
      return;
    }

    const last4 = cardNumber.replace(/\s/g, '').slice(-4);
    const type = cardNumber.startsWith('4') ? 'visa' : 'mastercard';
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type,
      last4,
      holderName: holderName.trim(),
      isDefault: false,
    };
    setMethods(prev => [...prev, newMethod]);
    setShowForm(false);
    setCardNumber('');
    setHolderName('');
    Toast.show({ type: 'success', text1: 'Card Added!', text2: `****${last4} has been saved` });
  };

  const handleSetDefault = (id: string) => {
    setMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
    Toast.show({ type: 'success', text1: 'Default payment updated' });
  };

  const handleDelete = (id: string) => {
    const method = methods.find(m => m.id === id);
    if (method?.isDefault) {
      Toast.show({ type: 'error', text1: 'Cannot delete default payment method' });
      return;
    }
    Alert.alert('Remove Card', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: () => {
          setMethods(prev => prev.filter(m => m.id !== id));
          Toast.show({ type: 'success', text1: 'Card removed' });
        },
      },
    ]);
  };

  const formatCardInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Payment Methods</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)} style={styles.addBtn}>
          <Ionicons name={showForm ? 'close' : 'add'} size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={[styles.formCard, SHADOWS.medium]}>
          <Text style={styles.formTitle}>Add New Card</Text>
          <Input label="Card Number" placeholder="1234 5678 9012 3456" icon="card-outline" value={cardNumber} onChangeText={formatCardInput} keyboardType="numeric" />
          <Input label="Cardholder Name" placeholder="Name on card" icon="person-outline" value={holderName} onChangeText={setHolderName} autoCapitalize="words" />
          <Button title="Add Card" onPress={handleAddCard} icon={<Ionicons name="add-circle" size={18} color={COLORS.white} />} style={{ marginTop: SPACING.sm }} />
        </View>
      )}

      {methods.map(method => (
        <TouchableOpacity
          key={method.id}
          style={[styles.card, method.isDefault && styles.cardDefault, SHADOWS.small]}
          onPress={() => handleSetDefault(method.id)}
          activeOpacity={0.8}
        >
          <View style={styles.cardTop}>
            <View style={[styles.cardIconBg, { backgroundColor: (CARD_ICONS[method.type]?.color || COLORS.textMuted) + '22' }]}>
              <Ionicons name={CARD_ICONS[method.type]?.icon || 'card'} size={22} color={CARD_ICONS[method.type]?.color || COLORS.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                <Text style={styles.cardType}>{method.type === 'cash' ? 'Cash on Delivery' : `${method.type.charAt(0).toUpperCase() + method.type.slice(1)} ****${method.last4}`}</Text>
                {method.isDefault && (
                  <View style={styles.defaultBadge}><Text style={styles.defaultText}>Default</Text></View>
                )}
              </View>
              <Text style={styles.cardHolder}>{method.holderName}</Text>
            </View>
            {method.type !== 'cash' && (
              <TouchableOpacity onPress={() => handleDelete(method.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="trash-outline" size={18} color={COLORS.error} />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
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
  card: { marginHorizontal: SPACING.base, marginTop: SPACING.md, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.base, borderWidth: 1, borderColor: COLORS.border },
  cardDefault: { borderColor: COLORS.primary + '55' },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  cardIconBg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardType: { fontSize: FONTS.sizes.base, fontWeight: '700', color: COLORS.white },
  cardHolder: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  defaultBadge: { backgroundColor: COLORS.primary + '22', paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  defaultText: { color: COLORS.primary, fontSize: FONTS.sizes.xs, fontWeight: '700' },
});
