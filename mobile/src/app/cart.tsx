"use client";

import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useCart } from '@/context/cart-context';
import { CartItemRow } from '@/components/cart-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function CartScreen() {
  const router = useRouter();
  const { cartItems, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <ThemedText type="subtitle" style={styles.title}>
          My Shopping Cart
        </ThemedText>

        {cartItems.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="cart-outline" size={56} color="#9ca3af" />
            </View>
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              Your Cart is Empty
            </ThemedText>
            <ThemedText type="small" style={styles.emptyBody}>
              Explore our massive multi-department catalog to start adding products!
            </ThemedText>
            <Pressable style={styles.primaryButton} onPress={() => router.push('/explore') }>
              <ThemedText style={styles.primaryButtonText}>Discover Products Now</ThemedText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.cartList}>
            {cartItems.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onIncrease={() => increaseQuantity(item.id)}
                onDecrease={() => decreaseQuantity(item.id)}
                onRemove={() => removeFromCart(item.id)}
              />
            ))}

            <View style={styles.summaryCard}>
              <ThemedText type="smallBold">Total</ThemedText>
              <ThemedText type="title" style={styles.totalText}>
                ${total.toFixed(2)}
              </ThemedText>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  title: {
    marginBottom: Spacing.two,
  },
  body: {
    color: '#6b7280',
    lineHeight: 24,
  },
  emptyState: {
    flex: 1,
    minHeight: 420,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
    marginBottom: BottomTabInset,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  emptyTitle: {
    marginTop: Spacing.one,
    marginBottom: Spacing.one,
    textAlign: 'center',
    color: '#111827',
  },
  emptyBody: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: Spacing.four,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: '#059669',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 999,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  cartList: {
    gap: Spacing.two,
  },
  summaryCard: {
    marginTop: Spacing.three,
    padding: Spacing.three,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  totalText: {
    marginTop: Spacing.one,
  },
  bottomSpacer: {
    height: BottomTabInset,
  },
});
