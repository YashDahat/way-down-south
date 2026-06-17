import { apiClient } from '../api/client';
import { OrderResponse } from '../types/order';

// Assuming OrderResponse is defined in this file as per instruction

export const getOrders = async (): Promise<OrderResponse[]> => {
  const response = await apiClient.get<OrderResponse[]>('/api/v1/admin/orders');
  return response.data;
};

export const updateOrderStatus = async (id: string, status: string): Promise<OrderResponse> => {
  const response = await apiClient.put<OrderResponse>(`/api/v1/admin/orders/${id}/status`, { status });
  return response.data;
};