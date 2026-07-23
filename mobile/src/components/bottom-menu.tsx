import { Link, usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCartStore } from '../../store/useCartStore';

type BottomMenuRoute = '/' | '/explore' | '/cart' | '/orders' | '/profile';

type BottomMenuItem = {
  label: string;
  href: BottomMenuRoute;
  icon: 'home-outline' | 'grid-outline' | 'cart-outline' | 'receipt-outline' | 'person-outline';
};

const menuItems: BottomMenuItem[] = [
  { label: 'Home', href: '/', icon: 'home-outline' },
  { label: 'Categories', href: '/explore', icon: 'grid-outline' },
  { label: 'Cart', href: '/cart', icon: 'cart-outline' },
  { label: 'Orders', href: '/orders', icon: 'receipt-outline' },
  { label: 'Profile', href: '/profile', icon: 'person-outline' },
];

export function BottomMenu() {
  const theme = useTheme();
  const pathname = usePathname();
  const { cartItems } = useCartStore() as { cartItems: { id: string; quantity?: number }[] };
  const cartItemCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement, borderTopColor: theme.backgroundSelected }]}> 
      {menuItems.map((item) => {
        const selected = pathname === item.href;
        const showBadge = item.href === '/cart' && cartItemCount > 0;

        return (
          <Link key={item.label} href={item.href} style={styles.link}>
            <View style={styles.item}>
              <View style={styles.iconWrapper}>
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={selected ? '#059669' : '#6b7280'}
                />
                {showBadge && (
                  <View style={styles.badge}>
                    <ThemedText type="small" style={styles.badgeText}>
                      {cartItemCount}
                    </ThemedText>
                  </View>
                )}
              </View>
              <ThemedText
                type="small"
                style={[styles.label, selected && styles.labelActive]}
              >
                {item.label}
              </ThemedText>
            </View>
          </Link>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: Spacing.two,
    width: '100%',
    paddingHorizontal: Spacing.four,
    backgroundColor: '#ffffff',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    paddingHorizontal: Spacing.two,
  },
  link: {
    flex: 1,
    alignItems: 'center',
  },
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 10,
  },
  label: {
    color: '#6b7280',
    marginTop: 6,
    fontSize: 10,
  },
  labelActive: {
    color: '#059669',
    fontWeight: '700',
  },
});
