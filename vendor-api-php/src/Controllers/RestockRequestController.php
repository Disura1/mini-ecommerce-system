<?php

namespace App\Controllers;

use App\Services\RestockRequestService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class RestockRequestController
{
    private RestockRequestService $service;

    public function __construct()
    {
        $this->service = new RestockRequestService();
    }

    public function getAll(Request $request, Response $response): Response
    {
        $data = $this->service->getAllRequests();
        $response->getBody()->write(json_encode($data));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function getById(Request $request, Response $response, array $args): Response
    {
        try {
            $data = $this->service->getRequestById((int)$args['id']);
            $response->getBody()->write(json_encode($data));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\RuntimeException $e) {
            $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
            return $response->withHeader('Content-Type', 'application/json')
                            ->withStatus($e->getCode() ?: 404);
        }
    }

    public function getBySupplier(Request $request, Response $response, array $args): Response
    {
        try {
            $data = $this->service->getRequestsBySupplierId((int)$args['supplierId']);
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
        try {
            $body = $request->getParsedBody();
            $data = $this->service->createRequest($body);
            $response->getBody()->write(json_encode($data));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        } catch (\RuntimeException $e) {
            $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
            return $response->withHeader('Content-Type', 'application/json')
                            ->withStatus($e->getCode() ?: 400);
        }
    }

    public function updateStatus(Request $request, Response $response, array $args): Response
    {
        try {
            $body   = $request->getParsedBody();
            $status = strtoupper($body['status'] ?? '');
            $data   = $this->service->updateStatus((int)$args['id'], $status);
            $response->getBody()->write(json_encode($data));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\RuntimeException|\InvalidArgumentException $e) {
            $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
            return $response->withHeader('Content-Type', 'application/json')
                            ->withStatus($e->getCode() ?: 400);
        }
    }

    public function delete(Request $request, Response $response, array $args): Response
    {
        try {
            $this->service->deleteRequest((int)$args['id']);
            return $response->withStatus(204);
        } catch (\RuntimeException $e) {
            $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
            return $response->withHeader('Content-Type', 'application/json')
                            ->withStatus($e->getCode() ?: 404);
        }
    }
}