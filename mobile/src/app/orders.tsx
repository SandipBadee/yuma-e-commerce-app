import { ScrollView, StyleSheet, View } from 'react-native';

import { useCart } from '@/context/cart-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

export default function OrdersScreen() {
  const { orders } = useCart();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <ThemedText type="subtitle" style={styles.title}>
          Orders
        </ThemedText>
        <ThemedText type="small" style={styles.body}>
          Track your latest purchases, status updates, and line item totals.
        </ThemedText>

        {orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <ThemedText type="smallBold" style={styles.emptyTitle}>
              No orders yet
            </ThemedText>
            <ThemedText type="small" style={styles.emptyBody}>
              Orders you place from the cart will appear here with status, quantity, and pricing.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.orderList}>
            {orders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <ThemedText type="smallBold">{order.id}</ThemedText>
                    <ThemedText type="small" style={styles.metaText}>
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </ThemedText>
                  </View>
                  <View style={[styles.statusBadge, order.status === 'Delivered' ? styles.statusDelivered : order.status === 'On the way' ? styles.statusOnTheWay : styles.statusPending]}>
                    <ThemedText type="smallBold" style={[styles.statusBadgeText, order.status === 'Delivered' ? styles.statusDeliveredText : order.status === 'On the way' ? styles.statusOnTheWayText : styles.statusPendingText]}>
                      {order.status}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.itemsBlock}>
                  {order.items.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <View style={styles.itemInfo}>
                        <ThemedText type="smallBold">{item.name}</ThemedText>
                        <ThemedText type="small" style={styles.metaText}>
                          Qty {item.quantity} x ${item.price.toFixed(2)}
                        </ThemedText>
                      </View>
                      <ThemedText type="smallBold">${(item.price * item.quantity).toFixed(2)}</ThemedText>
                    </View>
                  ))}
                </View>

                <View style={styles.divider} />

                <View style={styles.summaryRow}>
                  <ThemedText type="small">Items</ThemedText>
                  <ThemedText type="small">{order.itemCount}</ThemedText>
                </View>
                <View style={styles.summaryRow}>
                  <ThemedText type="smallBold">Total</ThemedText>
                  <ThemedText type="smallBold">${order.total.toFixed(2)}</ThemedText>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    marginBottom: Spacing.one,
  },
  body: {
    color: '#6b7280',
    lineHeight: 22,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  emptyTitle: {
    marginBottom: Spacing.one,
  },
  emptyBody: {
    color: '#6b7280',
    lineHeight: 22,
  },
  orderList: {
    gap: Spacing.three,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
    gap: Spacing.two,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  metaText: {
    color: '#6b7280',
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
  },
  statusBadgeText: {
    fontSize: 12,
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusPendingText: {
    color: '#b45309',
  },
  statusOnTheWay: {
    backgroundColor: '#dbeafe',
  },
  statusOnTheWayText: {
    color: '#1d4ed8',
  },
  statusDelivered: {
    backgroundColor: '#dcfce7',
  },
  statusDeliveredText: {
    color: '#15803d',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  itemsBlock: {
    gap: Spacing.two,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
