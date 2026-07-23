import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useToastStore } from '../../../store/useToastStore';

type Props = {
  bottomOffset?: number;
};

const toneStyles = {
  success: {
    backgroundColor: '#1a1a40',
    iconName: 'checkmark-circle' as const,
    iconColor: '#4caf50',
  },
  info: {
    backgroundColor: '#1a1a40',
    iconName: 'information-circle' as const,
    iconColor: '#3b82f6',
  },
  error: {
    backgroundColor: '#1a1a40',
    iconName: 'alert-circle' as const,
    iconColor: '#ff6b2c',
  },
};

export function AppToast({ bottomOffset = 88 }: Props) {
  const insets = useSafeAreaInsets();
  const toast = useToastStore((state: any) => state.toast) as
    | { id: number; message: string; tone?: keyof typeof toneStyles; duration?: number }
    | null;
  const hideToast = useToastStore((state: any) => state.hideToast) as () => void;
  const [translateY] = useState(() => new Animated.Value(24));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!toast) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 24,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 18,
        stiffness: 180,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]).start();

    const timeoutId = setTimeout(() => {
      hideToast();
    }, toast.duration ?? 2200);

    return () => clearTimeout(timeoutId);
  }, [hideToast, opacity, toast, translateY]);

  if (!toast) {
    return null;
  }

  const tone = toneStyles[toast.tone || 'success'] || toneStyles.success;

  return (
    <View pointerEvents="box-none" style={styles.portal}>
      <Animated.View
        style={[
          styles.toast,
          {
            bottom: insets.bottom + bottomOffset,
            backgroundColor: tone.backgroundColor,
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <Ionicons name={tone.iconName} size={20} color={tone.iconColor} />
        <ThemedText type="smallBold" style={styles.message} numberOfLines={2}>
          {toast.message}
        </ThemedText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  portal: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    elevation: 50,
  },
  toast: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    borderRadius: 18,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  message: {
    color: '#ffffff',
    flex: 1,
    lineHeight: 20,
  },
});