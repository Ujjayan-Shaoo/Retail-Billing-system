package com.retail.billing.service;

import com.retail.billing.entity.Product;
import com.retail.billing.exception.ResourceNotFoundException;
import com.retail.billing.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Value("${app.low-stock-threshold:10}")
    private int lowStockThreshold;

    public List<Product> getAllProducts() { return productRepository.findAll(); }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }

    public List<Product> searchProducts(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    public Product createProduct(Product product) { return productRepository.save(product); }

    public Product updateProduct(Long id, Product updated) {
        Product p = getProductById(id);
        p.setName(updated.getName());
        p.setDescription(updated.getDescription());
        p.setCategory(updated.getCategory());
        p.setPrice(updated.getPrice());
        p.setStock(updated.getStock());
        p.setUnit(updated.getUnit());
        return productRepository.save(p);
    }

    public void deleteProduct(Long id) { productRepository.delete(getProductById(id)); }

    public List<Product> getLowStockProducts() { return productRepository.findLowStockProducts(lowStockThreshold); }

    public int getLowStockThreshold() { return lowStockThreshold; }
}
