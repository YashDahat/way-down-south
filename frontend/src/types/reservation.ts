export interface CreateReservationRequest {
  customerName: string;
  email: string;
  phone: string;
  reservationTime: string; // ISO 8601 format, e.g., 2024-12-25T19:00:00
  partySize: number;
}

export interface ReservationResponse {
  id: string; // UUID
  customerName: string;
  email: string;
  phone: string;
  reservationTime: string; // ISO 8601 format
  partySize: number;
  status: string; // e.g., 'CONFIRMED', 'PENDING'
}