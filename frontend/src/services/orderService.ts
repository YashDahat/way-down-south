import { apiClient } from '@/api/client';
import { CreateOrderRequest, RazorpayOrderResponse } from '@/types/order';

export const createOrder = async (data: CreateOrderRequest): Promise<RazorpayOrderResponse> => {
  const response = await apiClient.post<RazorpayOrderResponse>('/api/v1/orders', data);
  return response.data;
};