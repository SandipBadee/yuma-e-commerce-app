import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

export default function OrderSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ total?: string; items?: string; orderId?: string; status?: string }>();
  const total = Number(params.total ?? '0');
  const items = Number(params.items ?? '0');

  return (
    <ThemedView style={styles.container}>
      <View style={styles.page}>
        <View style={styles.heroIcon}>
          <Ionicons name="checkmark" size={44} color={Colors.light.backgroundElement} />
        </View>

        <ThemedText type="subtitle" style={styles.title}>
          Order placed successfully
        </ThemedText>
        <ThemedText type="small" style={styles.body}>
          Your items are confirmed and being prepared. You can keep shopping or check your orders anytime.
        </ThemedText>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <ThemedText type="smallBold">Order ID</ThemedText>
            <ThemedText type="small">{params.orderId ?? 'N/A'}</ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText type="smallBold">Items</ThemedText>
            <ThemedText type="small">{items}</ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText type="smallBold">Total paid</ThemedText>
            <ThemedText type="small">${total.toFixed(2)}</ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText type="smallBold">Status</ThemedText>
            <ThemedText type="small" style={styles.statusText}>
              {params.status ?? 'Confirmed'}
            </ThemedText>
          </View>
        </View>

        <Pressable style={styles.primaryButton} onPress={() => router.replace('/explore')}>
          <ThemedText style={styles.primaryButtonText}>Continue Shopping</ThemedText>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => router.replace('/orders')}>
          <ThemedText type="smallBold" style={styles.secondaryButtonText}>
            View Orders
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    flex: 1,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  heroIcon: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    alignSelf: 'center',
    marginBottom: Spacing.three,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  title: {
    textAlign: 'center',
    color: Colors.light.text,
    marginBottom: Spacing.one,
  },
  body: {
    textAlign: 'center',
    color: Colors.light.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.four,
  },
  summaryCard: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 24,
    padding: Spacing.three,
    gap: Spacing.two,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: Spacing.four,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    color: Colors.light.primary,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 18,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  primaryButtonText: {
    color: Colors.light.backgroundElement,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 18,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    backgroundColor: Colors.light.primaryLight,
  },
  secondaryButtonText: {
    color: Colors.light.primary,
  },
});