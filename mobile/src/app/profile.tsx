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

// Extracted purple theme color from the screenshot
const PURPLE_THEME = '#7A31FF';

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

  // Group 1 Menu Items (Top Card)
  const menuGroup1: MenuItem[] = [
    { label: 'My Orders', icon: 'clipboard-outline', onPress: () => requireAuth(() => router.push('/orders')) },
    { label: 'Edit Profile', icon: 'person-outline', onPress: () => requireAuth(() => router.push('/edit-profile')) },
    { label: 'Address', icon: 'location-outline', onPress: handleAddressPress },
    { label: 'Payment Methods', icon: 'card-outline', onPress: () => requireAuth(() => Alert.alert('Coming Soon', 'Payment methods will be available soon.')) },
  ];

  // Group 2 Menu Items (Bottom Card)
  const menuGroup2: MenuItem[] = [
    { label: 'Help & Support', icon: 'chatbubble-ellipses-outline', onPress: () => Alert.alert('Help & Support', 'How can we help you today?') },
    { label: 'Settings', icon: 'settings-outline', onPress: () => Alert.alert('Settings', 'App settings coming soon.') },
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
      {/* Sweeping Purple Background Layer */}
      <View style={styles.purpleBackground} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Icons */}
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('Settings')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="settings-outline" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Overlapping White Content Area */}
        <View style={styles.whiteCurveContainer}>
          
          {/* Avatar Section */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarShadow}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            </View>
            
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

          {/* First Menu Card */}
          <View style={styles.menuCard}>
            {menuGroup1.map((item, index) => (
              <View key={item.label}>
                <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={item.onPress}>
                  <View style={styles.menuLeft}>
                    <Ionicons name={item.icon} size={22} color={PURPLE_THEME} />
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#C4C4C4" />
                </TouchableOpacity>
                {index < menuGroup1.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

          {/* Second Menu Card */}
          <View style={styles.menuCard}>
            {menuGroup2.map((item, index) => (
              <View key={item.label}>
                <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={item.onPress}>
                  <View style={styles.menuLeft}>
                    <Ionicons name={item.icon} size={22} color={PURPLE_THEME} />
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#C4C4C4" />
                </TouchableOpacity>
                {index < menuGroup2.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

          {/* Logout Button */}
          {user && (
            <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color={PURPLE_THEME} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Light grey for smooth scrolling bottom
  },
  purpleBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: PURPLE_THEME,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60, // Safe area compensation
    paddingBottom: 40,
  },
  whiteCurveContainer: {
    backgroundColor: '#FAFAFA', // Matches the screen background but allows the top curve
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: 20,
    paddingHorizontal: 20,
    flex: 1, // Takes remaining space
  },
  avatarWrapper: {
    alignItems: 'center',
    marginTop: -55, // Pulls the avatar up onto the purple background
    marginBottom: 24,
  },
  avatarShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    borderRadius: 55,
    backgroundColor: '#FFF', // Prevents shadow bleed
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 16,
  },
  userEmail: {
    fontSize: 14,
    color: '#808080',
    marginTop: 4,
    fontWeight: '500',
  },
  authActions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  loginButton: {
    minHeight: 40,
    minWidth: 110,
    borderRadius: 20,
    backgroundColor: PURPLE_THEME,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  registerButton: {
    minHeight: 40,
    minWidth: 110,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: PURPLE_THEME,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    color: PURPLE_THEME,
    fontSize: 14,
    fontWeight: '700',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F2',
    marginHorizontal: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: PURPLE_THEME,
    borderRadius: 16,
    minHeight: 56,
    marginTop: 10,
    marginBottom: 30,
  },
  logoutText: {
    color: PURPLE_THEME,
    fontWeight: '700',
    fontSize: 16,
  },
});