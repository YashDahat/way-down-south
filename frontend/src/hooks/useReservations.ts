import { useMutation, UseMutationResult } from '@tanstack/react-query';
import * as reservationService from '../services/reservationService';
import { CreateReservationRequest, ReservationResponse } from '../types/reservation';

export const useCreateReservation = (): UseMutationResult<ReservationResponse, Error, CreateReservationRequest> => {
  return useMutation<ReservationResponse, Error, CreateReservationRequest>({
    mutationFn: reservationService.createReservation,
  });
};