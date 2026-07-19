import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { apiRequest } from '@/lib/api-client';
import { useUserStore } from '../../store/useUserStore';

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth, markWelcomeSeen } = useUserStore() as {
    setAuth: (payload: { user: { id: string; name: string; email: string; role?: string }; token: string }) => void;
    markWelcomeSeen: () => void;
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Login failed', 'Email and password are required.');
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest<{
        token: string;
        user: { id: string; name: string; email: string; role?: string };
      }>('/api/auth/login', {
        method: 'POST',
        body: {
          email: email.trim().toLowerCase(),
          password: password.trim(),
        },
      });

      if (!data?.token || !data?.user) {
        Alert.alert('Login failed', 'Unable to login right now.');
        return;
      }

      setAuth({
        user: data.user,
        token: data.token,
      });
      markWelcomeSeen();

      Alert.alert('Welcome back', 'Login successful.');
      router.replace('/');
    } catch (error) {
      Alert.alert('Login failed', String((error as Error)?.message || 'Could not connect to backend.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Sign in to continue shopping with YUMA.</Text>

        <View style={styles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            placeholderTextColor="#9ca3af"
          />

          <Pressable style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} onPress={handleLogin} disabled={loading}>
            <Text style={styles.primaryButtonText}>{loading ? 'Logging in...' : 'Login'}</Text>
          </Pressable>

          <Pressable style={styles.linkButton} onPress={() => router.push('/welcome' as never)}>
            <Text style={styles.linkText}>No account yet? Register</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    marginTop: Spacing.one,
    color: '#6b7280',
    fontSize: 15,
  },
  form: {
    marginTop: Spacing.four,
    gap: Spacing.two,
  },
  input: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  primaryButton: {
    marginTop: Spacing.one,
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  linkButton: {
    alignItems: 'center',
    paddingTop: Spacing.one,
  },
  linkText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
});
