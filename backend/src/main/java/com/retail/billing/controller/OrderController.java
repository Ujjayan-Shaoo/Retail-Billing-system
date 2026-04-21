package com.retail.billing.controller;

import com.retail.billing.entity.AppUser;
import com.retail.billing.entity.Order;
import com.retail.billing.repository.AppUserRepository;
import com.retail.billing.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final AppUserRepository userRepository;

    // ADMIN only — view all orders
    @GetMapping
    public ResponseEntity<List<Order>> getAll() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // ADMIN only — view single order by id
    @GetMapping("/{id}")
    public ResponseEntity<Order> getById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    // ADMIN + CUSTOMER — view by invoice number
    @GetMapping("/invoice/{inv}")
    public ResponseEntity<Order> getByInvoice(@PathVariable String inv) {
        return ResponseEntity.ok(orderService.getOrderByInvoice(inv));
    }

    // ADMIN only — dashboard stats
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        return ResponseEntity.ok(orderService.getDashboardData());
    }

    // CUSTOMER only — view their own orders
    @GetMapping("/my")
    public ResponseEntity<List<Order>> myOrders(Authentication auth) {
        AppUser user = userRepository.findByUsername(auth.getName()).orElseThrow();
        if (user.getCustomer() == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(orderService.getCustomerOrders(user.getCustomer().getId()));
    }

    // ADMIN + CUSTOMER — place an order (payment is always CASH)
    @PostMapping
    public ResponseEntity<Order> create(@RequestBody Map<String, Object> payload,
                                        Authentication auth) {
        AppUser user = userRepository.findByUsername(auth.getName()).orElseThrow();

        Long customerId = null;
        String customerName = null;
        String customerPhone = null;

        if ("CUSTOMER".equals(user.getRole()) && user.getCustomer() != null) {
            // Logged-in customer — auto-bind their ID, ignore any payload customer fields
            customerId = user.getCustomer().getId();
        } else {
            // Admin billing — use payload fields for customer lookup/creation
            if (payload.get("customerId") != null)
                customerId = Long.valueOf(payload.get("customerId").toString());
            customerName  = (String) payload.get("customerName");
            customerPhone = (String) payload.get("customerPhone");
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) payload.get("items");

        if (items == null || items.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Order order = orderService.createOrder(customerId, customerName, customerPhone, items);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }
}
