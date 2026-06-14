<?php

namespace App\Controllers;

use App\Services\SupplierService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class SupplierController
{
    private SupplierService $service;

    public function __construct()
    {
        $this->service = new SupplierService();
    }

    public function getAll(Request $request, Response $response): Response
    {
        $data = $this->service->getAllSuppliers();
        $response->getBody()->write(json_encode($data));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function getById(Request $request, Response $response, array $args): Response
    {
        try {
            $data = $this->service->getSupplierById((int)$args['id']);
            $response->getBody()->write(json_encode($data));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\RuntimeException $e) {
            $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
            return $response->withHeader('Content-Type', 'application/json')
                            ->withStatus($e->getCode() ?: 404);
        }
    }

    public function create(Request $request, Response $response): Response
    {
        $body = $request->getParsedBody();
        $data = $this->service->createSupplier($body);
        $response->getBody()->write(json_encode($data));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    }

    public function update(Request $request, Response $response, array $args): Response
    {
        try {
            $body = $request->getParsedBody();
            $data = $this->service->updateSupplier((int)$args['id'], $body);
            $response->getBody()->write(json_encode($data));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\RuntimeException $e) {
            $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
            return $response->withHeader('Content-Type', 'application/json')
                            ->withStatus($e->getCode() ?: 404);
        }
    }

    public function delete(Request $request, Response $response, array $args): Response
    {
        try {
            $this->service->deleteSupplier((int)$args['id']);
            return $response->withStatus(204);
        } catch (\RuntimeException $e) {
            $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
            return $response->withHeader('Content-Type', 'application/json')
                            ->withStatus($e->getCode() ?: 404);
        }
    }
}