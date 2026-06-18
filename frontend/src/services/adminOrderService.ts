import { apiClient } from '../api/client';

// Define OrderResponse locally as it was not exported from '../types/order'
interface OrderResponse {
  id: string;
  status: string; // e.g., 'PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  totalAmount: number; // Calculated total amount of the order
  // Add any other fields expected in an order response from the backend
}

export const getOrders = async (): Promise<OrderResponse[]> => {
  const response = await apiClient.get<OrderResponse[]>('/api/v1/admin/orders');
  return response.data;
};

export const updateOrderStatus = async (id: string, status: string): Promise<OrderResponse> => {
  const response = await apiClient.put<OrderResponse>(`/api/v1/admin/orders/${id}/status`, { status });
  return response.data;
};