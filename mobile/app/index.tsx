import { Redirect } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import LoadingSpinner from '@/src/components/LoadingSpinner';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  if (user?.role === 'admin') return <Redirect href="/(admin)/dashboard" />;

  if (user?.role === 'rider') return <Redirect href="/(rider)/dashboard" />;

  return <Redirect href="/(tabs)" />;
}
