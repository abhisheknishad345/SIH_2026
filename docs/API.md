# TechConnect API Reference

This document reflects the Express route registrations currently present in `Backend/src/server.js` and `Backend/src/routes/`.

## Base URL

Local default:

```text
http://localhost:5000
```

The backend uses the `PORT` environment variable (default `5000`).

## Authentication

Protected routes use the JWT stored in the `token` cookie. Send requests with credentials enabled. The frontend Axios client is configured with `withCredentials: true`.

Role names used by the API:

- `customer`
- `worker`
- `cooperative_admin`
- `super_admin`

In the tables below, **Public** means no authentication middleware is attached to the route. **Authenticated** means a valid login cookie is required. Role-specific routes additionally require the listed role.

## General

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Backend health/root response |

## Authentication — `/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/signup` | Public | Register a user and send email verification OTP |
| POST | `/auth/verify-email` | Public | Verify email using OTP; sets login cookie |
| POST | `/auth/login` | Public | Log in; sets login cookie |
| POST | `/auth/resend-otp` | Public | Resend email verification OTP |
| POST | `/auth/logout` | Public | Clear the login cookie |
| POST | `/auth/forgot-password` | Public | Request password-reset OTP |
| POST | `/auth/reset-password` | Public | Reset password using email and OTP |
| GET | `/auth/protected` | Authenticated | Return current authenticated user |
| GET | `/auth/customer-test` | Customer | Customer-role middleware test endpoint |
| GET | `/auth/worker-test` | Worker | Worker-role middleware test endpoint |

Common request fields:
- Signup: `fullName`, `email`, `password`, `role`.
- Verify email: `email`, `otp`.
- Login: `email`, `password`.
- Resend OTP / forgot password: `email`.
- Reset password: `email`, `otp`, `newPassword`.

## Workers — `/workers`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/workers/profile` | Worker | Create worker profile |
| GET | `/workers/profile` | Worker | Get own worker profile |
| PUT | `/workers/availability` | Worker | Update general availability |
| PUT | `/workers/editprofile` | Worker | Update worker profile |
| PUT | `/workers/profile/resubmit` | Authenticated | Resubmit a rejected worker profile |
| GET | `/workers/nearby` | Customer | Find nearby workers |
| GET | `/workers/pending` | Cooperative admin | List pending workers |
| PUT | `/workers/:workerId/verify` | Cooperative admin | Approve/verify a worker |
| PUT | `/workers/:workerId/reject` | Cooperative admin | Reject a worker |
| PATCH | `/workers/working-hours` | Worker | Update weekly working hours |
| GET | `/workers/working-hours` | Worker | Get weekly working hours |
| GET | `/workers/approved` | Cooperative admin | List approved workers |
| GET | `/workers/rejected` | Cooperative admin | List rejected workers |

Query parameters for `GET /workers/nearby`:
- `maxDistance` — required positive number.
- `skill` — optional skill filter.
- `category` — optional category filter.

Worker profile creation reads fields including `cooperativeId`, `category`, `skills`, `certifications`, `location`, and `workingHours`. Availability update accepts `isAvailable`. Schedule update accepts `workingHours`.

## Customers — `/customers`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/customers/profile` | Customer | Create customer profile |
| GET | `/customers/profile` | Customer | Get own customer profile |
| PUT | `/customers/profile` | Customer | Update own customer profile |

Profile fields include `phone`, `address`, and `location`.

## Bookings — `/bookings`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/bookings` | Customer | Create a service booking |
| GET | `/bookings/worker` | Worker | Get worker bookings |
| PUT | `/bookings/:bookingId/status` | Worker | Update booking status |
| PUT | `/bookings/:bookingId/cancel` | Customer | Cancel a booking |
| PUT | `/bookings/:bookingId/service-done` | Worker | Mark service as done and request customer payment |
| PUT | `/bookings/:bookingId/pay` | Customer | Confirm simulated demo payment (no real money transfer) |
| PUT | `/bookings/:bookingId/complete` | Worker | Complete a booking after demo payment is confirmed |
| GET | `/bookings/customer` | Customer | Get customer bookings |
| GET | `/bookings/worker/dashboard` | Worker | Get worker dashboard statistics |
| GET | `/bookings/worker/earnings` | Worker | Get worker earnings |

Create booking request fields:
```json
{
  "workerId": "WORKER_USER_ID",
  "serviceId": "SERVICE_ID",
  "scheduledAt": "2026-11-20T10:00:00+05:30",
  "duration": 60,
  "address": "Service address",
  "location": {},
  "skillName": "Example skill",
  "quantity": 1
}
```

The exact accepted `location` structure is defined by the backend booking validator/model. `duration` is expressed in minutes.

Worker booking query parameters:
- `status` — optional status filter (`pending`, `accepted` (legacy), `in_progress`, `rejected`, `cancelled`, `completed`).
- `upcoming` — optional boolean string; use `true` for upcoming bookings.
- `page` — optional page number (default `1`).
- `limit` — optional page size (default `10`, maximum `50`).

Status update request body:
```json
{ "status": "accepted" }
```

The generic status endpoint accepts only `{ "status": "accepted" }` or `{ "status": "rejected" }`. Accepting a booking changes its status to `in_progress` and its `paymentStatus` to `awaiting`.

Worker service/payment flow:
1. Worker calls `PUT /bookings/:bookingId/service-done` after finishing the service.
2. Customer calls `PUT /bookings/:bookingId/pay` to confirm the demo payment. No gateway or real money transfer is involved. The server uses the booking price stored in the database; the client does not submit an amount.
3. Worker calls `PUT /bookings/:bookingId/complete`; the server allows completion only after service completion and `paymentStatus: paid`.

Booking payment fields: `paymentStatus` (`not_due`, `awaiting`, `paid`), `paymentMethod` (`demo` when confirmed), `serviceCompletedAt`, and `paidAt`.

## Services — `/services`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/services/create` | Cooperative admin | Create a service |
| GET | `/services` | Customer, Worker | List active services |
| GET | `/services/categories` | Worker | Get service categories |
| GET | `/services/:serviceId/workers` | Customer | Find workers for a service |

Create service fields include `name`, `description`, `category`, `price`, and `priceType`.

List active services query parameters:
- `cooperativeId` — optional cooperative filter.
- `category` — optional category filter.

Categories endpoint accepts optional `cooperativeId`.

## Cooperatives — `/cooperatives`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/cooperatives` | Super admin | Create a cooperative |
| GET | `/cooperatives` | Public | List cooperatives |
| GET | `/cooperatives/:id` | Public | Get cooperative by ID |

## Cooperative Administrators — `/cooperative-admins`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/cooperative-admins` | Super admin | Create cooperative admin |
| POST | `/cooperative-admins/bootstrap` | Admin setup middleware | Bootstrap cooperative admin |
| GET | `/cooperative-admins/dashboard/stats` | Cooperative admin | Get cooperative dashboard statistics |

Cooperative admin creation fields include `fullName`, `email`, and `cooperativeId`. Bootstrap creation additionally accepts `password`.

## Super Admin Bootstrap — `/super-admin/bootstrap`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/super-admin/bootstrap` | Admin setup middleware | Create the initial super admin |

Request fields: `fullName`, `email`, and `password`.

This is a setup endpoint. Keep the bootstrap middleware secret/configuration private and do not expose it in public deployments.

## Community Services — `/community-services`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/community-services` | Cooperative admin | Create a community service opportunity |
| GET | `/community-services/available` | Worker | List available community services |

Create request fields include `cooperativeId`, `title`, `description`, `category`, `skillName`, `scheduledAt`, `duration`, `location`, and `address`.

## Ratings — `/ratings`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/ratings` | Customer | Submit a rating/review |
| GET | `/ratings/worker/:workerId` | Public | Get ratings for a worker |

Create rating fields: `bookingId`, `rating`, and `review`.

## Request and Response Conventions

- Send JSON request bodies with `Content-Type: application/json`.
- For protected endpoints, include cookies in the request. Browser clients must use credentialed requests.
- Successful create operations generally return HTTP `201`; successful reads and updates generally return HTTP `200`.
- Validation and service errors commonly return JSON containing a `message` field.
- The exact response shape may vary by endpoint and is defined by its controller/service implementation.

## Keeping This Document Updated

Whenever a route is added, removed, or changed in `Backend/src/routes/`, update this API reference in the same pull request. This document is a route-level reference; request validation rules remain the source of truth in `Backend/src/validator/`.
