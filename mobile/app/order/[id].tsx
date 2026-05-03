import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Badge from '@/src/components/Badge';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import api from '@/src/services/api';
import { ENDPOINTS } from '@/src/constants/api';

const STATUS_STEPS = ['pending', 'preparing', 'completed', 'delivered'];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`${ENDPOINTS.ORDERS.BASE}/${id}`);
        setOrder(data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading || !order) return <LoadingSpinner />;

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Order Details</Text>
        <Badge status={order.status} size="md" />
      </View>

      <View style={[styles.card, SHADOWS.small]}>
        <Text style={styles.orderId}>Order #{order._id.slice(-6).toUpperCase()}</Text>
        <Text style={styles.date}>{new Date(order.createdAt).toLocaleString()}</Text>
      </View>

      {/* Status Timeline */}
      <View style={[styles.card, SHADOWS.small]}>
        <Text style={styles.cardTitle}>Order Status</Text>
        {STATUS_STEPS.map((step, i) => (
          <View key={step} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View style={[styles.dot, i <= currentStep ? styles.dotActive : styles.dotInactive]} />
              {i < STATUS_STEPS.length - 1 && <View style={[styles.line, i < currentStep ? styles.lineActive : styles.lineInactive]} />}
            </View>
            <Text style={[styles.stepText, i <= currentStep && styles.stepTextActive]}>
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </Text>
          </View>
        ))}
      </View>

      {/* Items */}
      <View style={[styles.card, SHADOWS.small]}>
        <Text style={styles.cardTitle}>Items</Text>
        {order.items.map((item: any, i: number) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemQty}>{item.quantity}x</Text>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>Rs. {(item.price * item.quantity).toLocaleString()}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.itemRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>Rs. {order.totalPrice.toLocaleString()}</Text>
        </View>
      </View>

      {/* Order Info */}
      <View style={[styles.card, SHADOWS.small]}>
        <Text style={styles.cardTitle}>Order Info</Text>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Type</Text><Text style={styles.infoValue}>{order.orderType}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Payment</Text><Badge status={order.paymentStatus} /></View>
        {order.deliveryAddress && <View style={styles.infoRow}><Text style={styles.infoLabel}>Address</Text><Text style={styles.infoValue}>{order.deliveryAddress}</Text></View>}
        {order.notes && <View style={styles.infoRow}><Text style={styles.infoLabel}>Notes</Text><Text style={styles.infoValue}>{order.notes}</Text></View>}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingTop: 60, paddingBottom: SPACING.md },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.white },
  card: { backgroundColor: COLORS.card, marginHorizontal: SPACING.base, marginBottom: SPACING.md, padding: SPACING.base, borderRadius: RADIUS.lg },
  orderId: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.lg },
  date: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginTop: 4 },
  cardTitle: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.base, marginBottom: SPACING.md },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 40 },
  timelineLeft: { alignItems: 'center', marginRight: SPACING.md, width: 20 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  dotActive: { backgroundColor: COLORS.primary },
  dotInactive: { backgroundColor: COLORS.textMuted },
  line: { width: 2, flex: 1, minHeight: 20 },
  lineActive: { backgroundColor: COLORS.primary },
  lineInactive: { backgroundColor: COLORS.border },
  stepText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md, paddingBottom: SPACING.sm },
  stepTextActive: { color: COLORS.white, fontWeight: '600' },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.xs },
  itemQty: { color: COLORS.primary, fontWeight: '700', width: 30 },
  itemName: { flex: 1, color: COLORS.white, fontSize: FONTS.sizes.md },
  itemPrice: { color: COLORS.textSecondary, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  totalLabel: { flex: 1, color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.base },
  totalValue: { color: COLORS.primary, fontWeight: '800', fontSize: FONTS.sizes.lg },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.xs },
  infoLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.md },
  infoValue: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
});
