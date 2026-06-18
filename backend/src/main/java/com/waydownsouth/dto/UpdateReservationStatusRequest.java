package com.waydownsouth.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateReservationStatusRequest {
    @NotBlank
    private String status;

    public UpdateReservationStatusRequest() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}