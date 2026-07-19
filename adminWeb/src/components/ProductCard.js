"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Star, ShoppingCart } from 'lucide-react';
import { CartContext } from '@/context/CartContext';
import { formatPrice } from '@/lib/data';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

export default function ProductCard({ product }) {
  const router = useRouter();
  const { addToCart } = useContext(CartContext);

  const productImage = product.image || (Array.isArray(product.images) ? product.images[0] : '') || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600';
  const displayWeight = product.weight || `${product.quantity || 1} ${product.unit || 'kg'}`;
  const displayRating = product.rating || '-';
  const displaySalePrice = product.salePrice ?? product.discountedPrice;

  function goToProduct() {
    if (!product?.slug && !product?.id) return;
    router.push(`/products/${product.slug || product.id}`);
  }

  function addProductToCart(event) {
    event.stopPropagation();
    addToCart({
      ...product,
      image: productImage,
      salePrice: displaySalePrice,
      discountedPrice: displaySalePrice
    });
  }
  
  return (
    <div className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl border border-stone-100 overflow-hidden transition-all duration-300 hover:-translate-y-1">
      <div 
        className="relative aspect-square overflow-hidden bg-stone-100 cursor-pointer"
        onClick={goToProduct}
      >
        <img 
          src={productImage}
          alt={product.name} 
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
          loading="lazy"
        />
        {/* {product.stock < 10 && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-amber-100 text-amber-800 border border-amber-200 shadow-sm">Low Stock</Badge>
          </div>
        )} */}
      </div>
      
      <div className="flex flex-col flex-1 p-5">
        <div className="flex justify-between items-start mb-2">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{displayWeight}</p>
          <div className="flex items-center gap-1">
            <Star className="text-amber-400 fill-current" size={14} />
            <span className="text-xs font-medium text-stone-600">{displayRating}</span>
          </div>
        </div>
        
        <h3 
          className="text-base font-bold text-stone-800 mb-1 leading-snug cursor-pointer hover:text-red-800 transition-colors line-clamp-2"
          onClick={goToProduct}
        >
          {product.name.slice(0, 25)}{product.name.length > 25 ? '...' : '' }
        </h3>
        
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div>
            <span className="text-lg font-black text-red-800  mr-2">{formatPrice(displaySalePrice || product.price)} / {displayWeight}</span>
            {displaySalePrice && (
              <span className="text-xs text-stone-400 line-through">{formatPrice(product.price)} / {displayWeight}</span>
            )}
          </div>
          <Button 
            variant="secondary" 
            size="icon" 
            className="rounded-full shadow-none hover:shadow-md"
            onClick={addProductToCart}
          >
          <ShoppingCart size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}