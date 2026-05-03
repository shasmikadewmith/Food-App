import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import Button from '@/src/components/Button';
import Input from '@/src/components/Input';
import { COLORS, FONTS, SPACING, RADIUS } from '@/src/constants/theme';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const userData = await login(email, password);
      Toast.show({ type: 'success', text1: 'Welcome back!', text2: 'Logged in successfully' });
      if (userData.role === 'admin') {
        router.replace('/(admin)/dashboard' as any);
      } else if (userData.role === 'rider') {
        router.replace('/(rider)/dashboard' as any);
      } else {
        router.replace('/(tabs)' as any);
      }
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Login Failed', text2: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="restaurant" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.form}>
          <Input label="Email" placeholder="Enter your email" icon="mail-outline" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
          <Input label="Password" placeholder="Enter your password" icon="lock-closed-outline" value={password} onChangeText={setPassword} isPassword error={errors.password} />
          <Button title="Sign In" onPress={handleLogin} loading={loading} style={{ marginTop: SPACING.md }} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity><Text style={styles.link}>Sign Up</Text></TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: SPACING.xl, backgroundColor: COLORS.background },
  header: { alignItems: 'center', marginBottom: SPACING.xxxl },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary + '1A', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  title: { fontSize: FONTS.sizes.xxxl, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.xs },
  subtitle: { fontSize: FONTS.sizes.base, color: COLORS.textSecondary },
  form: { marginBottom: SPACING.xxl },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md },
  link: { color: COLORS.primary, fontSize: FONTS.sizes.md, fontWeight: '700' },
});
