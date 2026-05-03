import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';

export default function RiderProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login' as any); } },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'R'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Ionicons name="bicycle" size={14} color={COLORS.primary} />
          <Text style={styles.roleText}>Delivery Rider</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        {user?.phone ? (
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>{user.phone}</Text>
          </View>
        ) : null}
        {user?.address ? (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
            <Text style={styles.infoText}>{user.address}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile/edit' as any)}>
          <View style={styles.menuIcon}><Ionicons name="person-outline" size={20} color={COLORS.primary} /></View>
          <Text style={styles.menuLabel}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile/help' as any)}>
          <View style={styles.menuIcon}><Ionicons name="help-circle-outline" size={20} color={COLORS.primary} /></View>
          <Text style={styles.menuLabel}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { alignItems: 'center', paddingTop: 70, paddingBottom: SPACING.xl },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  avatarText: { fontSize: FONTS.sizes.xxxl, fontWeight: '800', color: COLORS.white },
  name: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.white },
  email: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginTop: 4 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.sm, backgroundColor: COLORS.primary + '1A', paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.full },
  roleText: { color: COLORS.primary, fontWeight: '700', fontSize: FONTS.sizes.xs },
  infoCard: { marginHorizontal: SPACING.base, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOWS.small },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.xs },
  infoText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.base },
  menuSection: { marginHorizontal: SPACING.base, marginTop: SPACING.lg, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.small },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.base, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.primary + '15', alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  menuLabel: { flex: 1, color: COLORS.white, fontSize: FONTS.sizes.base, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, marginHorizontal: SPACING.base, marginTop: SPACING.xxl, paddingVertical: SPACING.md, backgroundColor: COLORS.error + '15', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.error + '33' },
  logoutText: { color: COLORS.error, fontWeight: '700', fontSize: FONTS.sizes.base },
});
