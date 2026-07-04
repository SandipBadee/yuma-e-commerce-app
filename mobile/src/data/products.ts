export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
};

export const CATEGORIES = ['All', 'Grocery', 'Clothing', 'Electronics', 'Others'] as const;

export const featuredProducts: Product[] = [
  {
    id: 'g1',
    name: 'Organic Avocados',
    category: 'Grocery',
    price: 5.99,
    rating: 4.8,
    reviews: 124,
    image:
      'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=600',
    description:
      'Fresh hand-picked premium Hass avocados. Rich in heart-healthy monounsaturated fats and perfect for making delicious homemade guacamole or spreading over morning toast.',
  },
  {
    id: 'c1',
    name: 'Premium Cotton Hoodie',
    category: 'Clothing',
    price: 45.0,
    rating: 4.7,
    reviews: 210,
    image:
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600',
    description:
      'Ultra-soft fleece cotton pullover hoodie with an adjustable drawstring hood and roomy kangaroo pocket for everyday comfort.',
  },
  {
    id: 'e1',
    name: 'Noise-Cancelling Headphones',
    category: 'Electronics',
    price: 129.99,
    rating: 4.9,
    reviews: 340,
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
    description:
      'Premium over-ear headphones with advanced Active Noise Cancellation (ANC), long battery life, and rich high fidelity sound.',
  },
  {
    id: 'o1',
    name: 'Insulated Water Bottle',
    category: 'Others',
    price: 18.5,
    rating: 4.8,
    reviews: 423,
    image:
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600',
    description:
      'Double-walled vacuum-insulated bottle that keeps drinks cold for up to 24 hours or hot for up to 12 hours.',
  },
];
