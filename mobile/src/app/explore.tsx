import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { fetchCategories, type MobileCategory } from '@/lib/category-api';

const categoryIcons = [
  'cafe',          // Beverages
  'headset',       // Electronics
  'nutrition',     // Fruits & Vegetables
  'bag-handle',    // Grocery
  'water',         // Household
  'flask',         // Personal Care
] as const;

const cardColors = [
  '#F4F0FF', // Soft purple
  '#FFF4EA', // Soft orange
  '#F2FCEF', // Soft green
  '#FFF8EB', // Soft yellow
  '#F2F6FE', // Soft blue
  '#F6F2FF', // Soft violet
];

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<MobileCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const allCategories = await fetchCategories();
        if (!isMounted) return;
        setCategories(allCategories);
      } catch (err) {
        if (!isMounted) return;
        setError(String((err as Error)?.message || 'Failed to load categories.'));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryCards = useMemo(
    () => categories.map((category) => ({ label: category.name, value: category.slug, count: category.productCount })),
    [categories]
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={28} color={Colors.light.text} />
          </Pressable>
          
          <Text style={styles.headerTitle}>Categories</Text>
          
          {/* Empty view to balance the flexbox and keep the title centered */}
          <View style={{ width: 28 }} />
        </View>

        {loading ? (
          <ThemedText type="small" style={styles.metaText}>
            Loading categories...
          </ThemedText>
        ) : error ? (
          <ThemedText type="small" style={styles.errorText}>
            {error}
          </ThemedText>
        ) : (
          <View style={styles.categoryGrid}>
            {categoryCards.map((category, index) => {
              const icon = categoryIcons[index % categoryIcons.length];
              const bgColor = cardColors[index % cardColors.length];
              const iconColor = icon === 'cafe' ? '#8A2BE2' 
                              : icon === 'headset' ? '#FF8C00'
                              : icon === 'nutrition' ? '#32CD32'
                              : icon === 'bag-handle' ? '#FFB81C'
                              : icon === 'water' ? '#1E90FF'
                              : '#9370DB';

              return (
                <Pressable
                  key={category.value}
                  style={({ pressed }) => [
                    styles.categoryCard,
                    { backgroundColor: bgColor },
                    pressed && styles.cardPressed
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: '/categories/[category]',
                      params: { category: category.value },
                    })
                  }
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={64} color={iconColor} />
                  </View>
                  
                  <View style={styles.textContainer}>
                    <Text style={styles.categoryTitle} numberOfLines={2}>{category.label}</Text>
                    <Text style={styles.categoryMeta}>
                      {category.count} products
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.five,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
    marginTop: Spacing.one,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '47.5%',
    height: 200,
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  textContainer: {
    alignItems: 'flex-start',
    marginTop: 12,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#333333',
    marginBottom: 4,
  },
  categoryMeta: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
  },
  metaText: {
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: Colors.light.accent,
    textAlign: 'center',
    marginTop: 20,
  },
});