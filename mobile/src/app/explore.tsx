import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { featuredProducts } from '@/data/products';

const categories = [
  { label: 'grocery', value: 'Grocery', icon: 'basket-outline' as const },
  { label: 'clothes', value: 'Clothing', icon: 'shirt-outline' as const },
  { label: 'electronics', value: 'Electronics', icon: 'desktop-outline' as const },
  { label: 'others', value: 'Others', icon: 'sparkles-outline' as const },
];

export default function CategoriesScreen() {
  const router = useRouter();

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

        <View style={styles.categoryGrid}>
          {categories.map((category) => {
            const count = featuredProducts.filter((product) => product.category === category.value).length;
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
                  <Ionicons name={category.icon} size={24} color="#059669" />
                </View>
                <Text style={styles.categoryTitle}>{category.label}</Text>
                <ThemedText type="small" style={styles.categoryMeta}>
                  {count} products
                </ThemedText>
              </Pressable>
            );
          })}
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
});
