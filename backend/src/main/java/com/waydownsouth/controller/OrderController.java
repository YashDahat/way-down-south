package com.waydownsouth.controller;

import com.waydownsouth.dto.CreateOrderRequest;
import com.waydownsouth.dto.RazorpayOrderResponse;
import com.waydownsouth.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<RazorpayOrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        RazorpayOrderResponse response = orderService.createOrder(request);
        return ResponseEntity.ok(response);
    }
}