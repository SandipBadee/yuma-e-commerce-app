import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { fetchProductBySlug, type MobileProduct } from '@/lib/product-api';
import { useCartStore } from '../../../store/useCartStore';

export default function ProductDetailsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addToCart } = useCartStore();
  const [product, setProduct] = useState<MobileProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const slug = String(params.id || '').trim();
  const [loading, setLoading] = useState(Boolean(slug));
  const [error, setError] = useState(slug ? '' : 'Product id is missing.');

  const stock = Number(product?.stock || 0);
  const maxQuantity = stock > 0 ? stock : 1;
  const totalPrice = Number(product?.price || 0) * quantity;

  const updateQuantity = (nextQuantity: number) => {
    setQuantity(Math.max(1, Math.min(nextQuantity, maxQuantity)));
  };

  useEffect(() => {
    if (!slug) {
      return;
    }

    let isMounted = true;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchProductBySlug(slug);
        if (!isMounted) return;
        setProduct(data);
        setQuantity(1);
      } catch (err) {
        if (!isMounted) return;
        setError(String((err as Error)?.message || 'Failed to load product.'));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="title">Loading product...</ThemedText>
      </ThemedView>
    );
  }

  if (!product || error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="title">Product not found</ThemedText>
        <ThemedText type="small" style={styles.backButtonText}>
          {error || 'Unable to find this product.'}
        </ThemedText>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Go back</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#059669" />
          </Pressable>
          <View style={styles.pageTitleWrap}>
            <ThemedText type="smallBold" style={styles.productCategory}>
              {product.category}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.pageTitle}>
              {product.name}
            </ThemedText>
          </View>
        </View>

        <View style={styles.imageWrapper}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <View style={styles.categoryOverlay}>
            <ThemedText type="smallBold" style={styles.categoryOverlayText}>
              {product.category}
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.ratingRowLarge}>
            <View style={styles.ratingBadgeLarge}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <ThemedText type="smallBold" style={styles.ratingTextLarge}>
                {product.rating}
              </ThemedText>
            </View>
            <ThemedText type="small" style={styles.reviewText}>
              {product.reviews} reviews
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Product Description
            </ThemedText>
            <ThemedText type="small" style={styles.sectionText}>
              {product.description}
            </ThemedText>
          </View>

          <View style={styles.quantityCard}>
            <View style={styles.quantityHeader}>
              <View>
                <ThemedText type="smallBold" style={styles.sectionTitle}>
                  Quantity
                </ThemedText>
                <ThemedText type="small" style={styles.quantityHint}>
                  Min 1{stock > 0 ? `, max ${stock} in stock` : ''}
                </ThemedText>
              </View>
              <View style={[styles.stockBadge, stock <= 0 && styles.stockBadgeEmpty]}>
                <ThemedText type="smallBold" style={[styles.stockText, stock <= 0 && styles.stockTextEmpty]}>
                  {stock > 0 ? `${stock} available` : 'Out of stock'}
                </ThemedText>
              </View>
            </View>

            <View style={styles.quantityStepper}>
              <Pressable
                style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                onPress={() => updateQuantity(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Ionicons name="remove" size={20} color={quantity <= 1 ? '#9ca3af' : '#1a1a40'} />
              </Pressable>
              <View style={styles.quantityValueWrap}>
                <ThemedText type="subtitle" style={styles.quantityValue}>
                  {quantity}
                </ThemedText>
              </View>
              <Pressable
                style={[styles.quantityButton, (quantity >= maxQuantity || stock <= 0) && styles.quantityButtonDisabled]}
                onPress={() => updateQuantity(quantity + 1)}
                disabled={quantity >= maxQuantity || stock <= 0}
              >
                <Ionicons name="add" size={20} color={quantity >= maxQuantity || stock <= 0 ? '#9ca3af' : '#1a1a40'} />
              </Pressable>
            </View>
          </View>

          <View style={styles.extraCard}>
            <View style={styles.extraRow}>
              <ThemedText type="smallBold">Immediate Stock</ThemedText>
              <ThemedText type="small">Available now</ThemedText>
            </View>
            <View style={styles.extraRow}>
              <ThemedText type="smallBold">7 Days Refund</ThemedText>
              <ThemedText type="small">Satisfaction guaranteed</ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <ThemedText type="smallBold" style={styles.totalLabel}>
            Total price
          </ThemedText>
          <ThemedText type="subtitle" style={styles.totalPrice}>
            ${totalPrice.toFixed(2)}
          </ThemedText>
        </View>
        <Pressable
          style={[styles.addToCartButton, stock <= 0 && styles.addToCartButtonDisabled]}
          onPress={() => {
            addToCart(product, quantity);
          }}
          disabled={stock <= 0}
        >
          <ThemedText style={styles.addToCartText}>{stock > 0 ? 'Add to Cart' : 'Out of Stock'}</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    paddingBottom: BottomTabInset + 120,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pageTitleWrap: {
    flex: 1,
    gap: Spacing.one,
  },
  pageTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productCategory: {
    color: '#16a34a',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  productImage: {
    width: '100%',
    height: 340,
  },
  categoryOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  categoryOverlayText: {
    color: '#059669',
  },
  infoCard: {
    gap: Spacing.three,
  },
  ratingRowLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
  },
  ratingTextLarge: {
    color: '#111827',
  },
  reviewText: {
    color: '#6b7280',
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#111827',
  },
  sectionText: {
    color: '#4b5563',
    lineHeight: 22,
  },
  quantityCard: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  quantityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  quantityHint: {
    color: '#6b7280',
    marginTop: 2,
  },
  stockBadge: {
    borderRadius: 999,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stockBadgeEmpty: {
    backgroundColor: '#fff7ed',
  },
  stockText: {
    color: '#16a34a',
  },
  stockTextEmpty: {
    color: '#ff6b2c',
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.two,
    backgroundColor: '#f5f5f7',
    borderRadius: 999,
    padding: 6,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  quantityValueWrap: {
    minWidth: 48,
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 28,
    lineHeight: 32,
    color: '#1a1a40',
  },
  extraCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    padding: Spacing.three,
    gap: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  extraRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  totalLabel: {
    color: '#6b7280',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '700',
  },
  addToCartButton: {
    backgroundColor: '#059669',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: 18,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  addToCartText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  backButtonText: {
    color: '#059669',
    fontWeight: '700',
    marginTop: Spacing.one,
  },
});
