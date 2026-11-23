# TechConnect API Reference

This reference is checked against the current implementation on the `main` branch. HTTP route registration is defined in `Backend/src/server.js` and `Backend/src/routes/`; controllers, validators, services, models, and middleware define the request, response, and access behavior described below.

## Base URL

Local default:

    http://localhost:5500

The server listens on the `PORT` environment variable when supplied; otherwise the default is `5500`.

## Request format and authentication

- Send JSON request bodies with `Content-Type: application/json`.
- Protected REST routes accept either the JWT in the `token` cookie or an `Authorization: Bearer <JWT>` header.
- Login and successful email verification set the `token` cookie. The cookie expiry is 12 hours.
- Browser clients using the cookie must send credentialed requests (for example, Axios `withCredentials: true`).
- The authentication middleware rejects missing, invalid, expired, deleted-user, or unverified-user credentials with HTTP `401`.
- Role middleware returns HTTP `403` when the authenticated account does not have an allowed role.
- `Public` means the route has no authentication middleware. `Authenticated` means a valid, email-verified account is required, without an additional route-level role check.

Roles used by the implementation:

- `customer`
- `worker`
- `cooperative_admin`
- `super_admin`

The two bootstrap routes use the `x-admin-setup-key` request header instead of JWT authentication. A missing header returns `401`; an invalid header returns `403`. Never put the header's configured value in this document or in public examples.

Responses are not wrapped in one global format. The response envelope and status code below are the ones returned by each controller. Most controller-caught validation and service errors use JSON `{ "message": "..." }`, but some routes use `success` fields or other response properties as documented.

## General

| Method | Endpoint | Access | Success response | Errors / notes |
|---|---|---|---|---|
| GET | `/` | Public | 200: `{ message }` | Backend health/root response. |

## Authentication — `/auth`

| Method | Endpoint | Access | Request | Success response | Errors / behavior |
|---|---|---|---|---|---|
| POST | `/auth/signup` | Public | Body: `fullName`, `email`, `password`, `role` | 201: `{ message, userId }` | 400: `{ message }`. Role must be `customer` or `worker`; name length 3–50; password 8–128 characters with lowercase, uppercase, number, and symbol. Sends email verification OTP. |
| POST | `/auth/verify-email` | Public | Body: `email`, `otp` | 200: `{ message, user }`; sets the `token` cookie | 400: `{ message }`. OTP expires after 10 minutes; verification allows at most five incorrect attempts before a new OTP is required. |
| POST | `/auth/login` | Public | Body: `email`, `password` | 200: `{ message, user }`; sets the `token` cookie | 401: `{ message }`, including login validation and credential failures. Email must be verified. |
| POST | `/auth/resend-otp` | Public | Body: `email` | 200: `{ message }` | 400: `{ message }`. Email is required; resend cooldown is 120 seconds. |
| POST | `/auth/logout` | Public | No body | 200: `{ message }` | 500: `{ message }`. Expires the `token` cookie. |
| POST | `/auth/forgot-password` | Public | Body: `email` | 200: `{ message }` | 400: `{ message }`. Account email must be verified; reset OTP expires after 10 minutes and requests have a 120-second cooldown. |
| POST | `/auth/reset-password` | Public | Body: `email`, `otp`, `newPassword` | 200: `{ message }` | 400: `{ message }`. New password uses the same strong-password requirements; reset OTP allows at most five incorrect attempts. |
| GET | `/auth/protected` | Authenticated | No body | 200: `{ message, user }` | 401 on authentication failure. |
| GET | `/auth/customer-test` | Customer | No body | 200: `{ message }` | 401 unauthenticated; 403 wrong role. |
| GET | `/auth/worker-test` | Worker | No body | 200: `{ message }` | 401 unauthenticated; 403 wrong role. |

Signup and reset-password password requirements are enforced by the auth validator/service. Email and OTP fields for verification/reset are checked by the service; the controllers do not define a separate schema validator for those routes.

## Workers — `/workers`

| Method | Endpoint | Access | Request / query | Success response | Errors / behavior |
|---|---|---|---|---|---|
| POST | `/workers/profile` | Worker | Body described below | 201: `{ message, worker }` | 400: `{ message }`. Cooperative must exist and be active; profile must not already exist; selected services must be active and belong to the selected cooperative/category. |
| GET | `/workers/profile` | Worker | No body | 200: `{ worker }` | 404: `{ message }` when no profile exists. |
| PUT | `/workers/availability` | Worker | Body: `{ "isAvailable": boolean }` | 200: `{ message, isAvailable }` | 400: `{ message }`. Only an approved, verified worker can change availability. |
| PUT | `/workers/editprofile` | Worker | Body may include `category`, `shopName`, `shopAddress`, `skills`, `certifications`, `workingHours`, `location` | 200: `{ message, worker }` | 400: `{ message }`. Only the listed profile fields are applied. Use the dedicated availability endpoint to change `isAvailable`. |
| PUT | `/workers/profile/resubmit` | Authenticated (no route-level role guard) | No body | 200: `{ message, worker }` | 400: `{ message }`. The authenticated user's profile must exist and currently be rejected; resubmission resets it to pending. |
| GET | `/workers/nearby` | Customer | Query: required positive `maxDistance` in meters; optional `skill`, `category` | 200: `{ workers }` | 400: `{ message }`. Uses the customer's saved GeoJSON location; a customer profile/location is required. Results include worker/user IDs, name, category, shop details, skills, rating summary, and distance. |
| GET | `/workers/pending` | Cooperative admin | No body | 200: `{ message, workers }` | 400: `{ message }`. Scoped to the admin's active cooperative-admin profile/cooperative. |
| PUT | `/workers/:workerId/verify` | Cooperative admin | Path `workerId` is the Worker document ID; no body | 200: `{ message, worker }` | 400: `{ message }`. Worker must belong to the admin's cooperative and must not already be approved/rejected. |
| PUT | `/workers/:workerId/reject` | Cooperative admin | Path `workerId` is the Worker document ID. Body: `{ "reason": "..." }` | 200: `{ message, worker }` | 400: `{ message }`. Rejection reason is required and limited to 1,000 characters. |
| PATCH | `/workers/working-hours` | Worker | Body: `{ "workingHours": [...] }` | 200: `{ success, message, workingHours }` | 400: `{ success: false, message }`. Each entry uses `day`, `isWorking`, `startTime`, and `endTime`. Days are Monday–Sunday; duplicate days are rejected. When working, times must be 24-hour `HH:mm` strings and start must be before end. |
| GET | `/workers/working-hours` | Worker | No body | 200: `{ success, isAvailable, workingHours }` | 404: `{ success: false, message }` when no worker profile exists. |
| GET | `/workers/approved` | Cooperative admin | No body | 200: `{ message, workers }` | 400: `{ message }`. Scoped to the admin's cooperative. |
| GET | `/workers/rejected` | Cooperative admin | No body | 200: `{ message, workers }` | 400: `{ message }`. Scoped to the admin's cooperative. |

### Worker profile request fields

The profile creation body accepts:

- `cooperativeId`: existing cooperative ID.
- `category`: required non-empty category.
- `skills`: required non-empty array. Each skill contains `serviceId`, non-negative integer `experience`, `priceType`, and `price` for all price types except `negotiable`.
- `priceType`: one of `fixed`, `per_hour`, `per_day`, or `negotiable`. A non-negotiable price must be a positive number. Negotiable skills must not submit a fixed price.
- `certifications`: optional array.
- `location`: GeoJSON Point with numeric coordinates in [longitude, latitude] order; longitude range -180 to 180 and latitude range -90 to 90.
- `workingHours`: array of day entries. The profile-creation validator checks the day names; the model supplies defaults for omitted schedule fields.
- `shopName`: optional string, maximum 100 characters.
- `shopAddress`: optional string, maximum 300 characters.

The service name stored in each worker skill is derived from the selected service record; clients submit `serviceId`, not a trusted skill name. The profile-update route accepts the profile fields listed in its table, but schedule-specific validation is strongest on the dedicated PATCH working-hours route.

## Customers — `/customers`

| Method | Endpoint | Access | Request | Success response | Errors / behavior |
|---|---|---|---|---|---|
| POST | `/customers/profile` | Customer | Optional body fields: `phone`, `address`, `location` | 201: `{ message, customer }` | 400: `{ message }`. A profile may be created only once per user. |
| GET | `/customers/profile` | Customer | No body | 200: `{ customer }` | 404: `{ message }` when the profile is missing. |
| PUT | `/customers/profile` | Customer | Body may include `phone`, `address`, `location` | 200: `{ message, customer }` | 400: `{ message }`. Only those fields are updated. |

When supplied, `phone` must be a 10-digit Indian mobile number beginning with 6–9; `address` must be non-empty and at most 200 characters; `location` must be a GeoJSON Point with [longitude, latitude] numeric coordinates in valid ranges.

## Bookings — `/bookings`

| Method | Endpoint | Access | Request / query | Success response | Errors / behavior |
|---|---|---|---|---|---|
| POST | `/bookings` | Customer | Body described below | 201: `{ message, booking }` | 400: `{ message }`. Checks worker verification/availability, active service, same cooperative, worker skill, working hours, future schedule, and booking overlaps. |
| GET | `/bookings/worker` | Worker | Query: optional `status`, `upcoming`, `page`, `limit` | 200: `{ success, bookings, pagination }` | 400 for invalid status; server errors return a message response. |
| PUT | `/bookings/:bookingId/status` | Worker | Body: `{ "status": "accepted" }` or `{ "status": "rejected" }` | 200: `{ message, booking }`; acceptance also includes `automaticallyRejected` | 400: `{ message }`. Only the assigned worker can act on a pending booking. Accepting a fixed-price booking changes it to `in_progress`; accepting a negotiable booking changes it to `accepted` until both parties agree on a price. Both reserve the worker's time and trigger conflict checks. Overlapping pending requests are automatically rejected. |
| PUT | `/bookings/:bookingId/cancel` | Customer | No body | 200: `{ message, booking }` | 400: `{ message }`. Only the booking's customer can cancel. Cancellation is allowed while status is `pending`, or during an accepted negotiable booking while its pricing status is `pending`, `proposed`, or `countered`. |
| PUT | `/bookings/:bookingId/service-done` | Worker | No body | 200: `{ message, booking }` | 400: `{ message }`. Assigned worker only; booking must be `in_progress` with a finalized positive price. Sets `serviceCompletedAt` and payment status to `awaiting`. Repeating the request after completion is treated as already marked. |
| PUT | `/bookings/:bookingId/pay` | Customer | No body; client must not submit an amount | 200: `{ message, booking }` | 400: `{ message }`. Assigned customer only; service must be marked done and payment must be awaiting. The server uses the stored booking price and records demo payment only; no real transfer occurs. |
| PUT | `/bookings/:bookingId/complete` | Worker | No body | 200: `{ message, booking }` | 400: `{ message }`. Assigned worker only; booking must be in progress, service marked done, and payment status paid. |
| GET | `/bookings/customer` | Customer | No body | 200: `{ bookings }` | 400: `{ message }`. Each returned booking includes a `rating` property containing the rating or null. |
| GET | `/bookings/worker/dashboard` | Worker | No body | 200: `{ success, message, data }` | 500: `{ success: false, message }`. Data contains total, pending, active, and completed booking counts plus total earnings. |
| GET | `/bookings/worker/earnings` | Worker | No body | 200: `{ success, message, data }` | 500: `{ success: false, message }`. Data contains `lifetime`, `currentMonth`, and `previousMonth` earnings and completed-booking counts. |
| POST | `/bookings/:bookingId/negotiation/offer` | Worker | Body: `{ "amount": number }` | 200: `{ message, booking }` | 400: `{ message }`. Assigned worker only; submits the initial positive offer on an accepted negotiable booking. It does not finalize the booking price. |
| POST | `/bookings/:bookingId/negotiation/counter` | Customer or worker (assigned participant only) | Body: `{ "amount": number }` | 200: `{ message, booking }` | 400: `{ message }`. Only the recipient of the current offer can counter it. Maximum 10 counteroffers; the initial offer is not counted. |
| POST | `/bookings/:bookingId/negotiation/accept` | Customer or worker (assigned participant only) | No body | 200: `{ message, booking }` | 400: `{ message }`. Only the recipient of the current offer can accept it. The accepted amount becomes the final `price`, `pricingStatus` becomes `agreed`, and booking status becomes `in_progress`. |
| POST | `/bookings/:bookingId/negotiation/reject` | Customer or worker (assigned participant only) | No body | 200: `{ message, booking }` | 400: `{ message }`. Only the recipient of the current offer can reject it; booking and pricing statuses become `rejected`. |
| PUT | `/bookings/:bookingId/chat/price` | Worker | Body: `{ "price": number }` (legacy) | 200: `{ message, booking }` | 400: `{ message }`. Compatibility route for the initial worker offer; it now creates a proposal and no longer marks the price agreed automatically. |
| GET | `/bookings/:bookingId/chat/booking` | Customer or worker (assigned participant only) | No body | 200: `{ success, booking }` | 403: `{ success: false, message }`. Chat summary is available after acceptance, while in progress, and after completion. |
| GET | `/bookings/:bookingId/chat/messages` | Customer or worker (assigned participant only) | No body | 200: `{ success, messages }` | 403: `{ success: false, message }`. Returns up to 300 messages in chronological order. |
| POST | `/bookings/:bookingId/chat/messages` | Customer or worker (assigned participant only) | Body: `{ "content": "..." }` | 201: `{ success, message }` | 400: `{ success: false, message }`. Message must be non-empty and no longer than 2,000 characters. |

### Create booking request

Required body fields:

    {
      "workerId": "WORKER_USER_ID",
      "serviceId": "SERVICE_ID",
      "scheduledAt": "2026-11-20T10:00:00+05:30",
      "address": "Service address",
      "location": {
        "type": "Point",
        "coordinates": [77.1, 28.6]
      },
      "skillName": "Example skill",
      "quantity": 1
    }

Validation and booking rules:

- `workerId` and `serviceId` must be valid MongoDB ObjectId strings.
- `skillName` is required and limited to 100 characters.
- `quantity` must be a positive finite number at validation time and an integer in the booking service.
- For `fixed`, `per_hour`, and `negotiable` pricing, quantity represents hours and must be 1–8.
- For `per_day` pricing, quantity represents calendar days and must be 1–30. Each selected day reserves an eight-hour interval beginning at the selected start time.
- `scheduledAt` must be a valid future date/time. The worker must be scheduled to work on every reserved day, and the requested interval must fit within that day's working hours.
- `address` is required and limited to 200 characters.
- `location` must be a GeoJSON Point with exactly two numeric coordinates in [longitude, latitude] order and valid geographic ranges.
- The service calculates the price from the worker's stored skill: fixed price, hourly rate multiplied by hours, daily rate multiplied by days, or pending price for negotiable work.
- A booking is rejected if it overlaps an existing pending, accepted, or in-progress booking for the worker.

### Worker booking list query parameters

- `status`: optional one of `pending`, `accepted`, `in_progress`, `rejected`, `cancelled`, `completed`.
- `upcoming`: optional; only the literal string `true` enables upcoming filtering. Without a status, upcoming results include pending, accepted, and in-progress bookings.
- `page`: optional page number, default 1; values are clamped to at least 1.
- `limit`: optional page size, default 10; clamped to 1–50.

Booking payment fields are `paymentStatus` (`not_due`, `awaiting`, `paid`), `paymentMethod` (`demo` when confirmed), `serviceCompletedAt`, and `paidAt`. Booking status values are `pending`, `accepted`, `rejected`, `in_progress`, `cancelled`, and `completed`. Pricing status values are `fixed`, `pending`, `proposed`, `countered`, `agreed`, and `rejected`. Negotiable bookings remain `accepted` during negotiation and move to `in_progress` only after the other party accepts the current offer. The booking stores `negotiation.currentOffer`, `negotiation.history`, and `counterOfferCount` (maximum 10; initial worker offer is excluded).

## Cooperative chat — `/chats`

These are separate worker-to-cooperative-admin conversations, not booking-specific chats. Every route requires authentication and the `worker` or `cooperative_admin` role.

| Method | Endpoint | Access | Request / query | Success response | Errors / behavior |
|---|---|---|---|---|---|
| GET | `/chats/contacts` | Worker or cooperative admin | No body | 200: `{ success, contacts }` | 403: `{ success: false, message }`. Workers receive their cooperative admin contact; admins receive approved workers in their cooperative. |
| GET | `/chats/:workerId/messages` | Worker or cooperative admin | Path `workerId` is the Worker profile document ID | 200: `{ success, messages }` | 403: `{ success: false, message }`. Returns up to 200 messages in chronological order. Worker access is limited to their own profile; admin access is limited to approved workers in the admin's cooperative. |
| POST | `/chats/:workerId/messages` | Worker or cooperative admin | Path `workerId` is the Worker profile document ID. Body: `{ "content": "..." }` | 201: `{ success, message }` | 400: `{ success: false, message }`. Message must be non-empty and no longer than 2,000 characters. |

The chat service requires an approved, verified worker profile and an active cooperative-admin profile linked to the same cooperative.

## Services — `/services`

| Method | Endpoint | Access | Request / query | Success response | Errors / behavior |
|---|---|---|---|---|---|
| POST | `/services/create` | Cooperative admin | Body: `name`, `description` (optional), `category` | 201: `{ message, service }` | 400: `{ message }`. Name and category must be 2–100 characters; description is optional and limited to 500 characters. Cooperative is taken from the authenticated active admin profile. |
| GET | `/services` | Customer or worker | Query: optional `cooperativeId`, `category` | 200: `{ message, services }` | 400: `{ message }`. Supplied cooperative ID must be valid; supplied category must be non-empty. Returns active services. |
| GET | `/services/categories` | Worker | Query: required `cooperativeId` | 200: `{ message, categories }` | 400: `{ message }`. Despite the controller's optional-looking destructuring, the service validates the ID unconditionally, so this query parameter is required. |
| GET | `/services/:serviceId/workers` | Customer | Query: optional `latitude`, `longitude`, `radiusKm` | 200: `{ message, workers }` | 400: `{ message }`. If either coordinate is supplied, both must be valid. A radius requires both coordinates. Allowed radius values are 1, 2, 4, 6, 8, 10, or 50 km. Workers must be verified and available and must offer the service in the service's cooperative. |

The service-worker response includes worker and user IDs, name, category, shop details, matching skill, skills, certifications, working hours, verification/availability flags, distance when coordinates are supplied, and rating summary.

The admin-managed service catalogue stores service name, description, category, cooperative, creator, and active state. Pricing is stored on each worker skill, not on the service catalogue.

## Cooperatives — `/cooperatives`

| Method | Endpoint | Access | Request | Success response | Errors / behavior |
|---|---|---|---|---|---|
| POST | `/cooperatives` | Super admin | Body: `name`, `registrationNumber`, `contactEmail`, `contactPhone`, `address`, optional `location` | 201: `{ message, cooperative }` | 400: `{ message }`. Name is 2–100 characters; registration number and valid email are required; supplied phone must be a 10-digit Indian mobile number; address is limited to 200 characters. Duplicate registration number, email, or phone is rejected. |
| GET | `/cooperatives` | Public | No body | 200: `{ cooperatives }` | 500: `{ message }`. Returns active cooperatives sorted by name. |
| GET | `/cooperatives/:id` | Public | Path `id` is the cooperative ID | 200: `{ cooperative }` | 404: `{ message }` when no active cooperative is found. |

Optional cooperative `location` uses GeoJSON Point coordinates in [longitude, latitude] order. Implementation ambiguity: the validator treats `contactPhone` as optional, but the create service calls `contactPhone.trim()` unconditionally. Include a valid phone number for a successful create until that mismatch is resolved.

## Cooperative administrators — `/cooperative-admins`

| Method | Endpoint | Access | Request | Success response | Errors / behavior |
|---|---|---|---|---|---|
| POST | `/cooperative-admins` | Super admin | Body: `fullName`, `email`, `cooperativeId` | 201: `{ message, admin }` | 400: `{ message }`. Name must contain letters/spaces and be 3–50 characters; email and cooperative ID must be valid. The request does not accept a password. |
| POST | `/cooperative-admins/bootstrap` | Admin setup header | Header: `x-admin-setup-key`. Body: `fullName`, `email`, `password`, `cooperativeId` | 201: `{ message, admin }` | 401 if setup header is missing; 403 if invalid; 400 for validation/service errors. Password must meet the strong-password requirements. |
| GET | `/cooperative-admins/services` | Cooperative admin | No body | 200: `{ success, services }` | 400: `{ success: false, message }`. Returns services belonging to the admin's active cooperative. |
| GET | `/cooperative-admins/bookings` | Cooperative admin | No body | 200: `{ success, bookings }` | 400: `{ success: false, message }`. Returns bookings for services belonging to the admin's active cooperative. |
| GET | `/cooperative-admins/dashboard/stats` | Cooperative admin | No body | 200: `{ success, message, stats }` | 400: `{ success: false, message }`. Stats contain worker, service, and booking totals/status counts for the admin's cooperative. |

Implementation note: the normal cooperative-admin creation service generates a temporary password internally but does not pass that password to the email helper or return it in the response. The actual credential-delivery/reset flow is therefore unverified from the current request/controller/service path.

## Super admin bootstrap — `/super-admin/bootstrap`

| Method | Endpoint | Access | Request | Success response | Errors / behavior |
|---|---|---|---|---|---|
| POST | `/super-admin/bootstrap` | Admin setup header | Header: `x-admin-setup-key`. Body: `fullName`, `email`, `password` | 201: `{ message, admin }` | 401 if setup header is missing; 403 if invalid; 400 for validation/service errors. Password must be at least 8 characters and contain lowercase, uppercase, number, and symbol. |

This is a setup endpoint. Keep the setup key private and do not publish its configured value.

## Community services — `/community-services`

| Method | Endpoint | Access | Request | Success response | Errors / behavior |
|---|---|---|---|---|---|
| POST | `/community-services` | Cooperative admin | Body: `cooperativeId`, `title`, `description` (optional), `category`, `skillName`, `scheduledAt`, `duration`, `location`, `address` | 201: `{ message, communityService }` | 400: `{ message }`. Title 3–100 chars; optional description max 500; category and skill 2–100; scheduled time must be future; duration must be a positive integer in minutes; address max 200; location must be a valid GeoJSON Point. Admin must belong to the specified cooperative. |
| GET | `/community-services/available` | Worker | No body | 200: `{ message, communityServices }` | 400: `{ message }`. Worker profile must exist, be verified, and be available. Results are open future opportunities matching the worker's cooperative, category, and skills. |

## Ratings — `/ratings`

| Method | Endpoint | Access | Request | Success response | Errors / behavior |
|---|---|---|---|---|---|
| POST | `/ratings` | Customer | Body: `bookingId`, `rating`, optional `review` | 201: `{ message, rating }` | 400: `{ message }`. Rating must be an integer from 1 to 5; review max 500 characters. Only the customer who owns a completed booking can rate it, and each booking can be rated once. |
| GET | `/ratings/worker/:workerId` | Public | Path `workerId` is the worker's User account ID, not the Worker profile document ID | 200: `{ averageRating, totalRatings, ratings }` | 400: `{ message }` for an invalid ID or service error. Ratings are sorted newest first and include the populated customer name. |

## Socket.IO real-time events

The Socket.IO server is created in `Backend/src/server.js` on the same HTTP server. A socket must authenticate with a Bearer token or the `token` cookie. The connected user must exist, have verified email, and have role `worker`, `cooperative_admin`, or `customer`; `super_admin` is not admitted by the socket middleware.

| Event | Direction | Payload / acknowledgement | Access and behavior |
|---|---|---|---|
| `booking-map:join` | Client to server | Payload: `{ bookingId }`. Acknowledgement returns `success`, `role`, `customerLocation`, `workerInitialLocation`, and `workerLiveLocation`. | Assigned customer or worker only; booking must be in progress. |
| `booking-map:location` | Client to server | Payload: `{ bookingId, latitude, longitude }`; acknowledgement: `{ success }` or `{ success: false, message }`. | Assigned worker only, after joining the booking map; coordinates must be within geographic ranges. Broadcasts `booking-map:worker-location` to the other room participants. |
| `booking-map:leave` | Client to server | No payload or acknowledgement required. | Leaves the active booking-map room. |
| `booking-chat:join` | Client to server | Payload: `{ bookingId }`; acknowledgement: `{ success }` or `{ success: false, message }`. | Assigned customer or worker; booking chat is available for accepted, in-progress, or completed bookings. |
| `booking-chat:send` | Client to server | Payload: `{ bookingId, content }`; acknowledgement: `{ success, message }` or error object. | Must have joined the booking chat; content must be non-empty and at most 2,000 characters. Broadcasts `booking-chat:message`. |
| `booking-chat:update-price` | Client to server | Payload: `{ bookingId, price }`; acknowledgement: `{ success, booking }` or error object. | Assigned worker only, after joining the booking chat; uses the same negotiable-price rules as the REST endpoint. Broadcasts `booking-chat:price`. |
| `chat:join` | Client to server | Payload: `{ workerId }`; acknowledgement: `{ success }` or `{ success: false, message }`. | Worker/cooperative-admin conversation; worker must be approved and admin must be active in the same cooperative. |
| `chat:send` | Client to server | Payload: `{ workerId, content }`; acknowledgement: `{ success, message }` or error object. | Must have joined the conversation; content must be non-empty and at most 2,000 characters. Broadcasts `chat:message`. |

Live map locations are held in server memory only and are not persisted to MongoDB. Socket acknowledgements use a `success` boolean and, on failure, a `message`.

## Authentication and role middleware behavior

- `auth.middleware.js` accepts the `token` cookie or a Bearer token, verifies the JWT, loads the user without the password field, and requires `emailVerified`.
- `role.middleware.js` checks the authenticated user's role and returns 401 when no user is attached or 403 when the role is not allowed.
- `adminSetup.middleware.js` protects the two bootstrap routes with the `x-admin-setup-key` header.
- `cooperativeAdmin.middleware.js` exists in the codebase but is not attached directly to the current route registrations. Cooperative-admin service methods perform their own active cooperative-admin profile checks where required.
- Booking chat applies additional ownership checks in the service layer; route-level customer/worker role access alone does not grant access to another user's booking.

## Source files checked

- Route mounts and server configuration: `Backend/src/server.js`
- HTTP routes: `Backend/src/routes/*.routes.js`
- Controllers: `Backend/src/controllers/*.controller.js`
- Request validators: `Backend/src/validator/*.validator.js`
- Authentication/role/setup middleware: `Backend/src/middlewares/*.middleware.js`
- Business rules: `Backend/src/services/*.service.js`
- Persisted field definitions and enums: `Backend/src/models/*.js`

When a route, mount prefix, validator, controller response, service rule, or model enum changes, update this document in the same change. If a behavior is not established by the source, label it as unverified rather than inferring it.
