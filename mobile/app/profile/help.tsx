import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import Toast from 'react-native-toast-message';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: 'How do I place an order?',
    answer: 'Browse the menu, select your dishes, add them to your cart, and proceed to checkout. You can choose between dine-in, takeaway, or delivery.',
  },
  {
    question: 'Can I cancel my order?',
    answer: 'You can cancel your order within 5 minutes of placing it, before the kitchen starts preparation. Go to Orders → select the order → Cancel.',
  },
  {
    question: 'How do table reservations work?',
    answer: 'Go to Profile → Table Reservations, pick an available table, and reserve it. Your reservation is confirmed immediately.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept Visa, Mastercard, and Cash on Delivery. You can manage payment methods from your profile.',
  },
  {
    question: 'How do I update my profile?',
    answer: 'Go to Profile → Edit Profile to update your name, email, phone number, address, or password.',
  },
  {
    question: 'How do I leave a review?',
    answer: 'After receiving your order, go to Profile → My Reviews → Write a Review. Select the dish and share your experience.',
  },
];

const CONTACT_OPTIONS = [
  { icon: 'call-outline' as const, label: 'Call Us', detail: '+94 77 123 4567', action: () => Linking.openURL('tel:+94771234567') },
  { icon: 'mail-outline' as const, label: 'Email Support', detail: 'support@foodapp.com', action: () => Linking.openURL('mailto:support@foodapp.com') },
  { icon: 'logo-whatsapp' as const, label: 'WhatsApp', detail: '+94 77 123 4567', action: () => Linking.openURL('https://wa.me/94771234567') },
];

export default function HelpSupportScreen() {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Contact Section */}
      <Text style={styles.sectionTitle}>Contact Us</Text>
      <View style={styles.contactGrid}>
        {CONTACT_OPTIONS.map((opt, idx) => (
          <TouchableOpacity key={idx} style={[styles.contactCard, SHADOWS.small]} onPress={opt.action} activeOpacity={0.8}>
            <View style={styles.contactIconBg}>
              <Ionicons name={opt.icon} size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.contactLabel}>{opt.label}</Text>
            <Text style={styles.contactDetail}>{opt.detail}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FAQ Section */}
      <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
      <View style={[styles.faqContainer, SHADOWS.small]}>
        {FAQ_DATA.map((faq, idx) => (
          <View key={idx}>
            <TouchableOpacity
              style={[styles.faqItem, idx < FAQ_DATA.length - 1 && expandedIdx !== idx && styles.faqBorder]}
              onPress={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              activeOpacity={0.7}
            >
              <View style={styles.faqQuestion}>
                <Ionicons name="help-circle" size={20} color={COLORS.primary} />
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
              </View>
              <Ionicons name={expandedIdx === idx ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
            {expandedIdx === idx && (
              <View style={[styles.faqAnswer, idx < FAQ_DATA.length - 1 && styles.faqBorder]}>
                <Text style={styles.faqAnswerText}>{faq.answer}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>Food Ordering App v1.0.0</Text>
        <Text style={styles.appInfoSub}>Made with ❤️ in Sri Lanka</Text>
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingTop: 60, paddingBottom: SPACING.md },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.white },
  sectionTitle: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: SPACING.base, marginTop: SPACING.xl, marginBottom: SPACING.md },
  contactGrid: { flexDirection: 'row', paddingHorizontal: SPACING.base, gap: SPACING.sm },
  contactCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.base, alignItems: 'center' },
  contactIconBg: { width: 48, height: 48, borderRadius: 14, backgroundColor: COLORS.primary + '1A', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  contactLabel: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.sm, marginBottom: 2 },
  contactDetail: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, textAlign: 'center' },
  faqContainer: { marginHorizontal: SPACING.base, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, overflow: 'hidden' },
  faqItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.base },
  faqBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  faqQuestion: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1, marginRight: SPACING.sm },
  faqQuestionText: { color: COLORS.white, fontSize: FONTS.sizes.sm, fontWeight: '600', flex: 1 },
  faqAnswer: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.md, paddingLeft: SPACING.base + 20 + SPACING.sm },
  faqAnswerText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, lineHeight: 20 },
  appInfo: { alignItems: 'center', marginTop: SPACING.xxl },
  appInfoText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
  appInfoSub: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 4 },
});
