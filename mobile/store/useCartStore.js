import { create } from 'zustand';

import { useToastStore } from './useToastStore';

function clampQuantity(nextQuantity, stock) {
	const normalizedStock = Number.isFinite(Number(stock)) ? Number(stock) : 0;
	if (normalizedStock <= 0) {
		return 0;
	}

	return Math.max(1, Math.min(Number(nextQuantity) || 1, normalizedStock));
}

export const useCartStore = create((set) => ({
	cartItems: [],

	addToCart: (item, quantity = 1) =>
		set((state) => {
			const stock = Number(item?.stock || 0);

			if (stock <= 0) {
				useToastStore.getState().showToast(`${item.name} is out of stock`, { tone: 'error' });
				return state;
			}

			const existingItem = state.cartItems.find((cartItem) => cartItem.id === item.id);
			const requestedQuantity = Math.max(1, Number(quantity) || 1);

			if (existingItem) {
				const nextQuantity = clampQuantity(existingItem.quantity + requestedQuantity, existingItem.stock ?? stock);

				if (nextQuantity === existingItem.quantity) {
					useToastStore.getState().showToast(`Only ${existingItem.stock} ${existingItem.name} available`, { tone: 'info' });
					return state;
				}

				useToastStore.getState().showToast(`Added ${requestedQuantity} ${item.name} to cart`);

				return {
					cartItems: state.cartItems.map((cartItem) =>
						cartItem.id === item.id ? { ...cartItem, stock, quantity: nextQuantity } : cartItem
					),
				};
			}

			const initialQuantity = clampQuantity(requestedQuantity, stock);
			useToastStore.getState().showToast(`Added ${initialQuantity} ${item.name} to cart`);

			return {
				cartItems: [...state.cartItems, { ...item, stock, quantity: initialQuantity }],
			};
		}),

	increaseQuantity: (id) =>
		set((state) => {
			let hitStockLimit = null;

			const cartItems = state.cartItems.map((item) => {
				if (item.id !== id) {
					return item;
				}

				const nextQuantity = clampQuantity(item.quantity + 1, item.stock);
				if (nextQuantity === item.quantity) {
					hitStockLimit = item;
					return item;
				}

				return { ...item, quantity: nextQuantity };
			});

			if (hitStockLimit) {
				useToastStore.getState().showToast(`Only ${hitStockLimit.stock} ${hitStockLimit.name} available`, { tone: 'info' });
			}

			return { cartItems };
		}),

	decreaseQuantity: (id) =>
		set((state) => ({
			cartItems: state.cartItems.map((item) => {
				if (item.id !== id) {
					return item;
				}

				return { ...item, quantity: Math.max(1, item.quantity - 1) };
			}),
		})),

	removeFromCart: (id) =>
		set((state) => ({
			cartItems: state.cartItems.filter((item) => item.id !== id),
		})),

	clearCart: () => set({ cartItems: [] }),
}));
