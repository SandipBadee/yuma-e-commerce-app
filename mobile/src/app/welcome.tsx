import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useUserStore } from '../../store/useUserStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const { markWelcomeSeen } = useUserStore() as {
    markWelcomeSeen: () => void;
  };
  const loginPath: any = '/login';
  const registerPath: any = '/register';

  const goToRegister = () => {
    markWelcomeSeen();
    router.push(registerPath);
  };

  const goToLogin = () => {
    markWelcomeSeen();
    router.push(loginPath);
  };

  const continueAsGuest = () => {
    markWelcomeSeen();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <Image source={require('../../assets/images/icon.png')} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={styles.title}>Welcome to YUMA</Text>
        <Text style={styles.subtitle}>Shop smart. Live better. Your grocery, fashion, and electronics essentials in one place.</Text>

        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={goToRegister}>
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={goToLogin}>
            <Text style={styles.secondaryButtonText}>Login</Text>
          </Pressable>

          <Pressable style={styles.skipButton} onPress={continueAsGuest}>
            <Text style={styles.skipText}>Continue as guest</Text>
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
    paddingBottom: Spacing.five,
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  logo: {
    width: 190,
    height: 190,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: Spacing.two,
    fontSize: 15,
    lineHeight: 23,
    color: '#6b7280',
    textAlign: 'center',
  },
  actions: {
    marginTop: Spacing.five,
    gap: Spacing.two,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  secondaryButtonText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 16,
  },
  skipButton: {
    marginTop: Spacing.one,
    alignItems: 'center',
  },
  skipText: {
    color: '#6b7280',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
