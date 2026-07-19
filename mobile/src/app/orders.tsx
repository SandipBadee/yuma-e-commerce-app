import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, View } from 'react-native';
import { useEffect } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { fetchMyOrders } from '@/lib/order-api';
import { useOrderStore } from '../../store/useOrderStore';

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  items: OrderItem[];
  orderNumber?: string;
  total: number;
  status: string;
  date: string;
};

export default function OrdersScreen() {
  const { isHydrated, isAuthenticated } = useAuthGuard('/login');
  const { orders, loading, error, setOrders, setLoading, setError } = useOrderStore() as {
    orders: Order[];
    loading: boolean;
    error: string;
    setOrders: (orders: Order[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string) => void;
  };

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;

    let isMounted = true;

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError('');

        const result = await fetchMyOrders(25);
        if (!isMounted) return;

        const mapped = (result.orders || []).map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          items: [],
          total: Number(order.totalAmount || 0),
          status: String(order.status || 'PENDING'),
          date: order.createdAt,
          itemCount: Number(order?._count?.items || 0),
        }));

        setOrders(mapped as any);
      } catch (err) {
        if (!isMounted) return;
        setError(String((err as Error)?.message || 'Failed to load orders.'));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [isHydrated, isAuthenticated, setOrders, setLoading, setError]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.page}>
          <ThemedText type="small">Checking authentication...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const formatDate = (isoDate: string) =>
    new Date(isoDate).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.summaryRow}>
        <ThemedText type="small" style={styles.metaLabel}>
          Order ID
        </ThemedText>
        <ThemedText type="smallBold">{item.orderNumber || item.id}</ThemedText>
      </View>

      <View style={styles.summaryRow}>
        <ThemedText type="small" style={styles.metaLabel}>
          Total
        </ThemedText>
        <ThemedText type="smallBold">${item.total.toFixed(2)}</ThemedText>
      </View>

      <View style={styles.productsBlock}>
        <ThemedText type="small" style={styles.metaLabel}>
          Products
        </ThemedText>
        {item.items.length === 0 ? (
          <View style={styles.productRow}>
            <ThemedText type="small">{(item as any).itemCount || 0} item(s)</ThemedText>
          </View>
        ) : (
          item.items.map((product) => (
            <View key={product.id} style={styles.productRow}>
              <ThemedText type="small">{product.name}</ThemedText>
              <ThemedText type="small" style={styles.metaLabel}>
                x{product.quantity}
              </ThemedText>
            </View>
          ))
        )}
      </View>

      <View style={styles.summaryRow}>
        <ThemedText type="small" style={styles.metaLabel}>
          Status
        </ThemedText>
        <View style={styles.statusBadge}>
          <ThemedText type="smallBold" style={styles.statusText}>
            {item.status}
          </ThemedText>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <ThemedText type="small" style={styles.metaLabel}>
          Date
        </ThemedText>
        <ThemedText type="small">{formatDate(item.date)}</ThemedText>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.page}>
        <ThemedText type="subtitle" style={styles.title}>
          Orders
        </ThemedText>

        {loading ? (
          <View style={styles.emptyCard}>
            <ThemedText type="small">Loading orders...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.emptyCard}>
            <ThemedText type="small" style={styles.emptyBody}>
              {error}
            </ThemedText>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="receipt-outline" size={34} color="#6b7280" />
            </View>
            <ThemedText type="smallBold" style={styles.emptyTitle}>
              No orders yet
            </ThemedText>
            <ThemedText type="small" style={styles.emptyBody}>
              Place an order from your cart and it will appear here with status, date, and product details.
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.orderList}
          />
        )}
      </View>
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
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  emptyTitle: {
    textAlign: 'center',
    color: '#111827',
  },
  emptyBody: {
    marginTop: Spacing.one,
    textAlign: 'center',
    color: '#6b7280',
    lineHeight: 22,
  },
  orderList: {
    gap: Spacing.three,
    paddingBottom: Spacing.five,
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
    gap: Spacing.one,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    backgroundColor: '#fef3c7',
  },
  statusText: {
    color: '#b45309',
  },
  productsBlock: {
    marginTop: Spacing.one,
    marginBottom: Spacing.one,
    gap: 6,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  metaLabel: {
    color: '#6b7280',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
