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
  const lineTotal = item.price * item.quantity;

  return (
    <View style={styles.row}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.meta}>
        <ThemedText type="smallBold" style={styles.name}>
          {item.name}
        </ThemedText>
        <ThemedText type="small" style={styles.price}>
          ${item.price.toFixed(2)} each
        </ThemedText>
        <ThemedText type="smallBold" style={styles.lineTotal}>
          ${lineTotal.toFixed(2)}
        </ThemedText>
      </View>

      <View style={styles.controlsColumn}>
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
          <Ionicons name="trash-outline" size={16} color="#ef4444" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: '#111827',
  },
  price: {
    color: '#6b7280',
  },
  lineTotal: {
    color: '#059669',
    marginTop: 2,
  },
  controlsColumn: {
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  quantityWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  quantityText: {
    minWidth: 22,
    textAlign: 'center',
    color: '#111827',
  },
  controlButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
