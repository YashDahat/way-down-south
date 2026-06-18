package com.waydownsouth.controller;

import com.waydownsouth.dto.ReservationResponse;
import com.waydownsouth.dto.UpdateReservationStatusRequest;
import com.waydownsouth.model.ReservationStatus;
import com.waydownsouth.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/reservations")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReservationController {

    private final ReservationService reservationService;

    public AdminReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping
    public ResponseEntity<List<ReservationResponse>> getAllReservations() {
        List<ReservationResponse> reservations = reservationService.getAllReservations();
        return new ResponseEntity<>(reservations, HttpStatus.OK);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ReservationResponse> updateReservationStatus(@PathVariable UUID id, @Valid @RequestBody UpdateReservationStatusRequest request) {
        ReservationStatus newStatus;
        try {
            newStatus = ReservationStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        ReservationResponse updatedReservation = reservationService.updateReservationStatus(id, newStatus);
        return new ResponseEntity<>(updatedReservation, HttpStatus.OK);
    }
}