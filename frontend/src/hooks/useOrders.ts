import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { createOrder } from '@/services/orderService';
import { CreateOrderRequest, RazorpayOrderResponse } from '@/types/order';

export const useCreateOrder = (): UseMutationResult<RazorpayOrderResponse, Error, CreateOrderRequest> => {
  return useMutation<RazorpayOrderResponse, Error, CreateOrderRequest>({
    mutationFn: createOrder,
  });
};