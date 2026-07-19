import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { fetchCategories, type MobileCategory } from '@/lib/category-api';

const categoryIcons = [
  'basket-outline',
  'shirt-outline',
  'desktop-outline',
  'sparkles-outline',
] as const;

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
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <ThemedText type="small" style={styles.eyebrow}>
              Browse by section
            </ThemedText>
            <ThemedText type="subtitle">Categories</ThemedText>
          </View>
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
            return (
              <Pressable
                key={category.value}
                style={styles.categoryCard}
                onPress={() =>
                  router.push({
                    pathname: '/categories/[category]',
                    params: { category: category.value },
                  })
                }
              >
                <View style={styles.iconWrap}>
                  <Ionicons name={icon} size={24} color="#059669" />
                </View>
                <Text style={styles.categoryTitle}>{category.label}</Text>
                <ThemedText type="small" style={styles.categoryMeta}>
                  {category.count} products
                </ThemedText>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  eyebrow: {
    color: '#059669',
    marginBottom: 2,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  categoryCard: {
    width: '48%',
    padding: Spacing.three,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    gap: Spacing.one,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    textTransform: 'capitalize',
  },
  categoryMeta: {
    color: '#6b7280',
  },
  metaText: {
    color: '#6b7280',
  },
  errorText: {
    color: '#b91c1c',
  },
});
