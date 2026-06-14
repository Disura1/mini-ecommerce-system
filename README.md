# Mini E-Commerce System

A mini e-commerce backend built with **Spring Boot** (Java) and **PHP Slim**, demonstrating microservices architecture, JWT authentication, and cross-service HTTP integration.

## Architecture

- **Store API** (`store-api/`) — Spring Boot 4, Java 21, PostgreSQL
- **Vendor API** (`vendor-api-php/`) — PHP 8.2, Slim 4, PostgreSQL

Each service has its own database. When product stock drops below the threshold after an order, the Store API automatically triggers a restock request on the Vendor API.

## Prerequisites

- Java 21
- Maven
- PHP 8.2
- Composer
- PostgreSQL

## Setup

### 1. Create databases in PostgreSQL
- `mini_ecommerce_store_api_db`
- `mini_ecommerce_vendor_api_db`

### 2. Store API
```bash
cd store-api
```
Copy `.env.example` to your IntelliJ Run Configuration as environment variables:
- `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `VENDOR_API_URL`

Run with IntelliJ or:
```bash
mvn spring-boot:run
```
Runs on `http://localhost:8080`

### 3. Vendor API
```bash
cd vendor-api-php
composer install
cp .env.example .env   # fill in your DB credentials
php -S 127.0.0.1:8081 -t public
```
Runs on `http://127.0.0.1:8081`

## API Endpoints

### Store API (port 8080)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register customer |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/categories` | Bearer | List categories |
| POST | `/api/categories` | Bearer | Create category |
| GET | `/api/products` | Bearer | List products |
| POST | `/api/products` | Bearer | Create product |
| GET | `/api/customers` | Bearer | List customers |
| POST | `/api/orders` | Bearer | Create order |
| PATCH | `/api/orders/{id}/status` | Bearer | Update order status |

### Vendor API (port 8081)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/suppliers` | List suppliers |
| POST | `/api/suppliers` | Create supplier |
| GET | `/api/restock-requests` | List restock requests |
| POST | `/api/restock-requests` | Create restock request |
| PATCH | `/api/restock-requests/{id}/status` | Update status |