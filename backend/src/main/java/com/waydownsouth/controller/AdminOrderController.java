package com.waydownsouth.controller;

import com.waydownsouth.dto.OrderResponse;
import com.waydownsouth.model.OrderStatus;
import com.waydownsouth.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> orders = orderService.getAllOrdersForAdmin();
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable UUID id, @RequestBody Map<String, String> statusMap) {
        String statusString = statusMap.get("status");

        if (statusString == null || statusString.isBlank()) {
            throw new IllegalArgumentException("Status cannot be null or blank");
        }

        OrderStatus newStatusEnum;
        try {
            newStatusEnum = OrderStatus.valueOf(statusString.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status value: " + statusString, e);
        }

        OrderResponse updatedOrder = orderService.updateOrderStatus(id, newStatusEnum);
        return ResponseEntity.ok(updatedOrder);
    }
}