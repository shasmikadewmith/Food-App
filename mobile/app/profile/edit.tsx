import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import Button from '@/src/components/Button';
import Input from '@/src/components/Input';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';
import Toast from 'react-native-toast-message';

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email';
    if (password && password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const profileData: any = { name, email, phone, address };
      if (password) profileData.password = password;
      await updateProfile(profileData);
      Toast.show({ type: 'success', text1: 'Profile Updated!', text2: 'Your changes have been saved' });
      router.back();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Update Failed', text2: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.avatarHint}>Tap to change photo</Text>
        </View>

        <View style={styles.form}>
          <Input label="Full Name" placeholder="Enter your name" icon="person-outline" value={name} onChangeText={setName} error={errors.name} />
          <Input label="Email" placeholder="Enter your email" icon="mail-outline" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
          <Input label="Phone" placeholder="Enter phone number" icon="call-outline" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Input label="Address" placeholder="Enter your address" icon="location-outline" value={address} onChangeText={setAddress} />
          <Input label="New Password (Optional)" placeholder="Leave blank to keep current" icon="lock-closed-outline" value={password} onChangeText={setPassword} isPassword error={errors.password} />
        </View>

        <View style={styles.btnSection}>
          <Button title="Save Changes" onPress={handleSave} loading={loading} icon={<Ionicons name="checkmark-circle" size={20} color={COLORS.white} />} />
          <Button title="Cancel" onPress={() => router.back()} variant="ghost" style={{ marginTop: SPACING.sm }} />
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingTop: 60, paddingBottom: SPACING.md },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.white },
  avatarSection: { alignItems: 'center', marginVertical: SPACING.xl },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  avatarText: { fontSize: FONTS.sizes.xxxl, fontWeight: '800', color: COLORS.white },
  avatarHint: { color: COLORS.primary, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  form: { paddingHorizontal: SPACING.base },
  btnSection: { paddingHorizontal: SPACING.base, marginTop: SPACING.xl },
});
