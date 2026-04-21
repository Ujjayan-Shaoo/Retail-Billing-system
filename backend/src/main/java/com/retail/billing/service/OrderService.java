package com.retail.billing.service;

import com.retail.billing.entity.*;
import com.retail.billing.exception.ResourceNotFoundException;
import com.retail.billing.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CustomerService customerService;

    @Transactional
    public Order createOrder(Long customerId, String customerName, String customerPhone,
                             List<Map<String, Object>> cartItems) {

        // Resolve customer
        Customer customer;
        if (customerId != null) {
            customer = customerService.getCustomerById(customerId);
        } else {
            customer = customerService.findOrCreateWalkIn(customerName, customerPhone);
        }

        Order order = new Order();
        order.setInvoiceNumber(generateInvoiceNumber());
        order.setCustomer(customer);
        order.setPaymentMethod("CASH");   // Always CASH — no other option

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (Map<String, Object> cartItem : cartItems) {
            Long productId = Long.valueOf(cartItem.get("productId").toString());
            int qty = Integer.parseInt(cartItem.get("quantity").toString());

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

            if (product.getStock() < qty) {
                throw new IllegalArgumentException(
                    "Insufficient stock for: " + product.getName() +
                    ". Available: " + product.getStock());
            }

            product.setStock(product.getStock() - qty);
            productRepository.save(product);

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(qty));

            items.add(OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productName(product.getName())
                    .quantity(qty)
                    .unitPrice(product.getPrice())
                    .totalPrice(itemTotal)
                    .build());

            total = total.add(itemTotal);
        }

        order.setSubtotal(total);
        order.setTotalAmount(total);
        order.setItems(items);
        return orderRepository.save(order);
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }

    public Order getOrderByInvoice(String inv) {
        return orderRepository.findByInvoiceNumber(inv)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + inv));
    }

    public List<Order> getAllOrders() { return orderRepository.findAll(); }

    public List<Order> getCustomerOrders(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    public Map<String, Object> getDashboardData() {
        LocalDateTime start = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime end   = start.plusDays(1);

        List<Object[]> topRaw = orderRepository.findTopSellingProducts();
        List<Map<String, Object>> topProducts = new ArrayList<>();
        for (int i = 0; i < Math.min(5, topRaw.size()); i++) {
            Object[] row = topRaw.get(i);
            topProducts.add(Map.of("productName", row[1], "totalQuantitySold", row[2]));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("todaysSales",  orderRepository.findTodaysTotalSales(start, end));
        result.put("todaysOrders", orderRepository.findTodaysOrderCount(start, end));
        result.put("totalProducts", productRepository.count());
        result.put("topProducts", topProducts);
        return result;
    }

    private String generateInvoiceNumber() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "INV-" + date + "-" + (int)(Math.random() * 9000 + 1000);
    }
}
