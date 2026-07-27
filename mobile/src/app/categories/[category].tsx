import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { fetchProducts, type MobileProduct } from '@/lib/product-api';
import { useCartStore } from '../../../store/useCartStore';

export default function CategoryProductsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const { addToCart } = useCartStore() as { addToCart: (item: MobileProduct) => void };
  const categorySlug = params.category ?? '';
  const [products, setProducts] = useState<MobileProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const result = await fetchProducts({ category: categorySlug, limit: 80 });
        if (!isMounted) return;
        setProducts(result);
      } catch (err) {
        if (!isMounted) return;
        setError(String((err as Error)?.message || 'Failed to load category products.'));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (categorySlug) {
      load();
    } else {
      setLoading(false);
      setProducts([]);
    }

    return () => {
      isMounted = false;
    };
  }, [categorySlug]);

  const categoryName = useMemo(() => {
    return products[0]?.category || categorySlug || 'Category';
  }, [products, categorySlug]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={Colors.light.primary} />
          </Pressable>
          <View style={styles.headerTextWrap}>
            <ThemedText type="small" style={styles.eyebrow}>
              Selected category
            </ThemedText>
            <ThemedText type="subtitle">{categoryName}</ThemedText>
          </View>
        </View>

        {loading ? (
          <ThemedText type="small" style={styles.emptyState}>
            Loading products...
          </ThemedText>
        ) : error ? (
          <ThemedText type="small" style={styles.errorState}>
            {error}
          </ThemedText>
        ) : products.length > 0 ? (
          <View style={styles.productGrid}>
            {products.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <Pressable
                  style={styles.productPressable}
                  onPress={() =>
                    router.push({
                      pathname: '/product/[id]',
                      params: {
                        id: product.slug,
                      },
                    })
                  }
                >
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <ThemedText type="smallBold" style={styles.productName}>
                      {product.name}
                    </ThemedText>
                    <ThemedText type="small" style={styles.productMeta}>
                      ${product.price.toFixed(2)}
                    </ThemedText>
                  </View>
                </Pressable>
                <Pressable style={styles.addButton} onPress={() => addToCart(product)}>
                  <Ionicons name="add" size={18} color={Colors.light.backgroundElement} />
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <ThemedText type="small" style={styles.emptyState}>
            No products available for this category yet.
          </ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  headerTextWrap: {
    flex: 1,
  },
  eyebrow: {
    color: Colors.light.primary,
    marginBottom: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSelected,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  productCard: {
    width: '48%',
    padding: Spacing.two,
    borderRadius: 16,
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: Spacing.one,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  productPressable: {
    gap: Spacing.one,
  },
  productImage: {
    width: '100%',
    height: 110,
    borderRadius: 12,
  },
  productInfo: {
    gap: 4,
  },
  productName: {
    color: Colors.light.text,
  },
  productMeta: {
    color: Colors.light.textSecondary,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  emptyState: {
    color: Colors.light.textSecondary,
    textAlign: 'center',
    paddingTop: Spacing.four,
  },
  errorState: {
    color: Colors.light.accent,
    textAlign: 'center',
    paddingTop: Spacing.four,
  },
});
