import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { apiRequest } from '@/lib/api-client';
import { useUserStore } from '../../store/useUserStore';

export default function RegisterScreen() {
  const router = useRouter();
  const { markWelcomeSeen } = useUserStore() as {
    markWelcomeSeen: () => void;
  };

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Registration failed', 'All fields are required.');
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest<{ message?: string }>('/api/auth/register', {
        method: 'POST',
        body: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
        },
      });

      markWelcomeSeen();
      Alert.alert('Success', data?.message || 'Account created. Please verify your email.');
      router.replace('/');
    } catch (error) {
      Alert.alert('Registration failed', String((error as Error)?.message || 'Could not connect to backend.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start shopping with YUMA in just a minute.</Text>

        <View style={styles.form}>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor="#9ca3af"
          />
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
            placeholder="Password (min 6 chars)"
            secureTextEntry
            placeholderTextColor="#9ca3af"
          />

          <Pressable style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} onPress={handleRegister} disabled={loading}>
            <Text style={styles.primaryButtonText}>{loading ? 'Registering...' : 'Register'}</Text>
          </Pressable>

          <Pressable style={styles.linkButton} onPress={() => router.back()}>
            <Text style={styles.linkText}>Already have an account? Login</Text>
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
