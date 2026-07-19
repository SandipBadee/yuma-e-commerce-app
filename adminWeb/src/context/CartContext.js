"use client";
import React, { useState, useEffect, createContext } from 'react';
import { CheckCircle2 } from 'lucide-react';

export const CartContext = createContext();

const CART_STORAGE_KEY = 'yuma_cart';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Load cart on client after mount so SSR/CSR first render remain consistent.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      setCart(saved ? JSON.parse(saved) : []);
    } catch (_error) {
      setCart([]);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart, hasHydrated]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + quantity } : item);
      }
      return [...prev, { ...product, qty: quantity }];
    });
    showToast(`Added ${product.name} to cart`);
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  
  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + ((item.discountedPrice || item.price) * item.qty), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateQuantity, clearCart, 
      cartTotal, cartCount, isCartOpen, setIsCartOpen, showToast 
    }}>
      {children}
      
      {/* Toast Notification */}
      <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-stone-800 text-white px-6 py-3 rounded-full shadow-2xl transition-all duration-300 z-[100] flex items-center gap-2 ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <CheckCircle2 size={18} className="text-green-400" />
        <span className="font-medium text-sm">{toastMessage}</span>
      </div>
    </CartContext.Provider>
  );
};