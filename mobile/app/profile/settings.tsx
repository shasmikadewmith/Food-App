import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import Toast from 'react-native-toast-message';

export default function SettingsScreen() {
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'This will clear cached data. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', onPress: () => Toast.show({ type: 'success', text1: 'Cache Cleared' }) },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is irreversible. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              await logout();
              router.replace('/' as any);
              Toast.show({ type: 'success', text1: 'Account deleted' });
            } catch (e: any) {
              Toast.show({ type: 'error', text1: 'Failed', text2: e.message });
            }
          },
        },
      ]
    );
  };

  const settingSections = [
    {
      title: 'Notifications',
      items: [
        { label: 'Push Notifications', icon: 'notifications-outline' as const, toggle: true, value: notifications, onToggle: setNotifications },
        { label: 'Order Updates', icon: 'receipt-outline' as const, toggle: true, value: orderUpdates, onToggle: setOrderUpdates },
        { label: 'Promotions & Deals', icon: 'megaphone-outline' as const, toggle: true, value: promotions, onToggle: setPromotions },
      ],
    },
    {
      title: 'General',
      items: [
        { label: 'Language', icon: 'language-outline' as const, detail: 'English', onPress: () => Toast.show({ type: 'info', text1: 'Coming soon' }) },
        { label: 'Currency', icon: 'cash-outline' as const, detail: 'LKR', onPress: () => Toast.show({ type: 'info', text1: 'Coming soon' }) },
      ],
    },
    {
      title: 'Data & Storage',
      items: [
        { label: 'Clear Cache', icon: 'trash-outline' as const, onPress: handleClearCache },
      ],
    },
    {
      title: 'About',
      items: [
        { label: 'Privacy Policy', icon: 'shield-outline' as const, onPress: () => Toast.show({ type: 'info', text1: 'Coming soon' }) },
        { label: 'Terms of Service', icon: 'document-text-outline' as const, onPress: () => Toast.show({ type: 'info', text1: 'Coming soon' }) },
        { label: 'App Version', icon: 'information-circle-outline' as const, detail: '1.0.0' },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      {settingSections.map((section, sIdx) => (
        <View key={sIdx} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={[styles.sectionCard, SHADOWS.small]}>
            {section.items.map((item: any, iIdx) => (
              <TouchableOpacity
                key={iIdx}
                style={[styles.settingItem, iIdx < section.items.length - 1 && styles.settingBorder]}
                onPress={item.onPress}
                activeOpacity={item.toggle ? 1 : 0.7}
                disabled={item.toggle}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.settingIcon}>
                    <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                </View>
                {item.toggle ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: COLORS.border, true: COLORS.primary + '80' }}
                    thumbColor={item.value ? COLORS.primary : COLORS.textMuted}
                  />
                ) : item.detail ? (
                  <Text style={styles.detailText}>{item.detail}</Text>
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.dangerBtn} onPress={handleDeleteAccount}>
        <Ionicons name="warning-outline" size={18} color={COLORS.error} />
        <Text style={styles.dangerText}>Delete Account</Text>
      </TouchableOpacity>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingTop: 60, paddingBottom: SPACING.md },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.white },
  section: { marginTop: SPACING.lg },
  sectionTitle: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: SPACING.base, marginBottom: SPACING.sm },
  sectionCard: { marginHorizontal: SPACING.base, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, overflow: 'hidden' },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.base },
  settingBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  settingIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.primary + '15', alignItems: 'center', justifyContent: 'center' },
  settingLabel: { color: COLORS.white, fontSize: FONTS.sizes.base, fontWeight: '500' },
  detailText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, marginHorizontal: SPACING.base, marginTop: SPACING.xxl, paddingVertical: SPACING.md, backgroundColor: COLORS.error + '15', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.error + '33' },
  dangerText: { color: COLORS.error, fontWeight: '700', fontSize: FONTS.sizes.base },
});
