import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
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
 

  const getCategoryIcon = (value: string, label: string): keyof typeof Ionicons.glyphMap => {
    const key = `${value} ${label}`.toLowerCase();
    if (key.includes('all')) return 'apps-outline';
    if (key.includes('fruit') || key.includes('vegetable') || key.includes('grocery')) return 'leaf-outline';
    if (key.includes('drink') || key.includes('beverage') || key.includes('juice')) return 'wine-outline';
    if (key.includes('snack') || key.includes('chips') || key.includes('bakery')) return 'fast-food-outline';
    if (key.includes('beauty') || key.includes('care') || key.includes('cosmetic')) return 'flower-outline';
    if (key.includes('fashion') || key.includes('cloth')) return 'shirt-outline';
    if (key.includes('tech') || key.includes('electronic') || key.includes('phone')) return 'phone-portrait-outline';
    if (key.includes('home') || key.includes('kitchen')) return 'home-outline';
    return 'grid-outline';
  };

  const normalizedSearch = searchText.trim().toLowerCase();

  const visibleProducts = products.filter((product) => {
    const matchesCategory = selectedCategory ? product.categorySlug === selectedCategory : true;
    const matchesSearch = normalizedSearch ? product.name.toLowerCase().includes(normalizedSearch) : true;
    return matchesCategory && matchesSearch;
  });

  const displayName = String(user?.name || 'Guest').trim() || 'Guest';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=EFEAFF&color=24106A&size=128`;

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
                Good morning,
              </ThemedText>
              <ThemedText type="subtitle" style={styles.pageTitle}>
                {displayName} 👋
              </ThemedText>
            </View>

            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          </View>

          <View style={styles.searchWrap}>
            <Ionicons name="search" size={20} color={Colors.light.textSecondary} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search products"
              placeholderTextColor={Colors.light.textSecondary}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            <Pressable style={styles.searchFilterButton}>
              <Ionicons name="options-outline" size={18} color={Colors.light.primary} />
            </Pressable>
          </View>

        

          <LinearGradient
          colors={['#6C38FF', '#8B5CF6', '#24106A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <ThemedText type="smallBold" style={styles.heroBadge}>
                New arrival
              </ThemedText>
              <ThemedText type="title" style={styles.heroTitle}>
                Everything you need in one place
              </ThemedText>
              <ThemedText type="small" style={styles.heroText}>
                Fresh groceries and trending products
              </ThemedText>

              <Pressable style={styles.primaryButton} onPress={() => router.push('/explore')}>
                <ThemedText style={styles.primaryButtonText}>Shop Now</ThemedText>
              </Pressable>
            </View>

            <View style={styles.heroDecor}>
              <Image
                source={{ uri: 'https://img.icons8.com/fluency/240/shopping-bag.png' }}
                style={styles.heroIllustration}
              />
            </View>
          </LinearGradient>

          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold">Explore Categories</ThemedText>
            <Pressable onPress={() => router.push('/explore')}>
              <ThemedText type="small" style={styles.linkText}>
                See all
              </ThemedText>
            </Pressable>
          </View>

          <ScrollView 
  horizontal 
  showsHorizontalScrollIndicator={false} 
  contentContainerStyle={styles.categoryRow}
>
  {categoryOptions.map((item, index) => {
    const iconName = getCategoryIcon(item.value, item.label);
    
    // Vibrant colors matching the screenshot for the circular backgrounds
    const vibrantColors = [
      '#6C38FF', // Purple (Beverages)
      '#FF5C00', // Orange (Electronics)
      '#56B930', // Green (Fruits & Veg)
      '#FFB800', // Yellow (Grocery)
      '#6C38FF', // Purple (Personal Care)
    ];
    const circleBackground = vibrantColors[index % vibrantColors.length];

    return (
      <Pressable
        key={item.value || 'all'}
        style={styles.categoryItemContainer}
        onPress={() =>
          router.push({
            pathname: '/',
            params: { category: item.value },
          })
        }
      >
        <View style={[styles.categoryIconCircle, { backgroundColor: circleBackground }]}>
          <Ionicons
            name={iconName}
            size={32}
            color="#FFFFFF" // Icons are white inside the colored circles
          />
        </View>
        <ThemedText style={styles.categoryLabel} numberOfLines={1}>
          {item.label}
        </ThemedText>
      </Pressable>
    );
  })}
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
                  <Ionicons name="add" size={18} color={Colors.light.backgroundElement} />
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
    paddingVertical: Spacing.one,
  },
  headerTextWrap: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    color: Colors.light.textSecondary,
    fontSize: 18,
  },
  pageTitle: {
    color: Colors.light.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginLeft: Spacing.two,
    backgroundColor: Colors.light.primaryLight,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.backgroundSelected,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSelected,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 18,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    minHeight: 54,
    gap: Spacing.two,
    marginTop: Spacing.one,
    marginBottom: Spacing.one,
  },
  searchInput: {
    flex: 1,
    color: Colors.light.text,
    fontSize: 15,
    paddingVertical: 0,
  },
  searchFilterButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    borderRadius: 24,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 6,
  },
  heroContent: {
    flex: 1,
    gap: Spacing.two,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${Colors.light.backgroundElement}33`,
    color: Colors.light.backgroundElement,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  heroTitle: {
    color: Colors.light.backgroundElement,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  heroText: {
    color: `${Colors.light.backgroundElement}E6`,
    lineHeight: 22,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: Spacing.four,
    paddingVertical: 10,
    borderRadius: 999,
  },
  primaryButtonText: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  heroDecor: {
    width: 116,
    height: 116,
    borderRadius: 28,
    backgroundColor: `${Colors.light.backgroundElement}29`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroIllustration: {
    width: 84,
    height: 84,
    resizeMode: 'contain',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkText: {
    color: Colors.light.primary,
  },
  categoryRow: {
    gap: Spacing.two,
    paddingRight: Spacing.one,
  },
  categoryCard: {
    minWidth: 110,
    borderRadius: 18,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: Colors.light.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  categoryCardActive: {
    borderColor: Colors.light.primary,
  },
  categoryIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconWrapActive: {
    backgroundColor: `${Colors.light.backgroundElement}2E`,
  },
  categoryCardText: {
    color: Colors.light.text,
    fontWeight: '600',
    fontSize: 13,
    flexShrink: 1,
  },
  categoryCardTextActive: {
    color: Colors.light.backgroundElement,
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
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.backgroundElement,
    padding: Spacing.two,
  },
  errorText: {
    color: Colors.light.accent,
  },
  productCard: {
    width: '48%',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: Colors.light.shadow,
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
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  productCategory: {
    color: Colors.light.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  productName: {
    color: Colors.light.text,
    fontSize: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    color: Colors.light.textSecondary,
    fontSize: 11,
  },
  priceText: {
    color: Colors.light.text,
    marginTop: 2,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: Spacing.one,
    paddingBottom: Spacing.one,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.backgroundElement,
  },
  tabItem: {
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    color: Colors.light.textSecondary,
    fontSize: 12,
  },
  tabLabelActive: {
    color: Colors.light.primary,
    fontWeight: '700',
  },

  categoryItemContainer: {
    alignItems: 'center',
    width: 76, // Ensures text has enough room to center under the circle
  },
  categoryIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34, // Perfectly circular
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8, // Space between circle and text
    // Optional: Subtle shadow to match the rich look in the screenshot
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3, 
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
  },

});
