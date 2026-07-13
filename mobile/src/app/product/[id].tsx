import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useCart } from '@/context/cart-context';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function ProductDetailsScreen() {
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    category: string;
    price: string;
    description: string;
    image: string;
    rating: string;
    reviews: string;
  }>();
  const router = useRouter();
  const { addToCart } = useCart();

  if (!params.id) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="title">Product not found</ThemedText>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Go back</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const product = {
    id: params.id,
    name: params.name ?? 'Product',
    category: params.category ?? 'Unknown',
    price: Number(params.price) || 0,
    description:
      params.description ??
      'Experience premium quality and thoughtful design in every detail. This product is built for everyday convenience and long-lasting performance.',
    image:
      params.image ??
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
    rating: Number(params.rating) || 4.8,
    reviews: Number(params.reviews) || 42,
  };

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
            ${product.price.toFixed(2)}
          </ThemedText>
        </View>
        <Pressable style={styles.addToCartButton} onPress={() => addToCart(product)}>
          <ThemedText style={styles.addToCartText}>Add to Cart</ThemedText>
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
