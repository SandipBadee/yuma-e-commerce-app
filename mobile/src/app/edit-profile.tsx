import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { apiRequest } from '@/lib/api-client';
import { useUserStore } from '../../store/useUserStore';

type ProfileResponse = {
  id: string;
  name: string;
  email: string;
  role?: string;
  profile?: {
    phone?: string | null;
    address?: string | null;
  } | null;
};

export default function EditProfileScreen() {
  const router = useRouter();
  const { isHydrated, isAuthenticated } = useAuthGuard('/login');
  const { user, setUser } = useUserStore() as {
    user: { id?: string; name?: string; email?: string; role?: string; phone?: string; address?: string } | null;
    setUser: (userData: { id: string; name: string; email: string; role?: string; phone?: string; address?: string }) => void;
  };

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;

    let isMounted = true;

    const loadProfile = async () => {
      try {
        const profile = await apiRequest<ProfileResponse>('/api/auth/profile', {
          method: 'GET',
          authenticated: true,
        });

        if (!isMounted) return;
        setName(profile?.name || '');
        setPhone(profile?.profile?.phone || '');
        setAddress(profile?.profile?.address || '');

        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          phone: profile?.profile?.phone || '',
          address: profile?.profile?.address || '',
        });
      } catch (error) {
        if (!isMounted) return;
        setName(user?.name || '');
        setPhone(user?.phone || '');
        setAddress(user?.address || '');
        Alert.alert('Profile', String((error as Error)?.message || 'Failed to load profile data.'));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [isHydrated, isAuthenticated, setUser, user?.address, user?.name, user?.phone]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Name is required.');
      return;
    }

    setSaving(true);

    try {
      const result = await apiRequest<{ message?: string; user?: ProfileResponse }>('/api/auth/profile', {
        method: 'PUT',
        authenticated: true,
        body: {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
        },
      });

      if (result?.user) {
        setUser({
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          phone: result.user?.profile?.phone || '',
          address: result.user?.profile?.address || '',
        });
      }

      Alert.alert('Success', result?.message || 'Profile updated successfully.');
      router.back();
    } catch (error) {
      Alert.alert('Update failed', String((error as Error)?.message || 'Failed to update profile.'));
    } finally {
      setSaving(false);
    }
  };

  if (!isHydrated || !isAuthenticated || loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.page}>
          <View style={styles.centered}>
            <ActivityIndicator size="small" color="#4f46e5" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.page}>
        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.body}>Update your account information.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Your full name"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            placeholder="e.g. +358 40 123 4567"
            keyboardType="phone-pad"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Address</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            style={[styles.input, styles.textArea]}
            placeholder="Street and apartment details"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Pressable style={[styles.button, saving && styles.buttonDisabled]} onPress={handleSave} disabled={saving}>
            <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={() => router.back()} disabled={saving}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    padding: Spacing.four,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  loadingText: {
    color: '#6b7280',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: Spacing.one,
  },
  body: {
    color: '#6b7280',
    marginBottom: Spacing.three,
  },
  form: {
    gap: Spacing.two,
  },
  label: {
    color: '#374151',
    fontWeight: '600',
    marginBottom: -4,
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    color: '#111827',
  },
  textArea: {
    minHeight: 92,
    paddingTop: 12,
  },
  button: {
    marginTop: Spacing.one,
    backgroundColor: '#4f46e5',
    borderRadius: 14,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 14,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  secondaryButtonText: {
    color: '#374151',
    fontWeight: '700',
  },
});
