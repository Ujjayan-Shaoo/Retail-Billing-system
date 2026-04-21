package com.retail.billing.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDTO {

    @Data
    public static class CartItem {
        private Long productId;
        private Integer quantity;
    }

    @Data
    public static class Request {
        private Long customerId;
        private String customerName;
        private String customerPhone;
        private List<CartItem> items;
        private Double discountPercent;
        private String paymentMethod;
    }

    @Data
    public static class Response {
        private Long id;
        private String invoiceNumber;
        private String customerName;
        private String customerPhone;
        private List<OrderItemResponse> items;
        private BigDecimal subtotal;
        private Double discountPercent;
        private BigDecimal discountAmount;
        private BigDecimal totalAmount;
        private String paymentMethod;
        private LocalDateTime orderDate;
        private String status;
    }

    @Data
    public static class OrderItemResponse {
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }
}
