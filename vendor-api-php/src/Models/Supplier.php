<?php

namespace App\Models;

class Supplier
{
    public ?int $id;
    public string $name;
    public string $email;
    public string $phone;
    public string $address;
    public string $createdAt;

    public function __construct(
        string $name,
        string $email,
        string $phone,
        string $address,
        ?int $id = null,
        string $createdAt = ''
    ) {
        $this->id        = $id;
        $this->name      = $name;
        $this->email     = $email;
        $this->phone     = $phone;
        $this->address   = $address;
        $this->createdAt = $createdAt;
    }
}