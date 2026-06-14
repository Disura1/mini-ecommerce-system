package com.disura.store_api.service;

import com.disura.store_api.dto.CreateOrderRequest;
import com.disura.store_api.dto.OrderItemRequest;
import com.disura.store_api.model.*;
import com.disura.store_api.repository.OrderRepository;
import com.disura.store_api.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CustomerService customerService;
    private final ProductService productService;
    private final VendorApiService vendorApiService;

    @Value("${vendor.api.low.stock.threshold}")
    private int lowStockThreshold;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    public List<Order> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    public Order createOrder(CreateOrderRequest request) {
        Customer customer = customerService.getCustomerById(request.getCustomerId());

        Order order = new Order();
        order.setCustomer(customer);
        order.setStatus(Order.OrderStatus.PENDING);

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productService.getProductById(itemRequest.getProductId());

            // Decrement stock
            int newStock = product.getStockQuantity() - itemRequest.getQuantity();
            if (newStock < 0) {
                throw new RuntimeException(
                        "Insufficient stock for product: " + product.getName() +
                                " (available: " + product.getStockQuantity() + ")"
                );
            }
            product.setStockQuantity(newStock);
            productRepository.save(product);

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setQuantity(itemRequest.getQuantity());
            item.setPriceAtPurchase(product.getPrice());

            orderItems.add(item);

            total = total.add(
                    product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()))
            );

            // Trigger restock if stock dropped below threshold
            if (newStock < lowStockThreshold) {
                vendorApiService.triggerRestockRequest(product.getName(), newStock);
            }
        }

        order.setOrderItems(orderItems);
        order.setTotalAmount(total);

        return orderRepository.save(order);
    }

    public Order updateOrderStatus(Long id, Order.OrderStatus status) {
        Order order = getOrderById(id);
        order.setStatus(status);
        return orderRepository.save(order);
    }

    public void deleteOrder(Long id) {
        Order order = getOrderById(id);
        orderRepository.delete(order);
    }
}