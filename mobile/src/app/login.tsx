import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing } from '@/constants/theme';
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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Back Button */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.light.text} />
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Log in</Text>
          <Text style={styles.subtitle}>Enter your email and password to securely access your account and manage your services.</Text>
        </View>

        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.light.textSecondary}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              placeholder="Password"
              secureTextEntry={!showPassword}
              placeholderTextColor={Colors.light.textSecondary}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color={Colors.light.textSecondary} />
            </Pressable>
          </View>

          {/* Options Row */}
          <View style={styles.optionsRow}>
            <Pressable style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
              <Text style={styles.optionText}>Remember me</Text>
            </Pressable>
            <Pressable>
              <Text style={styles.forgotPasswordText}>Forgot Password</Text>
            </Pressable>
          </View>

          {/* Primary Button */}
          <Pressable style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} onPress={handleLogin} disabled={loading}>
            <Text style={styles.primaryButtonText}>{loading ? 'Logging in...' : 'Login'}</Text>
          </Pressable>

          {/* Sign Up Link */}
          <Pressable style={styles.linkButton} onPress={() => router.push('/welcome' as never)}>
            <Text style={styles.linkTextRegular}>Do not have an account? <Text style={styles.linkTextBold}>Sign Up here</Text></Text>
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
    backgroundColor: Colors.light.backgroundElement,
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
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: Spacing.one,
  },
  subtitle: {
    color: Colors.light.textSecondary,
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
    backgroundColor: Colors.light.backgroundElement,
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
    color: Colors.light.text,
    fontSize: 15,
  },
  eyeIcon: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: Spacing.one,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  optionText: {
    color: Colors.light.text,
    fontSize: 13,
  },
  forgotPasswordText: {
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 13,
  },
  primaryButton: {
    marginTop: Spacing.two,
    minHeight: 56,
    borderRadius: 30,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: Colors.light.backgroundElement,
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
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
  linkTextBold: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,    // <-- Adjusted top spacing
    marginBottom: 130,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  socialText: {
    textAlign: 'center',
    color: Colors.light.textSecondary,
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
    backgroundColor: Colors.light.backgroundElement,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
});