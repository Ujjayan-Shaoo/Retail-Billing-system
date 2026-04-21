package com.retail.billing.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class DashboardDTO {

    @Data
    public static class TopProduct {
        private String productName;
        private Long totalQuantitySold;
    }

    @Data
    public static class Summary {
        private BigDecimal todaysSales;
        private Long todaysOrders;
        private Long totalProducts;
        private Long lowStockCount;
        private List<TopProduct> topProducts;
    }
}
