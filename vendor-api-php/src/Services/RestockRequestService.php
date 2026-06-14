<?php

namespace App\Services;

use App\Models\RestockRequest;
use App\Repositories\RestockRequestRepository;

class RestockRequestService
{
    private RestockRequestRepository $repository;
    private SupplierService $supplierService;

    public function __construct()
    {
        $this->repository      = new RestockRequestRepository();
        $this->supplierService = new SupplierService();
    }

    public function getAllRequests(): array
    {
        return $this->repository->findAll();
    }

    public function getRequestById(int $id): array
    {
        $request = $this->repository->findById($id);
        if (!$request) {
            throw new \RuntimeException("Restock request not found with id: $id", 404);
        }
        return $request;
    }

    public function getRequestsBySupplierId(int $supplierId): array
    {
        $this->supplierService->getSupplierById($supplierId); // validate supplier exists
        return $this->repository->findBySupplierId($supplierId);
    }

    public function createRequest(array $data): array
    {
        $this->supplierService->getSupplierById($data['supplier_id']); // validate supplier exists

        $request = new RestockRequest(
            $data['supplier_id'],
            $data['product_name'],
            $data['quantity_requested'],
            'PENDING',
            $data['notes'] ?? null
        );
        return $this->repository->create($request);
    }

    public function updateStatus(int $id, string $status): array
    {
        $this->getRequestById($id); // throws 404 if not found

        $allowed = ['PENDING', 'APPROVED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!in_array($status, $allowed)) {
            throw new \InvalidArgumentException("Invalid status: $status", 400);
        }

        return $this->repository->updateStatus($id, $status);
    }

    public function deleteRequest(int $id): void
    {
        $this->getRequestById($id);
        $this->repository->delete($id);
    }
}