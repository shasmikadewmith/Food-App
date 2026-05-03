import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import Button from '@/src/components/Button';
import Input from '@/src/components/Input';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import api from '@/src/services/api';
import { ENDPOINTS } from '@/src/constants/api';
import Toast from 'react-native-toast-message';

interface CartItem {
  dish: string; name: string; quantity: number; price: number; image: string;
}

const DELIVERY_FEE = 200;

export default function CreateOrderScreen() {
  const { user } = useAuth();
  const { dishId } = useLocalSearchParams<{ dishId?: string }>();
  const [dishes, setDishes] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<'dine-in' | 'delivery'>('dine-in');
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [dishRes, tableRes] = await Promise.all([
          api.get(ENDPOINTS.DISHES),
          api.get(ENDPOINTS.TABLES, { params: { status: 'available' } }),
        ]);
        setDishes(dishRes.data.filter((d: any) => d.isAvailable));
        setTables(tableRes.data);

        if (dishId) {
          const d = dishRes.data.find((dish: any) => dish._id === dishId);
          if (d) setCart([{ dish: d._id, name: d.name, quantity: 1, price: d.price, image: d.image }]);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetch();
  }, [dishId]);

  const addToCart = (d: any) => {
    const existing = cart.find(i => i.dish === d._id);
    if (existing) {
      setCart(cart.map(i => i.dish === d._id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { dish: d._id, name: d.name, quantity: 1, price: d.price, image: d.image }]);
    }
  };

  const updateQty = (dishId: string, delta: number) => {
    setCart(cart.map(i => i.dish === dishId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = orderType === 'delivery' ? subtotal + DELIVERY_FEE : subtotal;

  const handleSubmit = async () => {
    if (cart.length === 0) return Alert.alert('Empty Cart', 'Add dishes to your order');
    if (orderType === 'dine-in' && !selectedTable) return Alert.alert('Select Table', 'Choose a table for dine-in');
    if (orderType === 'delivery' && !deliveryAddress.trim()) return Alert.alert('Address Required', 'Enter your delivery address');

    setSubmitting(true);
    try {
      await api.post(ENDPOINTS.ORDERS.BASE, {
        items: cart, orderType,
        table: orderType === 'dine-in' ? selectedTable : undefined,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
        notes,
      });
      Toast.show({ type: 'success', text1: 'Order Placed!', text2: orderType === 'delivery' ? 'A rider will be assigned soon' : 'Your order is being prepared' });
      router.back();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Failed', text2: err.message });
    } finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Create Order</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Order Type */}
      <Text style={styles.sectionTitle}>Order Type</Text>
      <View style={styles.typeRow}>
        {(['dine-in', 'delivery'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.typeBtn, orderType === t && styles.typeBtnActive]} onPress={() => setOrderType(t)}>
            <Ionicons name={t === 'dine-in' ? 'restaurant' : 'bicycle'} size={20} color={orderType === t ? COLORS.white : COLORS.textMuted} />
            <Text style={[styles.typeText, orderType === t && styles.typeTextActive]}>{t === 'dine-in' ? 'Dine In' : 'Delivery'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Table Selection for dine-in */}
      {orderType === 'dine-in' && (
        <>
          <Text style={styles.sectionTitle}>Select Table</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableRow}>
            {tables.map(t => (
              <TouchableOpacity key={t._id} style={[styles.tableChip, selectedTable === t._id && styles.tableChipActive]} onPress={() => setSelectedTable(t._id)}>
                <Text style={[styles.tableNum, selectedTable === t._id && { color: COLORS.white }]}>T{t.tableNumber}</Text>
                <Text style={styles.tableCap}>{t.capacity} seats</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* Delivery Address */}
      {orderType === 'delivery' && (
        <View style={{ paddingHorizontal: SPACING.base }}>
          <Input
            label="Delivery Address *"
            placeholder="Enter your full delivery address"
            icon="location-outline"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
          />
          <View style={styles.feeInfo}>
            <Ionicons name="bicycle" size={16} color={COLORS.primary} />
            <Text style={styles.feeInfoText}>Delivery fee: Rs. {DELIVERY_FEE}</Text>
          </View>
        </View>
      )}

      {/* Cart Items */}
      <Text style={styles.sectionTitle}>Cart ({cart.length} items)</Text>
      {cart.map(item => (
        <View key={item.dish} style={[styles.cartItem, SHADOWS.small]}>
          <Image source={{ uri: item.image }} style={styles.cartImage} />
          <View style={styles.cartInfo}>
            <Text style={styles.cartName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.cartPrice}>Rs. {(item.price * item.quantity).toLocaleString()}</Text>
          </View>
          <View style={styles.qtyRow}>
            <TouchableOpacity onPress={() => updateQty(item.dish, -1)} style={styles.qtyBtn}>
              <Ionicons name="remove" size={16} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity onPress={() => updateQty(item.dish, 1)} style={[styles.qtyBtn, { backgroundColor: COLORS.primary }]}>
              <Ionicons name="add" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Add More Dishes */}
      <Text style={styles.sectionTitle}>Add Dishes</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.base, gap: SPACING.sm }}>
        {dishes.filter(d => !cart.find(c => c.dish === d._id)).slice(0, 10).map(d => (
          <TouchableOpacity key={d._id} style={styles.addDish} onPress={() => addToCart(d)}>
            <Image source={{ uri: d.image }} style={styles.addDishImg} />
            <Text style={styles.addDishName} numberOfLines={1}>{d.name}</Text>
            <Text style={styles.addDishPrice}>Rs. {d.price}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Summary */}
      <View style={[styles.summary, SHADOWS.medium]}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>Rs. {subtotal.toLocaleString()}</Text>
        </View>
        {orderType === 'delivery' && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>Rs. {DELIVERY_FEE}</Text>
          </View>
        )}
        <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm, marginTop: SPACING.xs }]}>
          <Text style={[styles.summaryLabel, { color: COLORS.white, fontWeight: '800' }]}>Total</Text>
          <Text style={styles.summaryTotal}>Rs. {total.toLocaleString()}</Text>
        </View>
        <Button title="Place Order" onPress={handleSubmit} loading={submitting} disabled={cart.length === 0} icon={<Ionicons name="checkmark-circle" size={20} color={COLORS.white} />} />
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingTop: 60, paddingBottom: SPACING.md },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.white },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.white, paddingHorizontal: SPACING.base, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  typeRow: { flexDirection: 'row', paddingHorizontal: SPACING.base, gap: SPACING.md },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md, backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border },
  typeBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeText: { color: COLORS.textMuted, fontWeight: '600' },
  typeTextActive: { color: COLORS.white },
  tableRow: { paddingHorizontal: SPACING.base, gap: SPACING.sm },
  tableChip: { alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border },
  tableChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tableNum: { color: COLORS.textSecondary, fontWeight: '700', fontSize: FONTS.sizes.base },
  tableCap: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  cartItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, marginHorizontal: SPACING.base, marginBottom: SPACING.sm, padding: SPACING.sm, borderRadius: RADIUS.lg },
  cartImage: { width: 56, height: 56, borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceLight },
  cartInfo: { flex: 1, marginLeft: SPACING.md },
  cartName: { color: COLORS.white, fontWeight: '600', fontSize: FONTS.sizes.md },
  cartPrice: { color: COLORS.primary, fontWeight: '700', fontSize: FONTS.sizes.sm, marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  qtyText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.base, minWidth: 20, textAlign: 'center' },
  addDish: { width: 110, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, overflow: 'hidden' },
  addDishImg: { width: 110, height: 70, backgroundColor: COLORS.surfaceLight },
  addDishName: { color: COLORS.white, fontSize: FONTS.sizes.xs, fontWeight: '600', padding: SPACING.xs, paddingBottom: 0 },
  addDishPrice: { color: COLORS.primary, fontSize: FONTS.sizes.xs, fontWeight: '700', paddingHorizontal: SPACING.xs, paddingBottom: SPACING.xs },
  summary: { backgroundColor: COLORS.card, margin: SPACING.base, padding: SPACING.xl, borderRadius: RADIUS.xl, marginTop: SPACING.xxl },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  summaryLabel: { color: COLORS.textSecondary, fontSize: FONTS.sizes.base, fontWeight: '600' },
  summaryValue: { color: COLORS.textSecondary, fontSize: FONTS.sizes.base, fontWeight: '600' },
  summaryTotal: { color: COLORS.primary, fontSize: FONTS.sizes.xxl, fontWeight: '800' },
  feeInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: -SPACING.xs },
  feeInfoText: { color: COLORS.primary, fontSize: FONTS.sizes.sm, fontWeight: '600' },
});
