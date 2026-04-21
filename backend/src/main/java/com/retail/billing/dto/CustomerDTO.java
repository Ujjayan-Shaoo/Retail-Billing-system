package com.retail.billing.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CustomerDTO {

    @Data
    public static class Request {
        private String name;
        private String phone;
        private String email;
    }

    @Data
    public static class Response {
        private Long id;
        private String name;
        private String phone;
        private String email;
        private LocalDateTime createdAt;
    }
}
