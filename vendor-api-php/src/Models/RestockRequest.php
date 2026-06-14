<?php

namespace App\Models;

class RestockRequest
{
    public ?int $id;
    public int $supplierId;
    public string $productName;
    public int $quantityRequested;
    public string $status;
    public string $requestedAt;
    public ?string $notes;

    public function __construct(
        int $supplierId,
        string $productName,
        int $quantityRequested,
        string $status = 'PENDING',
        ?string $notes = null,
        ?int $id = null,
        string $requestedAt = ''
    ) {
        $this->id                = $id;
        $this->supplierId        = $supplierId;
        $this->productName       = $productName;
        $this->quantityRequested = $quantityRequested;
        $this->status            = $status;
        $this->notes             = $notes;
        $this->requestedAt       = $requestedAt;
    }
}