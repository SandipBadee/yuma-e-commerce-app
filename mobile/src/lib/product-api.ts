import { apiRequest } from '@/lib/api-client';

export type MobileProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  image: string;
  description: string;
  stock: number;
  rating: number;
  reviews: number;
};

type BackendProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  salePrice?: number | null;
  description?: string | null;
  images?: string[];
  stock?: number;
  category?: {
    name?: string;
    slug?: string;
  };
};

function mapProduct(product: BackendProduct): MobileProduct {
  const image = Array.isArray(product.images) && product.images[0] ? product.images[0] : '';
  const categoryName = String(product?.category?.name || 'General');
  const categorySlug = String(product?.category?.slug || 'general');
  const numericPrice = Number(product.salePrice ?? product.price ?? 0);

  return {
    id: String(product.id),
    slug: String(product.slug),
    name: String(product.name || 'Product'),
    category: categoryName,
    categorySlug,
    price: Number.isFinite(numericPrice) ? numericPrice : 0,
    image,
    description: String(product.description || 'No description available.'),
    stock: Number(product.stock || 0),
    rating: 0,
    reviews: 0,
  };
}

export async function fetchProducts(query: { category?: string; search?: string; limit?: number } = {}) {
  const searchParams = new URLSearchParams();

  if (query.category) searchParams.set('category', query.category);
  if (query.search) searchParams.set('search', query.search);
  searchParams.set('limit', String(query.limit ?? 60));

  const payload = await apiRequest<{ products: BackendProduct[] }>(`/api/products?${searchParams.toString()}`, {
    method: 'GET',
  });

  return (payload.products || []).map(mapProduct);
}

export async function fetchProductBySlug(slug: string) {
  const payload = await apiRequest<BackendProduct>(`/api/products/${encodeURIComponent(slug)}`, {
    method: 'GET',
  });

  return mapProduct(payload);
}
