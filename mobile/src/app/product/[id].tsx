"use client";

import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useCart } from '@/context/cart-context';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { featuredProducts } from '@/data/products';

export default function ProductDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const product = featuredProducts.find((item) => item.id === params.id);

  if (!product) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="title">Product not found</ThemedText>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Go back</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const { addToCart } = useCart();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#059669" />
          </Pressable>
          <ThemedText type="subtitle" style={styles.pageTitle}>
            {product.name}
          </ThemedText>
        </View>

        <Image source={{ uri: product.image }} style={styles.productImage} />

        <View style={styles.detailsCard}>
          <View style={styles.badgeRow}>
            <ThemedText type="smallBold" style={styles.productCategory}>
              {product.category.toUpperCase()}
            </ThemedText>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#f59e0b" />
              <ThemedText type="small" style={styles.ratingText}>
                {product.rating}
              </ThemedText>
            </View>
          </View>

          <ThemedText type="title" style={styles.productName}>
            {product.name}
          </ThemedText>

          <ThemedText type="small" style={styles.descriptionText}>
            {product.description}
          </ThemedText>

          <View style={styles.priceRow}>
            <ThemedText type="smallBold" style={styles.priceText}>
              ${product.price.toFixed(2)}
            </ThemedText>
            <Pressable style={styles.cartButton} onPress={() => addToCart(product)}>
              <Ionicons name="cart" size={18} color="#ffffff" />
              <ThemedText style={styles.cartButtonText}>Add to cart</ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingBottom: BottomTabInset,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pageTitle: {
    flex: 1,
    fontSize: 28,
    lineHeight: 34,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#059669',
    fontWeight: '700',
    marginTop: Spacing.one,
  },
  productImage: {
    width: '100%',
    height: 260,
    borderRadius: 24,
  },
  detailsCard: {
    gap: Spacing.three,
    padding: Spacing.three,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productCategory: {
    color: '#059669',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8fafc',
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: 999,
  },
  ratingText: {
    color: '#111827',
  },
  productName: {
    fontSize: 28,
    lineHeight: 34,
  },
  descriptionText: {
    color: '#6b7280',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 24,
    color: '#111827',
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 999,
  },
  cartButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
});
