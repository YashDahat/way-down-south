import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReservations, updateReservationStatus } from '../services/adminReservationService';
import { ReservationResponse } from '../types/reservation';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AdminReservationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    data: reservations,
    isLoading,
    isError,
    error,
  } = useQuery<ReservationResponse[]>({
    queryKey: ['adminReservations'],
    queryFn: getReservations,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateReservationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReservations'] });
    },
  });

  if (isLoading) {
    return <div className="p-6">Loading reservations...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-500">Error: {error?.message || 'Failed to fetch reservations'}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Reservations</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Reservation Time</TableHead>
            <TableHead>Party Size</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations?.map((reservation) => (
            <TableRow key={reservation.id}>
              <TableCell>{reservation.customerName}</TableCell>
              <TableCell>
                {/* Assuming customerEmail and customerPhone are part of ReservationResponse based on "Contact (Email/Phone)" instruction */}
                {/* If these fields are not present in the actual ReservationResponse type, this will cause a compile error. */}
                {/* The instruction's ReservationResponse type includes "...", implying additional fields. */}
                {(reservation as any).customerEmail} {(reservation as any).customerPhone ? `(${(reservation as any).customerPhone})` : ''}
              </TableCell>
              <TableCell>{new Date(reservation.reservationTime).toLocaleString()}</TableCell>
              <TableCell>{reservation.partySize}</TableCell>
              <TableCell>
                <Select
                  defaultValue={reservation.status}
                  onValueChange={(newStatus) =>
                    updateStatusMutation.mutate({ id: reservation.id, status: newStatus })
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                    <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminReservationsPage;