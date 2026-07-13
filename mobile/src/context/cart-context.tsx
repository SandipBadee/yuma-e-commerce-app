import React, { createContext, useContext, useMemo, useState } from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export type AddToCartItem = Omit<CartItem, 'quantity'>;

export type OrderStatus = 'Pending' | 'On the way' | 'Delivered';

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  status: OrderStatus;
  createdAt: string;
};

type CartContextValue = {
  cartItems: CartItem[];
  orders: Order[];
  addToCart: (item: AddToCartItem) => void;
  removeFromCart: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
  placeOrder: () => Order | null;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const addToCart = (newItem: AddToCartItem) => {
    setCartItems((current) => {
      const existingItem = current.find((item) => item.id === newItem.id);
      if (existingItem) {
        return current.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...newItem, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((current) => current.filter((item) => item.id !== id));
  };

  const increaseQuantity = (id: string) => {
    setCartItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id: string) => {
    setCartItems((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const placeOrder = () => {
    if (cartItems.length === 0) {
      return null;
    }

    const statuses: OrderStatus[] = ['Pending', 'On the way', 'Delivered'];
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      items: cartItems.map((item) => ({ ...item })),
      total,
      itemCount,
      status: statuses[orders.length % statuses.length],
      createdAt: new Date().toISOString(),
    };

    setOrders((current) => [order, ...current]);
    setCartItems([]);

    return order;
  };

  const value = useMemo(
    () => ({
      cartItems,
      orders,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      placeOrder,
    }),
    [cartItems, orders]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
