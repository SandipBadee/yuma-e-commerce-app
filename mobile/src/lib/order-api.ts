import { apiRequest } from '@/lib/api-client';

export type CreateOrderItem = {
  productId: string;
  quantity: number;
};

export type CreateOrderPayload = {
  items: CreateOrderItem[];
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    addressLine1?: string;
    addressLine2?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
  orderType?: 'PICKUP' | 'DELIVERY';
  scheduleType?: 'asap' | 'scheduled';
  scheduledAt?: string | null;
};

export type CreatedOrderResponse = {
  message: string;
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    orderType: string;
    createdAt: string;
    items: Array<{
      id: string;
      quantity: number;
      price: number;
      product: {
        id: string;
        name: string;
        slug: string;
        images?: string[];
      };
    }>;
  };
};

export type MyOrder = {
  id: string;
  orderNumber: string;
  status: string;
  orderType: string;
  totalAmount: number;
  createdAt: string;
  _count?: {
    items?: number;
  };
};

export async function createOrder(payload: CreateOrderPayload) {
  return apiRequest<CreatedOrderResponse>('/api/orders', {
    method: 'POST',
    authenticated: true,
    body: payload,
  });
}

export async function fetchMyOrders(limit = 20) {
  return apiRequest<{ orders: MyOrder[] }>(`/api/orders/mine?limit=${limit}`, {
    method: 'GET',
    authenticated: true,
  });
}
