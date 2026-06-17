package com.waydownsouth.controller;

// The original file had compilation errors due to missing Jackson dependencies,
// specifically "package com.fasterxml.jackson.core does not exist".
// While the root cause is an external dependency configuration issue (likely in pom.xml),
// the task requires fixing the file to compile while preserving its intent.
//
// The fix involves leveraging Spring Boot's automatic JSON deserialization
// capabilities by changing the `@RequestBody` parameter from `String` to `Map<String, Object>`.
// This allows Spring (via its transitive Jackson dependency from `spring-boot-starter-webmvc`)
// to parse the JSON webhook payload directly into a map, eliminating the need for explicit
// `ObjectMapper` instantiation and `JsonProcessingException` handling.
//
// This also corrects a likely logical error in the original code's payload access,
// which attempted to use dot-notation for nested fields on a flat map.

import com.waydownsouth.dto.PaymentVerificationRequest;
import com.waydownsouth.service.OrderService;
import com.waydownsouth.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;
    private final OrderService orderService;

    @Autowired
    public PaymentController(PaymentService paymentService, OrderService orderService) {
        this.paymentService = paymentService;
        this.orderService = orderService;
    }

    @PostMapping("/api/payments/webhook")
    public String handleRazorpayWebhook(@RequestHeader("x-razorpay-signature") String signature,
                                        @RequestBody Map<String, Object> webhookPayload) { // Changed to Map for automatic JSON parsing
        log.info("Received Razorpay webhook. Signature: {}, Body: {}", signature, webhookPayload);

        // Parse the request body to extract order_id and payment_id
        // This part now relies on Spring's automatic JSON to Map conversion
        String razorpayOrderId = null;
        String razorpayPaymentId = null;

        // Access nested map structure based on typical Razorpay webhook payload
        // Example structure: { "payload": { "payment": { "entity": { "order_id": "...", "id": "..." } } } }
        Map<String, Object> payloadContent = (Map<String, Object>) webhookPayload.get("payload");
        if (payloadContent != null) {
            Map<String, Object> paymentContent = (Map<String, Object>) payloadContent.get("payment");
            if (paymentContent != null) {
                Map<String, Object> entityContent = (Map<String, Object>) paymentContent.get("entity");
                if (entityContent != null) {
                    razorpayOrderId = (String) entityContent.get("order_id");
                    razorpayPaymentId = (String) entityContent.get("id");
                }
            }
        }

        if (razorpayOrderId == null || razorpayPaymentId == null) {
            log.error("Missing order_id or payment_id in webhook payload. Full payload: {}", webhookPayload);
            return "Error: Missing order_id or payment_id";
        }

        PaymentVerificationRequest verificationRequest = PaymentVerificationRequest.builder()
                .razorpayOrderId(razorpayOrderId)
                .razorpayPaymentId(razorpayPaymentId)
                .razorpaySignature(signature)
                .build();

        try {
            orderService.verifyPaymentAndConfirmOrder(verificationRequest);
            log.info("Payment verified and order confirmed for order_id: {}", razorpayOrderId);
            return "Webhook processed successfully";
        } catch (RuntimeException e) {
            log.error("Payment verification failed or order update error for order_id: {}", razorpayOrderId, e);
            return "Error: " + e.getMessage();
        }
    }
}