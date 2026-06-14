<?php

use App\Controllers\RestockRequestController;
use App\Controllers\SupplierController;
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';

$app = AppFactory::create();

$app->addBodyParsingMiddleware();
$app->addErrorMiddleware(true, true, true);

// Supplier routes
$app->get('/api/suppliers',             [SupplierController::class, 'getAll']);
$app->get('/api/suppliers/{id}',        [SupplierController::class, 'getById']);
$app->post('/api/suppliers',            [SupplierController::class, 'create']);
$app->put('/api/suppliers/{id}',        [SupplierController::class, 'update']);
$app->delete('/api/suppliers/{id}',     [SupplierController::class, 'delete']);

// Restock request routes
$app->get('/api/restock-requests',                          [RestockRequestController::class, 'getAll']);
$app->get('/api/restock-requests/{id}',                     [RestockRequestController::class, 'getById']);
$app->get('/api/restock-requests/supplier/{supplierId}',    [RestockRequestController::class, 'getBySupplier']);
$app->post('/api/restock-requests',                         [RestockRequestController::class, 'create']);
$app->patch('/api/restock-requests/{id}/status',            [RestockRequestController::class, 'updateStatus']);
$app->delete('/api/restock-requests/{id}',                  [RestockRequestController::class, 'delete']);

$app->run();