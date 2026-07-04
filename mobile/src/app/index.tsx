"use client";

import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { CATEGORIES, featuredProducts } from '@/data/products';

const categories = [...CATEGORIES];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextWrap}>
              <ThemedText type="small" style={styles.greeting}>
                Good morning 👋
              </ThemedText>
              <ThemedText type="subtitle" style={styles.pageTitle}>
                Find fresh picks
              </ThemedText>
            </View>

            <Pressable style={styles.iconButton}>
              <Ionicons name="cart-outline" size={22} color="#059669" />
            </Pressable>
          </View>

          <ThemedView type="backgroundElement" style={styles.heroCard}>
            <View style={styles.heroContent}>
              <ThemedText type="smallBold" style={styles.heroBadge}>
                New arrival
              </ThemedText>
              <ThemedText type="title" style={styles.heroTitle}>
                Everything you need in one place
              </ThemedText>
              <ThemedText type="small" style={styles.heroText}>
                Curated essentials, fresh groceries, and trending lifestyle picks.
              </ThemedText>

              <Pressable style={styles.primaryButton}>
                <ThemedText style={styles.primaryButtonText}>Shop now</ThemedText>
              </Pressable>
            </View>

            <View style={styles.heroDecor}>
              <Ionicons name="bag-handle-outline" size={84} color="#ffffff" />
            </View>
          </ThemedView>

          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold">Categories</ThemedText>
            <ThemedText type="small" style={styles.linkText}>
              See all
            </ThemedText>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {categories.map((item) => (
              <Pressable
                key={item}
                style={[styles.categoryChip, item === 'All' && styles.categoryChipActive]}
              >
                <ThemedText style={[styles.categoryChipText, item === 'All' && styles.categoryChipTextActive]}>
                  {item}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold">Popular products</ThemedText>
            <ThemedText type="small" style={styles.linkText}>
              More
            </ThemedText>
          </View>

          <View style={styles.productGrid}>
            {featuredProducts.map((product) => (
              <Pressable
                key={product.id}
                style={styles.productCard}
                onPress={() =>
                  router.push({
                    pathname: '/product/[id]',
                    params: { id: product.id },
                  })
                }
              >
                <Image source={{ uri: product.image }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <ThemedText type="small" style={styles.productCategory}>
                    {product.category.toUpperCase()}
                  </ThemedText>
                  <ThemedText type="smallBold" style={styles.productName}>
                    {product.name}
                  </ThemedText>

                  <View style={styles.metaRow}>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={13} color="#f59e0b" />
                      <ThemedText type="small" style={styles.ratingText}>
                        {product.rating} ({product.reviews})
                      </ThemedText>
                    </View>
                    <ThemedText type="smallBold" style={styles.priceText}>
                      ${product.price.toFixed(2)}
                    </ThemedText>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: Spacing.three,
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  greeting: {
    color: '#059669',
    marginBottom: 2,
  },
  pageTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    borderRadius: 24,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: '#059669',
  },
  heroContent: {
    flex: 1,
    gap: Spacing.two,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#ffffff',
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  heroText: {
    color: 'rgba(255,255,255,0.9)',
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
  },
  primaryButtonText: {
    color: '#059669',
    fontWeight: '700',
  },
  heroDecor: {
    width: 92,
    height: 92,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkText: {
    color: '#059669',
  },
  categoryRow: {
    gap: Spacing.two,
    paddingRight: Spacing.one,
  },
  categoryChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryChipActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  categoryChipText: {
    color: '#374151',
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: Spacing.two,
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: Spacing.two,
    gap: 4,
  },
  productCategory: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  productName: {
    color: '#111827',
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#6b7280',
    fontSize: 11,
  },
  priceText: {
    color: '#111827',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: Spacing.one,
    paddingBottom: Spacing.one,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  tabItem: {
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    color: '#6b7280',
    fontSize: 12,
  },
  tabLabelActive: {
    color: '#059669',
    fontWeight: '700',
  },
});
