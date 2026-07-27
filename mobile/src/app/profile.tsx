import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';

import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { apiRequest } from '@/lib/api-client';
import { useUserStore } from '../../store/useUserStore';

const avatarUrl =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300';

type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

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

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, setUser } = useUserStore() as {
    user: { name: string; email: string; phone?: string; address?: string } | null;
    logout: () => void;
    setUser: (userData: { id: string; name: string; email: string; role?: string; phone?: string; address?: string }) => void;
  };
  const loginPath: any = '/login';
  const registerPath: any = '/register';

  const requireAuth = (action: () => void) => {
    if (!user) {
      Alert.alert('Login required', 'Please login to continue.');
      (router.push as any)('/login');
      return;
    }
    action();
  };

  const handleAddressPress = () => {
    requireAuth(() => {
      const savedAddress = String(user?.address || '').trim();
      Alert.alert('Address', savedAddress || 'No address saved yet. Add it in Edit Profile.');
    });
  };

  const menuItems: MenuItem[] = [
    { label: 'My Orders', icon: 'receipt-outline', onPress: () => requireAuth(() => router.push('/orders')) },
    { label: 'Edit Profile', icon: 'create-outline', onPress: () => requireAuth(() => router.push('/edit-profile')) },
    { label: 'Address', icon: 'location-outline', onPress: handleAddressPress },
  ];

  useEffect(() => {
    let isMounted = true;

    const syncProfile = async () => {
      if (!user) return;

      try {
        const profile = await apiRequest<ProfileResponse>('/api/auth/profile', {
          method: 'GET',
          authenticated: true,
        });

        if (!isMounted) return;
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          phone: profile?.profile?.phone || '',
          address: profile?.profile?.address || '',
        });
      } catch {
        // Keep local session state; non-blocking profile refresh.
      }
    };

    syncProfile();

    return () => {
      isMounted = false;
    };
  }, [user, setUser]);

  const handleLogout = () => {
    logout();
    Alert.alert('Logged out');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          {user ? (
            <>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </>
          ) : (
            <>
              <Text style={styles.userName}>Not logged in</Text>
              <View style={styles.authActions}>
                <TouchableOpacity style={styles.loginButton} activeOpacity={0.85} onPress={() => router.push(loginPath)}>
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.registerButton} activeOpacity={0.85} onPress={() => router.push(registerPath)}>
                  <Text style={styles.registerButtonText}>Register</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <View key={item.label}>
              <TouchableOpacity style={styles.menuItem} activeOpacity={0.75} onPress={item.onPress}>
                <View style={styles.menuLeft}>
                  <View style={styles.iconWrap}>
                    <Ionicons name={item.icon} size={18} color={Colors.light.primary} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.light.textSecondary} />
              </TouchableOpacity>
              {index < menuItems.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={Colors.light.backgroundElement} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  headerCard: {
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 24,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  avatar: {
    width: 94,
    height: 94,
    borderRadius: 47,
    marginBottom: Spacing.two,
    backgroundColor: Colors.light.border,
  },
  userName: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: Colors.light.text,
  },
  userEmail: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  authActions: {
    marginTop: Spacing.two,
    flexDirection: 'row',
    gap: Spacing.two,
  },
  loginButton: {
    minHeight: 40,
    minWidth: 110,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  loginButtonText: {
    color: Colors.light.backgroundElement,
    fontSize: 14,
    fontWeight: '700',
  },
  registerButton: {
    minHeight: 40,
    minWidth: 110,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    backgroundColor: Colors.light.backgroundElement,
  },
  registerButtonText: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: '700',
  },
  menuCard: {
    borderRadius: 24,
    backgroundColor: Colors.light.backgroundElement,
    paddingVertical: Spacing.one,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  menuItem: {
    minHeight: 58,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginHorizontal: Spacing.three,
  },
  logoutButton: {
    marginTop: Spacing.two,
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  logoutText: {
    color: Colors.light.backgroundElement,
    fontWeight: '700',
    fontSize: 15,
  },
});
