import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CartItemRow } from '@/components/cart-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { createOrder } from '@/lib/order-api';
import { useCartStore } from '../../store/useCartStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useUserStore } from '../../store/useUserStore';

type StoreCartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export default function CartScreen() {
  const router = useRouter();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const { isHydrated } = useAuthGuard('/login');
  const user = useUserStore((state: any) => state.user);
  const { cartItems, removeFromCart, clearCart, increaseQuantity, decreaseQuantity } = useCartStore() as {
    cartItems: StoreCartItem[];
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    increaseQuantity: (id: string) => void;
    decreaseQuantity: (id: string) => void;
  };
  const { addOrder } = useOrderStore() as {
    addOrder: (order: {
      id: string;
      items: { id: string; name: string; quantity: number }[];
      total: number;
      status: string;
      date: string;
      orderNumber?: string;
    }) => void;
  };

  const splitName = (fullName: string) => {
    const cleanName = String(fullName || '').trim();
    if (!cleanName) return { firstName: 'User', lastName: 'Customer' };

    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return {
        firstName: parts[0],
        lastName: 'Customer',
      };
    }

    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
    };
  };

  const itemCount = cartItems.length;
  const total = cartItems.reduce((sum: number, item: StoreCartItem) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = () => {
    if (!isHydrated || !user) {
      Alert.alert('Login required', 'Please login to place an order.');
      (router.push as any)('/login');
      return;
    }

    if (cartItems.length === 0 || isPlacingOrder) {
      return;
    }

    Alert.alert('Confirm Order', 'Place this order now?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Place Order',
        onPress: async () => {
          setIsPlacingOrder(true);

          try {
            const profileUser = useUserStore.getState().user as
              | { name?: string; email?: string; phone?: string; address?: string }
              | null;

            const firstNameLastName = splitName(profileUser?.name || '');
            const customerEmail = String(profileUser?.email || '').trim();
            const customerPhone = String(profileUser?.phone || '').trim();

            if (!customerEmail) {
              Alert.alert('Missing profile info', 'Your account email is missing. Please login again.');
              setIsPlacingOrder(false);
              return;
            }

            if (!customerPhone) {
              Alert.alert('Phone required', 'Please add your phone number in Edit Profile before placing an order.');
              (router.push as any)('/edit-profile');
              setIsPlacingOrder(false);
              return;
            }

            const payloadItems = cartItems.map((item) => ({
              productId: String(item.id),
              quantity: Number(item.quantity || 1),
            }));

            const result = await createOrder({
              orderType: 'PICKUP',
              scheduleType: 'asap',
              items: payloadItems,
              customer: {
                firstName: firstNameLastName.firstName,
                lastName: firstNameLastName.lastName,
                email: customerEmail,
                phone: customerPhone,
                addressLine1: String(profileUser?.address || '').trim(),
              },
            });

            const createdOrder = result.order;

            addOrder({
              id: createdOrder.id,
              orderNumber: createdOrder.orderNumber,
              items: (createdOrder.items || []).map((line) => ({
                id: line.id,
                name: line?.product?.name || 'Product',
                quantity: Number(line.quantity || 0),
              })),
              total: Number(createdOrder.totalAmount || 0),
              status: String(createdOrder.status || 'PENDING'),
              date: String(createdOrder.createdAt || new Date().toISOString()),
            });

            clearCart();
            setIsPlacingOrder(false);

            (router.push as any)({
              pathname: '/order-success',
              params: {
                total: String(Number(createdOrder.totalAmount || 0).toFixed(2)),
                items: String(createdOrder.items?.length || 0),
                orderId: createdOrder.orderNumber || createdOrder.id,
                status: createdOrder.status || 'PENDING',
              },
            });
          } catch (error) {
            setIsPlacingOrder(false);
            Alert.alert('Order failed', String((error as Error)?.message || 'Could not place order.'));
          }
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.page}>
          <View style={styles.headerRow}>
            <ThemedText type="subtitle" style={styles.title}>
              My Shopping Cart
            </ThemedText>
            {itemCount > 0 ? (
              <View style={styles.itemCountBadge}>
                <ThemedText type="smallBold" style={styles.itemCountText}>
                  {itemCount} item{itemCount > 1 ? 's' : ''}
                </ThemedText>
              </View>
            ) : null}
          </View>

          {cartItems.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="cart-outline" size={56} color="#9ca3af" />
              </View>
              <ThemedText type="subtitle" style={styles.emptyTitle}>
                Your cart is feeling lonely
              </ThemedText>
              <ThemedText type="small" style={styles.emptyBody}>
                Add your favorite products to review totals, adjust quantity, and place your next order.
              </ThemedText>
              <Pressable style={styles.primaryButton} onPress={() => router.push('/explore')}>
                <ThemedText style={styles.primaryButtonText}>Browse Products</ThemedText>
              </Pressable>
            </View>
          ) : (
            <>
              <ScrollView
                style={styles.listScroll}
                contentContainerStyle={styles.cartList}
                showsVerticalScrollIndicator={false}
              >
                {cartItems.map((item: StoreCartItem) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onIncrease={() => increaseQuantity(item.id)}
                    onDecrease={() => decreaseQuantity(item.id)}
                    onRemove={() => removeFromCart(item.id)}
                  />
                ))}
                <View style={styles.bottomSpacer} />
              </ScrollView>

              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <ThemedText type="smallBold">Items</ThemedText>
                  <ThemedText type="small">{itemCount}</ThemedText>
                </View>
                <View style={styles.summaryRow}>
                  <ThemedText type="smallBold">Subtotal</ThemedText>
                  <ThemedText type="small">${total.toFixed(2)}</ThemedText>
                </View>
                <View style={styles.summaryRow}>
                  <ThemedText type="smallBold">Delivery</ThemedText>
                  <ThemedText type="small">Free</ThemedText>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRowLarge}>
                  <ThemedText type="smallBold">Total</ThemedText>
                  <ThemedText type="title" style={styles.totalText}>
                    ${total.toFixed(2)}
                  </ThemedText>
                </View>
                <Pressable
                  style={[
                    styles.placeOrderButton,
                    (cartItems.length === 0 || isPlacingOrder) && styles.placeOrderButtonDisabled,
                  ]}
                  onPress={handlePlaceOrder}
                  disabled={cartItems.length === 0 || isPlacingOrder}
                >
                  <View style={styles.placeOrderContent}>
                    {isPlacingOrder ? <ActivityIndicator color="#ffffff" size="small" /> : null}
                    <ThemedText style={styles.placeOrderText}>
                      {isPlacingOrder ? 'Placing order...' : 'Place Order'}
                    </ThemedText>
                  </View>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6f8',
  },
  safeArea: {
    flex: 1,
  },
  page: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    padding: Spacing.four,
    paddingBottom: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 42,
    lineHeight: 46,
  },
  itemCountBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#dcfce7',
  },
  itemCountText: {
    color: '#15803d',
  },
  emptyState: {
    flex: 1,
    minHeight: 360,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    minHeight: 48,
    justifyContent: 'center',
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  cartList: {
    gap: Spacing.three,
    paddingBottom: Spacing.three,
  },
  listScroll: {
    flex: 1,
  },
  summaryCard: {
    marginTop: Spacing.two,
    marginBottom: BottomTabInset,
    padding: Spacing.three,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  totalText: {
    fontSize: 48,
    lineHeight: 52,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginTop: Spacing.two,
  },
  summaryRowLarge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: Spacing.two,
  },
  placeOrderButton: {
    marginTop: Spacing.three,
    backgroundColor: '#059669',
    paddingVertical: Spacing.three,
    borderRadius: 18,
    alignItems: 'center',
    minHeight: 54,
    justifyContent: 'center',
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 4,
  },
  placeOrderButtonDisabled: {
    opacity: 0.7,
  },
  placeOrderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  placeOrderText: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  bottomSpacer: {
    height: Spacing.one,
  },
});
