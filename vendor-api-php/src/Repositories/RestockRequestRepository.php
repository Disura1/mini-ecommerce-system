<?php

namespace App\Repositories;

use App\Database\Connection;
use App\Models\RestockRequest;
use PDO;

class RestockRequestRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Connection::getInstance();
    }

    public function findAll(): array
    {
        $stmt = $this->db->query(
            'SELECT rr.*, s.name as supplier_name
             FROM restock_requests rr
             JOIN suppliers s ON rr.supplier_id = s.id
             ORDER BY rr.id'
        );
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT rr.*, s.name as supplier_name
             FROM restock_requests rr
             JOIN suppliers s ON rr.supplier_id = s.id
             WHERE rr.id = :id'
        );
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    public function findBySupplierId(int $supplierId): array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM restock_requests WHERE supplier_id = :supplier_id ORDER BY id'
        );
        $stmt->execute(['supplier_id' => $supplierId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create(RestockRequest $request): array
    {
        $stmt = $this->db->prepare(
            'INSERT INTO restock_requests (supplier_id, product_name, quantity_requested, status, notes)
             VALUES (:supplier_id, :product_name, :quantity_requested, :status, :notes)
             RETURNING *'
        );
        $stmt->execute([
            'supplier_id'        => $request->supplierId,
            'product_name'       => $request->productName,
            'quantity_requested' => $request->quantityRequested,
            'status'             => $request->status,
            'notes'              => $request->notes,
        ]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateStatus(int $id, string $status): ?array
    {
        $stmt = $this->db->prepare(
            'UPDATE restock_requests SET status = :status WHERE id = :id RETURNING *'
        );
        $stmt->execute(['id' => $id, 'status' => $status]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM restock_requests WHERE id = :id');
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() > 0;
    }
}