import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/src/constants/theme';

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: COLORS.surface, borderTopColor: COLORS.border, borderTopWidth: 1, height: 88, paddingTop: 8, paddingBottom: 28 },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Ionicons name="analytics" size={24} color={color} /> }} />
      <Tabs.Screen name="dishes" options={{ title: 'Dishes', tabBarIcon: ({ color }) => <Ionicons name="fast-food" size={24} color={color} /> }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: ({ color }) => <Ionicons name="receipt" size={24} color={color} /> }} />
      <Tabs.Screen name="deliveries" options={{ title: 'Delivery', tabBarIcon: ({ color }) => <Ionicons name="bicycle" size={24} color={color} /> }} />
      <Tabs.Screen name="tables" options={{ title: 'Tables', tabBarIcon: ({ color }) => <Ionicons name="grid" size={24} color={color} /> }} />
      <Tabs.Screen name="financials" options={{ title: 'Finance', tabBarIcon: ({ color }) => <Ionicons name="wallet" size={24} color={color} /> }} />
    </Tabs>
  );
}
