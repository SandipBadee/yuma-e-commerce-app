import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Registration failed', 'All fields are required.');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Registration failed', 'Passwords do not match.');
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
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Back Button */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Create a new account to get started and enjoy seamless access to our features.</Text>
        </View>

        <View style={styles.form}>
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="person" size={20} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={20} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              placeholder="Password"
              secureTextEntry={!showPassword}
              placeholderTextColor="#9ca3af"
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#9ca3af" />
            </Pressable>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color="#9ca3af" style={styles.inputIcon} />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor="#9ca3af"
            />
            <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              <Ionicons name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#9ca3af" />
            </Pressable>
          </View>

          {/* Primary Button */}
          <Pressable style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} onPress={handleRegister} disabled={loading}>
            <Text style={styles.primaryButtonText}>{loading ? 'Registering...' : 'Create Account'}</Text>
          </Pressable>

          {/* Sign In Link */}
          <Pressable style={styles.linkButton} onPress={() => router.back()}>
            <Text style={styles.linkTextRegular}>Already have an account? <Text style={styles.linkTextBold}>Sign In here</Text></Text>
          </Pressable>

          {/* Divider */}
          <View style={styles.dividerContainer}>
             <View style={styles.dividerLine} />
          </View>
          
          <Text style={styles.socialText}>Or Continue With Account</Text>

          {/* Social Buttons */}
          <View style={styles.socialContainer}>
            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={22} color="#000" />
            </Pressable>
            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-google" size={22} color="#000" />
            </Pressable>
            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-apple" size={22} color="#000" />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6', 
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: Spacing.four,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: Spacing.one,
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: Spacing.two,
  },
  form: {
    gap: Spacing.two,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 30,
    minHeight: 56,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#111827',
    fontSize: 15,
  },
  eyeIcon: {
    padding: 4,
  },
  primaryButton: {
    marginTop: Spacing.two,
    minHeight: 56,
    borderRadius: 30,
    backgroundColor: '#4f46e5', // Kept original color
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  linkTextRegular: {
    color: '#6b7280',
    fontSize: 14,
  },
  linkTextBold: {
    color: '#4f46e5',
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,    // <-- Adjusted top spacing
    marginBottom: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  socialText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 13,
    marginBottom: Spacing.two,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
});