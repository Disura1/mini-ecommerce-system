package com.disura.store_api.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Slf4j
@Service
public class VendorApiService {

    @Value("${vendor.api.url}")
    private String vendorApiUrl;

    @Value("${vendor.api.default.supplier.id}")
    private int defaultSupplierId;

    public void triggerRestockRequest(String productName, int currentStock) {
        try {
            String body = String.format(
                    "{\"supplier_id\": %d, \"product_name\": \"%s\", \"quantity_requested\": 100, " +
                            "\"notes\": \"Auto-triggered: stock dropped to %d units\"}",
                    defaultSupplierId, productName, currentStock
            );

            HttpClient client = HttpClient.newHttpClient();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(vendorApiUrl + "/api/restock-requests"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = client.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() == 201) {
                log.info("Restock request created for '{}' (stock: {})", productName, currentStock);
            } else {
                log.warn("Vendor API returned {} for product '{}': {}",
                        response.statusCode(), productName, response.body());
            }

        } catch (Exception e) {
            log.error("Failed to trigger restock for '{}': {} - {}",
                    productName, e.getClass().getSimpleName(), e.getMessage());
        }
    }
}