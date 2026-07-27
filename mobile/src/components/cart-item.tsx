import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { CartItem } from '@/context/cart-context';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

type Props = {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  canIncrease?: boolean;
  canDecrease?: boolean;
};

export function CartItemRow({ item, onIncrease, onDecrease, onRemove, canIncrease = true, canDecrease = true }: Props) {
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
          <Pressable style={[styles.controlButton, !canDecrease && styles.controlButtonDisabled]} onPress={onDecrease} disabled={!canDecrease}>
            <Ionicons name="remove" size={18} color={canDecrease ? Colors.light.text : Colors.light.textSecondary} />
          </Pressable>
          <ThemedText type="smallBold" style={styles.quantityText}>
            {item.quantity}
          </ThemedText>
          <Pressable style={[styles.controlButton, !canIncrease && styles.controlButtonDisabled]} onPress={onIncrease} disabled={!canIncrease}>
            <Ionicons name="add" size={18} color={canIncrease ? Colors.light.text : Colors.light.textSecondary} />
          </Pressable>
        </View>

        <Pressable style={styles.removeButton} onPress={onRemove}>
          <Ionicons name="trash-outline" size={16} color={Colors.light.accent} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: Colors.light.backgroundSelected,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: Colors.light.text,
  },
  price: {
    color: Colors.light.textSecondary,
  },
  lineTotal: {
    color: Colors.light.primary,
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
    backgroundColor: Colors.light.backgroundSelected,
    borderRadius: 999,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  quantityText: {
    minWidth: 22,
    textAlign: 'center',
    color: Colors.light.text,
  },
  controlButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonDisabled: {
    backgroundColor: Colors.light.backgroundSelected,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
