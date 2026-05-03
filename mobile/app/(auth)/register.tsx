import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import Button from '@/src/components/Button';
import Input from '@/src/components/Input';
import { COLORS, FONTS, SPACING } from '@/src/constants/theme';
import Toast from 'react-native-toast-message';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ name, email, password, phone });
      Toast.show({ type: 'success', text1: 'Account Created!', text2: 'Welcome aboard' });
      router.replace('/');
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Registration Failed', text2: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="person-add" size={36} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us for delicious food</Text>
        </View>

        <View style={styles.form}>
          <Input label="Full Name" placeholder="Enter your name" icon="person-outline" value={name} onChangeText={setName} error={errors.name} />
          <Input label="Email" placeholder="Enter your email" icon="mail-outline" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
          <Input label="Phone (Optional)" placeholder="Enter phone number" icon="call-outline" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Input label="Password" placeholder="Create a password" icon="lock-closed-outline" value={password} onChangeText={setPassword} isPassword error={errors.password} />
          <Button title="Create Account" onPress={handleRegister} loading={loading} style={{ marginTop: SPACING.md }} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity><Text style={styles.link}>Sign In</Text></TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: SPACING.xl, backgroundColor: COLORS.background },
  header: { alignItems: 'center', marginBottom: SPACING.xxl },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary + '1A', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  title: { fontSize: FONTS.sizes.xxxl, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.xs },
  subtitle: { fontSize: FONTS.sizes.base, color: COLORS.textSecondary },
  form: { marginBottom: SPACING.xxl },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md },
  link: { color: COLORS.primary, fontSize: FONTS.sizes.md, fontWeight: '700' },
});
