package com.waydownsouth.service;

import com.waydownsouth.dto.CreateOrderRequest;
import com.waydownsouth.dto.OrderItemRequest;
import com.waydownsouth.dto.OrderResponse;
import com.waydownsouth.dto.PaymentVerificationRequest;
import com.waydownsouth.dto.RazorpayOrderResponse;
import com.waydownsouth.model.Order;
import com.waydownsouth.model.OrderStatus;
import com.waydownsouth.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final PaymentService paymentService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    public OrderService(OrderRepository orderRepository, PaymentService paymentService) {
        this.orderRepository = orderRepository;
        this.paymentService = paymentService;
    }

    public RazorpayOrderResponse createOrder(CreateOrderRequest request) {
        BigDecimal totalAmount = request.getItems().stream()
                .map((OrderItemRequest item) -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String razorpayOrderId = paymentService.createRazorpayOrder(totalAmount, "INR");

        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setTotalAmount(totalAmount);
        order.setRazorpayOrderId(razorpayOrderId);
        order.setStatus(OrderStatus.PENDING);
        order.setOrderTimestamp(LocalDateTime.now());

        orderRepository.save(order);

        return RazorpayOrderResponse.builder()
                .razorpayOrderId(razorpayOrderId)
                .amount(totalAmount.multiply(new BigDecimal("100")).longValue())
                .currency("INR")
                .apiKey(razorpayKeyId)
                .build();
    }

    public OrderResponse verifyPaymentAndConfirmOrder(PaymentVerificationRequest request) {
        boolean isValid = paymentService.verifyPaymentSignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (!isValid) {
            throw new RuntimeException("Payment signature verification failed");
        }

        Order order = orderRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found for razorpayOrderId: " + request.getRazorpayOrderId()));

        order.setStatus(OrderStatus.CONFIRMED);
        order.setRazorpayPaymentId(request.getRazorpayPaymentId());
        orderRepository.save(order);

        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus().name());
        response.setOrderTimestamp(order.getOrderTimestamp());
        return response;
    }
}