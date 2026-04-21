package com.retail.billing.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProductDTO {

    @Data
    public static class Request {
        private String name;
        private String description;
        private String category;
        private BigDecimal price;
        private Integer stock;
        private String unit;
    }

    @Data
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private String category;
        private BigDecimal price;
        private Integer stock;
        private String unit;
        private boolean lowStock;
        private LocalDateTime createdAt;
    }
}
