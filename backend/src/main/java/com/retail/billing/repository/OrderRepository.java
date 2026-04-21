package com.retail.billing.repository;

import com.retail.billing.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByInvoiceNumber(String invoiceNumber);
    List<Order> findByCustomerId(Long customerId);

    @Query("SELECT COALESCE(SUM(o.totalAmount),0) FROM Order o WHERE o.orderDate >= :start AND o.orderDate < :end AND o.status='COMPLETED'")
    BigDecimal findTodaysTotalSales(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.orderDate >= :start AND o.orderDate < :end AND o.status='COMPLETED'")
    Long findTodaysOrderCount(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT oi.product.id, oi.productName, SUM(oi.quantity) as totalQty FROM OrderItem oi GROUP BY oi.product.id, oi.productName ORDER BY totalQty DESC")
    List<Object[]> findTopSellingProducts();
}
