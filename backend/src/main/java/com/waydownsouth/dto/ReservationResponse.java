package com.waydownsouth.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class ReservationResponse {
    private UUID id;
    private String customerName;
    private LocalDateTime reservationTime;
    private int partySize;
    private String status;

    public ReservationResponse() {
    }

    public ReservationResponse(UUID id, String customerName, LocalDateTime reservationTime, int partySize, String status) {
        this.id = id;
        this.customerName = customerName;
        this.reservationTime = reservationTime;
        this.partySize = partySize;
        this.status = status;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public LocalDateTime getReservationTime() {
        return reservationTime;
    }

    public void setReservationTime(LocalDateTime reservationTime) {
        this.reservationTime = reservationTime;
    }

    public int getPartySize() {
        return partySize;
    }

    public void setPartySize(int partySize) {
        this.partySize = partySize;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}