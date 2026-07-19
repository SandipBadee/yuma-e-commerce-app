import { apiRequest } from '@/lib/api-client';

export type MobileCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isFeatured: boolean;
  productCount: number;
};

type BackendCategory = {
  id: string;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  image?: string | null;
  isFeatured?: boolean;
  productCount?: number;
};

type CategoriesPayload = {
  categories?: BackendCategory[];
};

function mapCategory(category: BackendCategory): MobileCategory {
  return {
    id: String(category.id),
    name: String(category.name || 'Category'),
    slug: String(category.slug || category.name || 'category').toLowerCase(),
    description: category.description ?? null,
    image: category.image ?? null,
    isFeatured: Boolean(category.isFeatured),
    productCount: Number(category.productCount || 0),
  };
}

export async function fetchCategories() {
  const payload = await apiRequest<CategoriesPayload>('/api/category', {
    method: 'GET',
    headers: {
      accept: '*/*',
    },
  });

  return (payload.categories || []).map(mapCategory);
}
