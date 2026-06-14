<?php

namespace App\Services;

use App\Models\Supplier;
use App\Repositories\SupplierRepository;

class SupplierService
{
    private SupplierRepository $repository;

    public function __construct()
    {
        $this->repository = new SupplierRepository();
    }

    public function getAllSuppliers(): array
    {
        return $this->repository->findAll();
    }

    public function getSupplierById(int $id): ?array
    {
        $supplier = $this->repository->findById($id);
        if (!$supplier) {
            throw new \RuntimeException("Supplier not found with id: $id", 404);
        }
        return $supplier;
    }

    public function createSupplier(array $data): array
    {
        $supplier = new Supplier(
            $data['name'],
            $data['email'],
            $data['phone'],
            $data['address']
        );
        return $this->repository->create($supplier);
    }

    public function updateSupplier(int $id, array $data): array
    {
        $this->getSupplierById($id); // throws 404 if not found
        $supplier = new Supplier(
            $data['name'],
            $data['email'],
            $data['phone'],
            $data['address']
        );
        return $this->repository->update($id, $supplier);
    }

    public function deleteSupplier(int $id): void
    {
        $this->getSupplierById($id); // throws 404 if not found
        $this->repository->delete($id);
    }
}