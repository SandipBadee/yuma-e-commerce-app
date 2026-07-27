/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // TEXT
    text: '#1B1D21',
    textSecondary: '#6B7280',

    // BACKGROUND
    background: '#F7F8FC',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EFEFFF',

    // BRAND (YUMA)
    primary: '#6C3BFF',
    primaryDark: '#24106A',
    primaryLight: '#EFEAFF',

    // ACCENTS
    accent: '#FF6B00',   // offers / discounts
    success: '#34C759',  // add to cart
    info: '#3D5AFE',     // secondary actions

    // UI STATES
    border: '#E5E7EB',
    shadow: '#000000',
  },

  dark: {
    text: '#FFFFFF',
    textSecondary: '#B0B4BA',

    background: '#0F1115',
    backgroundElement: '#1A1C20',
    backgroundSelected: '#2A2D33',

    primary: '#6C3BFF',
    primaryDark: '#24106A',
    primaryLight: '#3A2A80',

    accent: '#FF6B00',
    success: '#34C759',
    info: '#3D5AFE',

    border: '#2E3135',
    shadow: '#000000',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
