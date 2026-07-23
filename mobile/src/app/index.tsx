import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { fetchCategories, type MobileCategory } from '@/lib/category-api';
import { fetchProducts, type MobileProduct } from '@/lib/product-api';
import { useCartStore } from '../../store/useCartStore';
import { useUserStore } from '../../store/useUserStore';

export default function HomeScreen() {
  const router = useRouter();
  const { addToCart } = useCartStore();
  const { hasSeenWelcome, user } = useUserStore() as {
    hasSeenWelcome: boolean;
    user: { name?: string } | null;
  };
  const [products, setProducts] = React.useState<MobileProduct[]>([]);
  const [categories, setCategories] = React.useState<MobileCategory[]>([]);
  const [categoriesError, setCategoriesError] = React.useState('');
  const [loadingProducts, setLoadingProducts] = React.useState(true);
  const [productsError, setProductsError] = React.useState('');
  const [searchText, setSearchText] = React.useState('');
  const params = useLocalSearchParams<{ category?: string }>();
  const selectedCategory = typeof params.category === 'string' && params.category ? params.category : '';
  const categoryOptions = React.useMemo(
    () => [{ label: 'All', value: '' }, ...categories.map((item) => ({ label: item.name, value: item.slug }))],
    [categories]
  );

  const normalizedSearch = searchText.trim().toLowerCase();

  const visibleProducts = products.filter((product) => {
    const matchesCategory = selectedCategory ? product.categorySlug === selectedCategory : true;
    const matchesSearch = normalizedSearch ? product.name.toLowerCase().includes(normalizedSearch) : true;
    return matchesCategory && matchesSearch;
  });

  const displayName = String(user?.name || 'Guest').trim() || 'Guest';

  const handleAddToCart = (product: MobileProduct) => {
    addToCart(product);
  };

  React.useEffect(() => {
    if (!hasSeenWelcome) {
      router.replace('/welcome' as never);
    }
  }, [hasSeenWelcome, router]);

  React.useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductsError('');
        const nextProducts = await fetchProducts({ limit: 60 });
        if (!isMounted) return;
        setProducts(nextProducts);
      } catch (error) {
        if (!isMounted) return;
        setProductsError(String((error as Error)?.message || 'Failed to load products.'));
      } finally {
        if (isMounted) {
          setLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        setCategoriesError('');
        const nextCategories = await fetchCategories();
        if (!isMounted) return;
        setCategories(nextCategories);
      } catch (error) {
        if (!isMounted) return;
        setCategoriesError(String((error as Error)?.message || 'Failed to load categories.'));
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextWrap}>
              <ThemedText type="small" style={styles.greeting}>
                Welcome to YUMA
              </ThemedText>
              <ThemedText type="subtitle" style={styles.pageTitle}>
                {displayName} 👋
              </ThemedText>
            </View>

          
          </View>

          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color="#6b7280" />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search product name"
              placeholderTextColor="#9ca3af"
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
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
            <ThemedText type="smallBold">Explore Categories</ThemedText>
            <Pressable onPress={() => router.push('/explore')}>
              <ThemedText type="small" style={styles.linkText}>
                See all
              </ThemedText>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {categoryOptions.map((item) => (
              <Pressable
                key={item.value}
                style={[styles.categoryChip, selectedCategory === item.value && styles.categoryChipActive]}
                onPress={() =>
                  router.push({
                    pathname: '/',
                    params: { category: item.value },
                  })
                }
              >
                <ThemedText style={[styles.categoryChipText, selectedCategory === item.value && styles.categoryChipTextActive]}>
                  {item.label}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>

          {categoriesError ? (
            <ThemedText type="small" style={styles.errorText}>
              {categoriesError}
            </ThemedText>
          ) : null}

          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold">Popular products</ThemedText>
            <ThemedText type="small" style={styles.linkText}>
              More
            </ThemedText>
          </View>

          {loadingProducts ? (
            <View style={styles.placeholderCard}>
              <ThemedText type="small">Loading products...</ThemedText>
            </View>
          ) : productsError ? (
            <View style={styles.placeholderCard}>
              <ThemedText type="small" style={styles.errorText}>
                {productsError}
              </ThemedText>
            </View>
          ) : visibleProducts.length === 0 ? (
            <View style={styles.placeholderCard}>
              <ThemedText type="small">No products found</ThemedText>
            </View>
          ) : null}

          <View style={styles.productGrid}>
            {visibleProducts.map((product) => (
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
                    <ThemedText type="small" style={styles.productCategory}>
                      {product.category.toUpperCase()}
                    </ThemedText>
                    <ThemedText type="smallBold" style={styles.productName}>
                      {product.name}
                    </ThemedText>

                   
                    <ThemedText type="smallBold" style={styles.priceText}>
                      NPR {product.price}
                    </ThemedText>
                  </View>
                </Pressable>
                <Pressable style={styles.addButton} onPress={() => handleAddToCart(product)}>
                  <Ionicons name="add" size={18} color="#ffffff" />
                </Pressable>
              </View>
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingHorizontal: Spacing.two,
    minHeight: 48,
    gap: Spacing.one,
  },
  searchInput: {
    flex: 1,
    color: '#111827',
    fontSize: 15,
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
  placeholderCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    padding: Spacing.two,
  },
  errorText: {
    color: '#b91c1c',
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
  productPressable: {
    gap: 4,
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: Spacing.two,
    gap: 4,
    paddingBottom: Spacing.four,
  },
  addButton: {
    position: 'absolute',
    right: Spacing.two,
    bottom: Spacing.two,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    color: '#6b7280',
    fontSize: 11,
  },
  priceText: {
    color: '#111827',
    marginTop: 2,
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
