import { apiClient } from '../api/client';
import { ReservationResponse } from '../types/reservation';

export const getReservations = async (): Promise<ReservationResponse[]> => {
  const response = await apiClient.get<ReservationResponse[]>('/api/v1/admin/reservations');
  return response.data;
};

export const updateReservationStatus = async (id: string, status: string): Promise<ReservationResponse> => {
  const response = await apiClient.put<ReservationResponse>(`/api/v1/admin/reservations/${id}/status`, { status });
  return response.data;
};