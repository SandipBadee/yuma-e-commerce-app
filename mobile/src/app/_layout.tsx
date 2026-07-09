"use client";

import { DefaultTheme, Slot, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, View } from 'react-native';

import { BottomMenu } from '../components/bottom-menu';
import { CartProvider } from '@/context/cart-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <CartProvider>
        <View style={styles.app}>
          <View style={styles.content}>
            <Slot />
          </View>
          <BottomMenu />
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
