import { DefaultTheme, Slot, ThemeProvider, usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BottomMenu } from '../components/bottom-menu';
import { CartProvider } from '@/context/cart-context';

export default function RootLayout() {
  const pathname = usePathname();
  const hideBottomMenu = pathname === '/welcome' || pathname === '/login' || pathname === '/register';

  return (
    <ThemeProvider value={DefaultTheme}>
      <CartProvider>
        <View style={styles.app}>
          <View style={styles.content}>
            <Slot />
          </View>
          {!hideBottomMenu ? <BottomMenu /> : null}
        </View>
      </CartProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
