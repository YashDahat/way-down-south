import { apiClient } from '../api/client';
import { CreateReservationRequest, ReservationResponse } from '../types/reservation';

export const createReservation = async (data: CreateReservationRequest): Promise<ReservationResponse> => {
  const response = await apiClient.post<ReservationResponse>('/api/v1/reservations', data);
  return response.data;
};