package com.disura.store_api.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {
    private Long customerId;
    private List<OrderItemRequest> items;
}