# Backend Endpoint Specification

Implement these endpoints. Response bodies are JSON unless noted.

---

## Auth

### POST `/login`

**Request body:**
```json
{ "username": "string", "password": "string", "role": "student" | "admin" }
```

**Success 200:**
```json
{ "message": "Login successful", "role": "student" | "admin" | "sysadmin" }
```

**Errors:** 400 invalid role, 404 username not found, 401 wrong password

---

## Student

### GET `/student/basic/:id`

Student profile (name, department, semester). `id` = student_id.

**Success 200:**
```json
{ "name": "string", "department": "string", "semester": 1 }
```

**Error:** 404 student not found

---

### GET `/student/allocation/:id`

Current allocation with room info. `id` = student_id.

**Success 200:**
```json
{ "allocation_id": 1, "student_id": 1, "status": "ACTIVE" | "PENDING", "start_date": "2025-01-15", "hall_name": "TH", "room_number": 101 }
```

**Error:** 404 allocation not found

---

### POST `/student/pay-seat-fee`

**Request body:**
```json
{ "allocation_id": 1, "bank_transaction_id": "string", "amount": 1000.00 }
```

**Success 200:**
```json
{ "message": "Payment recorded" }
```

---

### GET `/student/halls`

List halls (excluding sysadmin).

**Success 200:**
```json
[{ "hall_id": 1, "hall_name": "TH" }, ...]
```

---

### POST `/student/change-password`

**Request body:**
```json
{ "student_id": 1, "current_password": "string", "new_password": "string" }
```

**Success 200:**
```json
{ "message": "Password changed successfully" }
```

**Errors:** 400 missing fields, 404 student not found, 401 current password incorrect

---

## Student — Bookings

### GET `/student/bookings/:studentId`

List all bookings for a student with room info.

**Success 200:**
```json
[
  { "booking_id": 1, "student_id": 1, "room_id": 5, "status": "PENDING", "created_at": "2025-01-15T10:00:00Z", "hall_name": "TH", "room_number": 102 }
]
```

---

### POST `/student/bookings`

**Request body:**
```json
{ "student_id": 1, "hall_id": 1, "room_number": 102 }
```

**Success 200:**
```json
{ "message": "Successfully added booking" }
```

**Errors:** 400 room not found

---

### DELETE `/student/bookings/:bookingId`

**Success 200:**
```json
{ "message": "Booking deleted" }
```

---

## Student — Services

### GET `/student/services/:studentId`

List resident services for the student’s allocation, with paid status.

**Success 200:**
```json
[
  { "service_id": 1, "service_name": "Laundry", "service_period_start": "15-Jan-2025", "service_period_end": "15-Mar-2025", "service_fee_amount": 500.00, "paid": true }
]
```

---

### POST `/student/services/pay`

**Request body:**
```json
{ "service_id": 1, "amount_paid": 500.00, "bank_transaction_id": "string" }
```

**Success 200:**
```json
{ "message": "Payment recorded" }
```

---

## Admin (Hall)

### GET `/admin/hall-info/:hallName`

Hall summary with occupancy stats. `get_hall_alloc_count` returns `ttl_alc` (total allocations), `ttl_cap` (total capacity). Compute `available_seats = ttl_cap - ttl_alc`.

**Success 200:**
```json
{ "hall_id": 1, "hall_name": "TH", "total_students": 12, "available_seats": 3 }
```

**Error:** 404 hall not found

---

### POST `/admin/change-password`

**Request body:**
```json
{ "hallId": 1, "currentPassword": "string", "newPassword": "string" }
```

**Success 200:**
```json
{ "message": "Password Changed Successfully" }
```

**Errors:** 400 missing fields, 401 current password incorrect

---

## Admin — Allocation

Mounted under `/admin/allocation` (see `adminAllocationRoutes.js`).

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/admin/allocation/rooms/:hallId` | List rooms in hall |
| GET | `/admin/allocation/room-allocations/:hallId/:roomId` | Allocations in a room |
| DELETE | `/admin/allocation/allocations/:hallId/:allocationId` | Remove allocation |
| POST | `/admin/allocation/allocations` | Body: `{ hallId, room_id, student_id }` |
| GET | `/admin/allocation/student-location/:hallId/:studentId` | `{ room_number }` or 404 |

---

## Admin — Service

Mounted under `/admin/service` (see `adminServiceRoutes.js`).

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/admin/service/names/:hallId` | Distinct service names in hall |
| GET | `/admin/service/by-name/:hallId?name=` | Services with that name |
| GET | `/admin/service/by-student/:hallId/:studentId` | Services for student in hall |

---

## SysAdmin

### GET `/sysadmin/halls`

List halls (excluding sysadmin), ordered by name.

**Success 200:**
```json
[{ "hall_id": 1, "hall_name": "AUH" }, ...]
```

---

### POST `/sysadmin/add-hall`

**Request body:**
```json
{ "hallName": "string", "password": "string" }
```

**Success 201:**
```json
{ "message": "Hall created successfully.", "hall_id": 1 }
```

**Error:** 400 hall name and password required

---

### POST `/sysadmin/add-room`

**Request body:**
```json
{ "hallId": 1, "roomNumber": 102, "capacity": 6 }
```

**Success 201:**
```json
{ "message": "Room added successfully.", "room_id": 5 }
```

**Error:** 400 hall, room number, capacity required

---

### POST `/sysadmin/semester-rollover`

Calls `CALL semester_rollover()`.

**Success 200:**
```json
{ "message": "Semester rollover completed successfully." }
```

---

## Suggested Endpoints (to implement)

| Method | Path | Purpose | Output |
|--------|------|---------|--------|
| GET | `/admin/allocation/rooms/:hallId` | List rooms of a hall | `[{ room_id, room_number, capacity }]` |
| GET | `/admin/allocations/:hallId` | List allocations for hall | `[{ allocation_id, student_id, room_id, status, hall_name, room_number, student_name }]` |
| GET | `/admin/bookings/:hallId` | Pending bookings for hall | `[{ booking_id, student_id, hall_name, room_number, created_at }]` |
| POST | `/admin/services` | Add resident service | `{ service_id, message }` — body: `{ allocation_id, service_name, service_period_start, service_period_end, service_fee_amount }` |
| GET | `/student/rooms/:hallId` | Rooms with availability for booking | `[{ room_id, room_number, capacity, current_count, available }]` |
