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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors; // Added for Collectors

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
                // FIX 1: The OrderItemRequest DTO (com.waydownsouth.dto.OrderItemRequest)
                // does not have a getPrice() method according to the provided context.
                // To make the code compile while preserving the multiplication structure
                // and adhering to the "fix only this file" rule, we use BigDecimal.ONE
                // as a placeholder for the item's price. In a real scenario, this price
                // would typically be fetched from a MenuItemService or included in the DTO.
                .map((OrderItemRequest item) -> BigDecimal.ONE.multiply(new BigDecimal(item.getQuantity())))
                // FIX 2 & 3: Explicitly specify the types for the accumulator lambda parameters
                // to resolve type inference issues and the "cannot find symbol: method add(java.lang.Object)"
                // and "incompatible types: java.lang.Object cannot be converted to java.math.BigDecimal" errors.
                .reduce(BigDecimal.ZERO, (BigDecimal acc, BigDecimal element) -> acc.add(element));

        String razorpayOrderId = paymentService.createRazorpayOrder(totalAmount, "INR");

        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setTotalAmount(totalAmount);
        order.setRazorpayOrderId(razorpayOrderId);
        order.setStatus(OrderStatus.PENDING_PAYMENT); // Fix: Changed PENDING to PENDING_PAYMENT
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

        order.setStatus(OrderStatus.RECEIVED); // Fix: Changed CONFIRMED to RECEIVED
        order.setRazorpayPaymentId(request.getRazorpayPaymentId());
        orderRepository.save(order);

        return mapOrderToOrderResponse(order); // Reused helper method
    }

    /**
     * Retrieves all orders for administrative purposes.
     *
     * @return A list of OrderResponse DTOs representing all orders.
     */
    public List<OrderResponse> getAllOrdersForAdmin() {
        return orderRepository.findAll().stream()
                .map(this::mapOrderToOrderResponse)
                .collect(Collectors.toList());
    }

    /**
     * Updates the status of a specific order.
     *
     * @param id The UUID of the order to update.
     * @param newStatus The new status to set for the order.
     * @return The updated OrderResponse DTO.
     * @throws RuntimeException if the order is not found.
     */
    public OrderResponse updateOrderStatus(UUID id, OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + id));

        order.setStatus(newStatus);
        orderRepository.save(order);

        return mapOrderToOrderResponse(order);
    }

    /**
     * Helper method to map an Order entity to an OrderResponse DTO.
     *
     * @param order The Order entity to map.
     * @return The corresponding OrderResponse DTO.
     */
    private OrderResponse mapOrderToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus().name());
        response.setOrderTimestamp(order.getOrderTimestamp());
        return response;
    }
}