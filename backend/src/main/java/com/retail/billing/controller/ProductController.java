package com.retail.billing.controller;

import com.retail.billing.entity.Product;
import com.retail.billing.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAll() { return ResponseEntity.ok(productService.getAllProducts()); }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable Long id) { return ResponseEntity.ok(productService.getProductById(id)); }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> search(@RequestParam String name) { return ResponseEntity.ok(productService.searchProducts(name)); }

    @GetMapping("/low-stock")
    public ResponseEntity<Map<String, Object>> lowStock() {
        List<Product> products = productService.getLowStockProducts();
        return ResponseEntity.ok(Map.of("threshold", productService.getLowStockThreshold(), "products", products, "count", products.size()));
    }

    @PostMapping
    public ResponseEntity<Product> create(@Valid @RequestBody Product product) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @Valid @RequestBody Product product) {
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }
}
