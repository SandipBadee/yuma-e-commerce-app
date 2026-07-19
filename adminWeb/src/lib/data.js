// src/lib/data.js
export const CATEGORIES = [
  { id: 'rice', name: 'Rice & Flour', icon: '🌾', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400' },
  { id: 'spices', name: 'Spices', icon: '🌶️', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400' },
  { id: 'lentils', name: 'Lentils / Dal', icon: '🥣', image: 'https://images.unsplash.com/photo-1515543904379-3d75700730b5?auto=format&fit=crop&q=80&w=400' },
  { id: 'snacks', name: 'Snacks', icon: '🥨', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=400' },
  { id: 'sauces', name: 'Sauces & Pickles', icon: '🍯', image: 'https://images.unsplash.com/photo-1589131662580-928646b959ea?auto=format&fit=crop&q=80&w=400' },
];

export const PRODUCTS = [
  { id: 'p1', categoryId: 'rice', name: 'Premium Royal Basmati Rice', weight: '5kg', price: 18.99, discountedPrice: 15.99, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600', stock: 15, rating: 4.8, description: 'Extra long grain Basmati rice...' },
  { id: 'p2', categoryId: 'spices', name: 'Organic Turmeric Powder (Haldi)', weight: '500g', price: 6.49, discountedPrice: 5.49, image: 'https://images.unsplash.com/photo-1614316346024-14cecc54a7f0?auto=format&fit=crop&q=80&w=600', stock: 40, rating: 4.9, description: 'High-curcumin organic turmeric powder...' },
  { id: 'p3', categoryId: 'lentils', name: 'Red Lentils (Masoor Dal)', weight: '1kg', price: 4.99, image: 'https://images.unsplash.com/photo-1515543904379-3d75700730b5?auto=format&fit=crop&q=80&w=600', stock: 25, rating: 4.6, description: 'Quick-cooking red lentils...' },
  { id: 'p4', categoryId: 'spices', name: 'Kashmiri Red Chilli Powder', weight: '250g', price: 5.99, discountedPrice: 4.99, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600', stock: 50, rating: 4.7, description: 'Vibrant red color with a mild heat...' },
  { id: 'p5', categoryId: 'sauces', name: 'Spicy Mango Pickle (Achaar)', weight: '400g', price: 7.99, image: 'https://images.unsplash.com/photo-1589131662580-928646b959ea?auto=format&fit=crop&q=80&w=600', stock: 12, rating: 4.5, description: 'Traditional homemade-style mango pickle...' },
  { id: 'p6', categoryId: 'snacks', name: 'Crispy Spicy Bhujia', weight: '350g', price: 3.49, discountedPrice: 2.49, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600', stock: 30, rating: 4.4, description: 'Crunchy, mildly spicy gram flour noodles...' },
  { id: 'p7', categoryId: 'rice', name: 'Brown Sona Masoori Rice', weight: '5kg', price: 16.50, image: 'https://images.unsplash.com/photo-1621251343750-7133a88c7f21?auto=format&fit=crop&q=80&w=600', stock: 8, rating: 4.3, description: 'Healthy, unpolished Sona Masoori brown rice...' },
  { id: 'p8', categoryId: 'lentils', name: 'Yellow Moong Dal', weight: '1kg', price: 5.49, image: 'https://images.unsplash.com/photo-1604543788736-231a4773cce7?auto=format&fit=crop&q=80&w=600', stock: 18, rating: 4.7, description: 'Split and skinned green gram...' },
  { id: 'p9', categoryId: 'rice', name: 'Jasmine Rice', weight: '2kg', price: 9.99, discountedPrice: 7.99, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600', stock: 22, rating: 4.6, description: 'Aromatic jasmine rice with delicate flavor...' },
  { id: 'p10', categoryId: 'spices', name: 'Cumin Seeds (Jeera)', weight: '200g', price: 4.99, discountedPrice: 3.49, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600', stock: 35, rating: 4.8, description: 'Premium whole cumin seeds...' },
];

export const formatPrice = (price) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(price);