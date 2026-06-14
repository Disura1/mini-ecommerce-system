<?php

namespace App\Repositories;

use App\Database\Connection;
use App\Models\Supplier;
use PDO;

class SupplierRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Connection::getInstance();
    }

    public function findAll(): array
    {
        $stmt = $this->db->query('SELECT * FROM suppliers ORDER BY id');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM suppliers WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    public function create(Supplier $supplier): array
    {
        $stmt = $this->db->prepare(
            'INSERT INTO suppliers (name, email, phone, address)
             VALUES (:name, :email, :phone, :address)
             RETURNING *'
        );
        $stmt->execute([
            'name'    => $supplier->name,
            'email'   => $supplier->email,
            'phone'   => $supplier->phone,
            'address' => $supplier->address,
        ]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function update(int $id, Supplier $supplier): ?array
    {
        $stmt = $this->db->prepare(
            'UPDATE suppliers
             SET name = :name, email = :email, phone = :phone, address = :address
             WHERE id = :id
             RETURNING *'
        );
        $stmt->execute([
            'id'      => $id,
            'name'    => $supplier->name,
            'email'   => $supplier->email,
            'phone'   => $supplier->phone,
            'address' => $supplier->address,
        ]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ?: null;
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM suppliers WHERE id = :id');
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() > 0;
    }
}