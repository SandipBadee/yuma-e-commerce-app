"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useContext } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  X,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { CartContext } from "@/context/CartContext";
import { formatPrice } from "@/lib/data";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

export default function CartDrawer() {
  const router = useRouter();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
  } = useContext(CartContext);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${
        isCartOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!isCartOpen}
    >
      <div
        className={`absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity duration-[1000ms] ease-in-out ${
          isCartOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      <div className="absolute inset-y-0 right-0 max-w-md w-full flex">
        <div
          className={`w-full h-full flex flex-col bg-white shadow-2xl transform transition-transform duration-[1000ms] ease-in-out will-change-transform ${
            isCartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-stone-50/50">
            <div className="flex items-center gap-2">
              <ShoppingCart className="text-red-800" size={24} />
              <h2 className="text-lg font-bold text-stone-800">Your Cart</h2>
              <Badge className="bg-red-100 text-red-800 ml-2">
                {cart.length} items
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCartOpen(false)}
              className="-mr-2"
            >
              <X size={24} />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-stone-500">
                <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag size={48} className="text-stone-300" />
                </div>
                <p className="text-lg font-medium text-stone-800">
                  Your cart is empty
                </p>
                <p className="text-sm">
                  Looks like you havent added any authentic spices or rice yet.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsCartOpen(false)}
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <ul className="space-y-5">
                {cart.map((item) => (
                  <li key={item.id} className="flex gap-4">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-stone-100 bg-stone-50">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between text-base font-medium text-stone-800">
                        <h3 className="line-clamp-2 leading-tight pr-4">
                          {item.name}
                        </h3>
                        <div className="text-right ml-4">
                          {item.discountedPrice && (
                            <p className="text-xs text-stone-400 line-through mb-0.5">
                              {formatPrice(item.price * item.qty)}
                            </p>
                          )}
                          <p className="font-bold text-red-800">
                            {formatPrice(
                              (item.discountedPrice || item.price) * item.qty
                            )}
                          </p>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-stone-500">
                        {item.weight}
                      </p>
                      <div className="flex items-center justify-between flex-1 mt-2">
                        <div className="flex items-center border border-stone-200 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 text-stone-500 hover:text-red-800 hover:bg-stone-50 rounded-l-lg transition-colors"
                            disabled={item.qty <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-3 py-1 text-sm font-semibold text-stone-800 min-w-[2rem] text-center">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 text-stone-500 hover:text-red-800 hover:bg-stone-50 rounded-r-lg transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="font-medium text-stone-400 hover:text-red-600 transition-colors p-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t border-stone-100 bg-stone-50 p-5 space-y-4">
              <div className="flex justify-between text-base font-medium text-stone-800">
                <p>Subtotal</p>
                <p className="text-xl font-bold">{formatPrice(cartTotal)}</p>
              </div>
              <p className="text-xs text-stone-500 flex items-start gap-1">
                <ShieldCheck size={14} className="flex-shrink-0 mt-0.5 text-green-600" />
                No payment required now. You will pay at the store during pickup.
              </p>
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-base"
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/cart");
                  }}
                >
                  Go to Cart Page
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full text-base"
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/checkout");
                  }}
                >
                  Proceed Checkout
                </Button>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-sm font-medium text-stone-500 hover:text-stone-800 mt-2 text-center"
                >
                  or Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}