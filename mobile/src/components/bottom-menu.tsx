import { Link, usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type BottomMenuRoute = '/' | '/explore' | '/cart' | '/profile';

type BottomMenuItem = {
  label: string;
  href: BottomMenuRoute;
  icon: 'home-outline' | 'grid-outline' | 'cart-outline' | 'person-outline';
};

const menuItems: BottomMenuItem[] = [
  { label: 'Home', href: '/', icon: 'home-outline' },
  { label: 'Explore', href: '/explore', icon: 'grid-outline' },
  { label: 'Cart', href: '/cart', icon: 'cart-outline' },
  { label: 'Profile', href: '/profile', icon: 'person-outline' },
];

export function BottomMenu() {
  const theme = useTheme();
  const pathname = usePathname();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement, borderTopColor: theme.backgroundSelected }]}> 
      {menuItems.map((item) => {
        const selected = pathname === item.href;
        return (
          <Link key={item.label} href={item.href} style={styles.item}>
            <Ionicons
              name={item.icon}
              size={24}
              color={selected ? '#059669' : '#6b7280'}
            />
            <ThemedText
              type="small"
              style={[styles.label, selected && styles.labelActive]}
            >
              {item.label}
            </ThemedText>
          </Link>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    paddingHorizontal: Spacing.two,
  },
  label: {
    color: '#6b7280',
    marginTop: 4,
    fontSize: 10,
  },
  labelActive: {
    color: '#059669',
    fontWeight: '700',
  },
});
