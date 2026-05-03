import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import Button from '@/src/components/Button';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login' as any); } },
    ]);
  };

  const menuItems: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }[] = [
    { icon: 'person-outline', label: 'Edit Profile', onPress: () => router.push('/profile/edit' as any) },
    { icon: 'card-outline', label: 'Payment Methods', onPress: () => router.push('/profile/payment' as any) },
    { icon: 'receipt-outline', label: 'Order History', onPress: () => router.push('/(tabs)/orders' as any) },
    { icon: 'grid-outline', label: 'Table Reservations', onPress: () => router.push('/table/' as any) },
    { icon: 'star-outline', label: 'My Reviews', onPress: () => router.push('/profile/reviews' as any) },
    { icon: 'settings-outline', label: 'Settings', onPress: () => router.push('/profile/settings' as any) },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => router.push('/profile/help' as any) },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.role === 'admin' && (
          <TouchableOpacity style={styles.adminBadge} onPress={() => router.push('/(admin)/dashboard' as any)}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.accent} />
            <Text style={styles.adminText}>Admin Panel</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIconBg}>
                <Ionicons name={item.icon} size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.logoutSection}>
        <Button title="Logout" onPress={handleLogout} variant="outline" icon={<Ionicons name="log-out-outline" size={20} color={COLORS.primary} />} />
      </View>

      <Text style={styles.version}>Version 1.0.0</Text>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { alignItems: 'center', paddingTop: 70, paddingBottom: SPACING.xxl },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  avatarText: { fontSize: FONTS.sizes.xxxl, fontWeight: '800', color: COLORS.white },
  name: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.white },
  email: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginTop: 4 },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.sm, backgroundColor: COLORS.accent + '1A', paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full },
  adminText: { color: COLORS.accent, fontWeight: '700', fontSize: FONTS.sizes.sm },
  menuSection: { marginHorizontal: SPACING.base, backgroundColor: COLORS.card, borderRadius: RADIUS.xl, overflow: 'hidden', ...SHADOWS.small },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.base, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  menuIconBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.primary + '15', alignItems: 'center', justifyContent: 'center' },
  menuLabel: { color: COLORS.white, fontSize: FONTS.sizes.base, fontWeight: '500' },
  logoutSection: { marginHorizontal: SPACING.base, marginTop: SPACING.xxl },
  version: { textAlign: 'center', color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: SPACING.lg },
});
