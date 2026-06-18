package com.waydownsouth.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private static final String RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    private RestTemplate restTemplate;

    @PostConstruct
    public void init() {
        this.restTemplate = new RestTemplate();
    }

    public String createRazorpayOrder(BigDecimal amount, String currency) {
        try {
            long amountInPaise = amount.multiply(new BigDecimal("100")).longValue();

            Map<String, Object> orderRequest = new HashMap<>();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", "receipt_" + UUID.randomUUID().toString());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String credentials = razorpayKeyId + ":" + razorpayKeySecret;
            String encoded = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
            headers.set("Authorization", "Basic " + encoded);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(orderRequest, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(RAZORPAY_ORDERS_URL, entity, Map.class);
            if (response == null || !response.containsKey("id")) {
                throw new RuntimeException("Invalid response from Razorpay");
            }
            return (String) response.get("id");
        } catch (Exception e) {
            log.error("Error creating Razorpay order", e);
            throw new RuntimeException("Error creating Razorpay order", e);
        }
    }

    public boolean verifyPaymentSignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        try {
            String payload = razorpayOrderId + "|" + razorpayPaymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().equals(razorpaySignature);
        } catch (Exception e) {
            log.error("Error verifying payment signature", e);
            return false;
        }
    }
}