# Finance Data Processing & Access Control Backend

A RESTful API backend for a finance dashboard system built with **Node.js** and **Express.js**. The system supports user management, financial record CRUD, role-based access control (RBAC), and dashboard analytics — all powered by an in-memory data store.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Seed Data](#seed-data)
- [API Documentation](#api-documentation)
  - [Auth](#auth-endpoints)
  - [Users](#user-endpoints-admin-only)
  - [Records](#financial-record-endpoints)
  - [Dashboard](#dashboard-endpoints)
- [Access Control Matrix](#access-control-matrix)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Assumptions & Tradeoffs](#assumptions--tradeoffs)

---

## Features

| Area                    | Details                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| **Authentication**      | JWT-based register/login/logout with token blacklisting                                      |
| **RBAC**                | Three roles — Viewer, Analyst, Admin — enforced via middleware                               |
| **Financial Records**   | Full CRUD with filtering (type, category, date range), search, sort, pagination, soft-delete |
| **Dashboard Analytics** | Total income/expenses/net, category breakdown, monthly & weekly trends, recent activity      |
| **Validation**          | Joi schemas on all request bodies and query parameters                                       |
| **Error Handling**      | Centralized error handler with consistent JSON responses and appropriate HTTP status codes   |
| **Rate Limiting**       | Auth endpoints rate-limited (15 req / 15 min per IP)                                         |
| **Security**            | Helmet headers, CORS, JSON body size limit, bcrypt password hashing                          |
| **Testing**             | Jest + Supertest integration test suite (35+ tests)                                          |

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Auth:** JSON Web Tokens (jsonwebtoken) + bcryptjs
- **Validation:** Joi
- **Security:** Helmet, CORS, express-rate-limit
- **Testing:** Jest, Supertest
- **Data Store:** In-memory (JavaScript arrays/objects — no database required)

---

## Project Structure

```
Assessment-backend/
├── src/
│   ├── config/
│   │   └── index.js            # App configuration & constants
│   ├── data/
│   │   └── store.js            # In-memory data store with seed data
│   ├── middleware/
│   │   ├── authenticate.js     # JWT verification middleware
│   │   ├── authorize.js        # Role-based access control middleware
│   │   ├── validate.js         # Joi validation middleware factory
│   │   └── errorHandler.js     # Global error handling middleware
│   ├── models/
│   │   └── schemas.js          # Joi validation schemas
│   ├── routes/
│   │   ├── authRoutes.js       # Auth endpoints
│   │   ├── userRoutes.js       # User management endpoints
│   │   ├── recordRoutes.js     # Financial record endpoints
│   │   └── dashboardRoutes.js  # Dashboard & analytics endpoints
│   ├── services/
│   │   ├── authService.js      # Auth business logic
│   │   ├── userService.js      # User business logic
│   │   ├── recordService.js    # Record business logic
│   │   └── dashboardService.js # Analytics & aggregation logic
│   ├── utils/
│   │   ├── AppError.js         # Custom error class
│   │   └── response.js         # Standardised response helpers
│   └── app.js                  # Express app setup & server start
├── tests/
│   └── api.test.js             # Integration tests
├── .env.example                # Environment variable template
├── .gitignore
├── package.json
└── README.md
```

### Architecture

```
Client Request
    │
    ▼
Express Middleware (Helmet, CORS, JSON Parser, Morgan)
    │
    ▼
Route Middleware (Authenticate → Authorize → Validate)
    │
    ▼
Route Handler
    │
    ▼
Service Layer (Business Logic)
    │
    ▼
In-Memory Data Store
    │
    ▼
Response Helper → JSON Response
```

---

## Getting Started

### Prerequisites

- **Node.js** v16+ installed
- **npm** (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd Assessment-backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env if you want to change defaults

# 4. Start the development server
npm run dev

# OR start without auto-reload
npm start
```

The server starts on `http://localhost:3000` by default.

---

## Seed Data

The app ships with pre-loaded mock data so you can test immediately.

### Users

| Email                  | Password       | Role              |
| ---------------------- | -------------- | ----------------- |
| `admin@finance.com`    | `Admin@123`    | Admin             |
| `analyst@finance.com`  | `Analyst@123`  | Analyst           |
| `viewer@finance.com`   | `Viewer@123`   | Viewer            |
| `inactive@finance.com` | `Inactive@123` | Viewer (inactive) |

### Records

15 financial records spanning January–March 2025 across categories: salary, freelance, investment, rent, utilities, food, transport, entertainment, healthcare.

---

## API Documentation

**Base URL:** `http://localhost:3000/api`

All protected endpoints require the header:

```
Authorization: Bearer <token>
```

### Health Check

| Method | Endpoint      | Auth | Description         |
| ------ | ------------- | ---- | ------------------- |
| GET    | `/api/health` | No   | Server health check |

---

### Auth Endpoints

| Method | Endpoint             | Auth | Description              |
| ------ | -------------------- | ---- | ------------------------ |
| POST   | `/api/auth/register` | No   | Register a new user      |
| POST   | `/api/auth/login`    | No   | Login and receive JWT    |
| POST   | `/api/auth/logout`   | Yes  | Invalidate current token |
| GET    | `/api/auth/me`       | Yes  | Get current user profile |

#### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "Secret@123",
    "role": "viewer"
  }'
```

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@finance.com",
    "password": "Admin@123"
  }'
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "usr_001",
      "name": "Admin User",
      "email": "admin@finance.com",
      "role": "admin",
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### User Endpoints (Admin Only)

| Method | Endpoint         | Description                        |
| ------ | ---------------- | ---------------------------------- |
| GET    | `/api/users`     | List users (paginated, filterable) |
| GET    | `/api/users/:id` | Get user by ID                     |
| PATCH  | `/api/users/:id` | Update user (name, role, status)   |
| DELETE | `/api/users/:id` | Soft-delete user                   |

**Query Parameters for list:**

- `page` (default: 1)
- `limit` (default: 10, max: 100)
- `role` — filter by role (`viewer`, `analyst`, `admin`)
- `status` — filter by status (`active`, `inactive`)
- `search` — search by name or email

```bash
curl http://localhost:3000/api/users?role=viewer&status=active \
  -H "Authorization: Bearer <admin_token>"
```

---

### Financial Record Endpoints

| Method | Endpoint           | Roles | Description                        |
| ------ | ------------------ | ----- | ---------------------------------- |
| POST   | `/api/records`     | Admin | Create record                      |
| GET    | `/api/records`     | All   | List records (filtered, paginated) |
| GET    | `/api/records/:id` | All   | Get single record                  |
| PUT    | `/api/records/:id` | Admin | Update record                      |
| DELETE | `/api/records/:id` | Admin | Soft-delete record                 |

**Query Parameters for list:**

- `page`, `limit` — pagination
- `type` — `income` or `expense`
- `category` — e.g. `salary`, `rent`, `food`
- `startDate`, `endDate` — date range (ISO format)
- `search` — search description or category
- `sortBy` — `date`, `amount`, or `createdAt`
- `order` — `asc` or `desc`

```bash
# Create a record
curl -X POST http://localhost:3000/api/records \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2500,
    "type": "income",
    "category": "freelance",
    "date": "2025-03-20",
    "description": "Consulting payment"
  }'

# List with filters
curl "http://localhost:3000/api/records?type=expense&category=rent&sortBy=amount&order=desc" \
  -H "Authorization: Bearer <token>"

# Date range query
curl "http://localhost:3000/api/records?startDate=2025-02-01&endDate=2025-02-28" \
  -H "Authorization: Bearer <token>"
```

---

### Dashboard Endpoints

| Method | Endpoint                          | Roles          | Description                         |
| ------ | --------------------------------- | -------------- | ----------------------------------- |
| GET    | `/api/dashboard/summary`          | All            | Total income, expenses, net balance |
| GET    | `/api/dashboard/category-summary` | All            | Category-wise breakdown             |
| GET    | `/api/dashboard/trends`           | Analyst, Admin | Monthly income/expense trends       |
| GET    | `/api/dashboard/trends/weekly`    | Analyst, Admin | Weekly income/expense trends        |
| GET    | `/api/dashboard/recent-activity`  | All            | Latest records (default 10)         |

**Example — Summary Response:**

```json
{
  "status": "success",
  "data": {
    "totalIncome": 22300,
    "totalExpenses": 4430,
    "netBalance": 17870,
    "totalRecords": 15,
    "incomeCount": 7,
    "expenseCount": 8
  }
}
```

**Example — Monthly Trends Response:**

```json
{
  "status": "success",
  "data": [
    { "month": "2025-01", "income": 5800, "expense": 1450, "net": 4350, "count": 4 },
    { "month": "2025-02", "income": 7000, "expense": 1550, "net": 5450, "count": 4 },
    { "month": "2025-03", "income": 9500, "expense": 2430, "net": 7070, "count": 7 }
  ]
}
```

---

## Access Control Matrix

| Action                       | Viewer | Analyst | Admin |
| ---------------------------- | ------ | ------- | ----- |
| Register / Login             | ✅     | ✅      | ✅    |
| View own profile             | ✅     | ✅      | ✅    |
| View records                 | ✅     | ✅      | ✅    |
| Filter / search records      | ✅     | ✅      | ✅    |
| View dashboard summary       | ✅     | ✅      | ✅    |
| View category summary        | ✅     | ✅      | ✅    |
| View recent activity         | ✅     | ✅      | ✅    |
| Access monthly/weekly trends | ❌     | ✅      | ✅    |
| Create records               | ❌     | ❌      | ✅    |
| Update records               | ❌     | ❌      | ✅    |
| Delete records               | ❌     | ❌      | ✅    |
| Manage users                 | ❌     | ❌      | ✅    |

---

## Error Handling

All errors follow a consistent JSON format:

```json
{
  "status": "fail",
  "message": "Descriptive error message"
}
```

| Status Code | Meaning                                     |
| ----------- | ------------------------------------------- |
| 400         | Validation error / bad request              |
| 401         | Authentication required or invalid token    |
| 403         | Insufficient permissions / inactive account |
| 404         | Resource not found                          |
| 409         | Conflict (e.g. duplicate email)             |
| 429         | Too many requests (rate limit)              |
| 500         | Internal server error                       |

---

## Testing

```bash
# Run the full test suite
npm test
```

The test suite includes **35+ integration tests** covering:

- ✅ Auth flows (register, login, logout, token invalidation)
- ✅ RBAC enforcement (viewer/analyst/admin restrictions)
- ✅ CRUD operations on records
- ✅ Filtering, search, pagination, sorting
- ✅ Dashboard analytics endpoints
- ✅ Edge cases (duplicate emails, inactive users, soft-delete, 404s, validation errors)

---

## Assumptions & Tradeoffs

| Decision                      | Rationale                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| **In-memory data store**      | No database setup required; data resets on restart. Clearly documented as per assignment.        |
| **Soft deletes**              | Records and users are flagged with `deletedAt` instead of being removed, preserving audit trail. |
| **JWT for auth**              | Stateless, simple to implement, includes role in payload for fast RBAC checks.                   |
| **Token blacklist in-memory** | Resets on restart; suitable for assessment scope. Production would use Redis.                    |
| **Joi for validation**        | Declarative, composable schemas with excellent error messages.                                   |
| **Layered architecture**      | Routes → Services → Data Store keeps concerns separated and code testable.                       |
| **Role in JWT payload**       | Avoids an extra DB lookup on every request; role changes require re-login.                       |
| **All users can register**    | In production, admin-only user creation would be more appropriate.                               |
| **No file upload**            | Financial records are text-based entries only.                                                   |

---

## License

ISC
