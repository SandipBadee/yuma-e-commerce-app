"use client";

import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { CartItem } from '@/context/cart-context';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type Props = {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
};

export function CartItemRow({ item, onIncrease, onDecrease, onRemove }: Props) {
  return (
    <View style={styles.row}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.meta}>
        <ThemedText type="smallBold" style={styles.name}>
          {item.name}
        </ThemedText>
        <ThemedText type="small" style={styles.price}>
          ${item.price.toFixed(2)}
        </ThemedText>
      </View>

      <View style={styles.quantityWrap}>
        <Pressable style={styles.controlButton} onPress={onDecrease}>
          <Ionicons name="remove" size={18} color="#111827" />
        </Pressable>
        <ThemedText type="smallBold" style={styles.quantityText}>
          {item.quantity}
        </ThemedText>
        <Pressable style={styles.controlButton} onPress={onIncrease}>
          <Ionicons name="add" size={18} color="#111827" />
        </Pressable>
      </View>

      <Pressable style={styles.removeButton} onPress={onRemove}>
        <Ionicons name="trash-outline" size={18} color="#ef4444" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
  },
  meta: {
    flex: 1,
    gap: 4,
  },
  name: {
    marginBottom: 2,
  },
  price: {
    color: '#6b7280',
  },
  quantityWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityText: {
    minWidth: 24,
    textAlign: 'center',
  },
  controlButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
