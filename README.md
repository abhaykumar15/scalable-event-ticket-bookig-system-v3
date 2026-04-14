# 🎟️ CineVibe — Scalable Event & Movie Ticket Booking System

A production-structured, full-stack ticket booking platform inspired by BookMyShow. Built with a **microservices architecture** using Docker, Node.js, React, MongoDB, Redis, and RabbitMQ.

Users can browse movies and events, select dates, pick show times, choose seats, and complete payments — all with real-time seat locking to prevent double booking.

---

## 📸 Features

- 🎬 **Movies** — Browse 20+ movies with multi-date show listings (BookMyShow-style date tabs + time slot picker)
- 🎪 **Events** — Browse concerts, comedy shows, sports, theatre, and conferences
- 💺 **Seat Selection** — Interactive seat grid with real-time lock status (Redis-backed)
- 🔐 **Auth** — JWT-based login/register with role-based access (user / admin)
- 💳 **Payments** — Event-driven payment flow with retry logic and dead-letter queue
- 📧 **Notifications** — RabbitMQ-driven email simulation on booking and payment events
- 🛡️ **API Gateway** — Single entry point with JWT verification and rate limiting
- 🐳 **Fully Dockerised** — One command to spin up the entire stack

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React Client                         │
│              (Vite + Tailwind + Framer Motion)               │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway :4000                       │
│           JWT Auth Middleware + Rate Limiter                 │
│              Reverse Proxy to all services                   │
└──┬──────┬──────┬──────┬──────┬──────┬────────────────────── ┘
   │      │      │      │      │      │
   ▼      ▼      ▼      ▼      ▼      ▼
 Auth  Movie  Booking Payment Notif  Event
 :4001 :4002  :4003   :4004   :4005  :4006
   │      │      │                     │
   ▼      ▼      ▼                     ▼
MongoDB MongoDB MongoDB            MongoDB
ticket_ ticket_ ticket_            ticket_
auth    movie   booking            event

              │ Redis (Seat Locks)
              ▼
         booking-service ──► RabbitMQ ──► payment-service
                                    └───► notification-service
```

### Event-Driven Flow

```
User Books Seats
      │
      ▼
booking-service ──publishes──► booking.created
                                      │
                         ┌────────────┴────────────┐
                         ▼                         ▼
                  payment-service         notification-service
                  (simulates payment)     (simulates email)
                         │
                  publishes ──► payment.success / payment.failed
                                      │
                         ┌────────────┴────────────┐
                         ▼                         ▼
                  booking-service         notification-service
                  (updates status)        (sends confirmation)
```

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, React Router |
| API Gateway | Node.js, Express, http-proxy-middleware |
| Backend Services | Node.js, Express, Mongoose |
| Databases | MongoDB 7 (separate DB per service) |
| Cache / Locks | Redis 7 (seat locking with TTL) |
| Message Broker | RabbitMQ 3 (booking → payment → notification) |
| Containerisation | Docker, Docker Compose |
| Auth | JWT (RS256), bcrypt |

---

## 📁 Project Structure

```
├── client/                        # React frontend
│   └── src/
│       ├── pages/
│       │   ├── MoviesPage.jsx     # Movie listing with date tabs
│       │   ├── BookingPage.jsx    # Seat selection + date/time switcher
│       │   ├── EventsPage.jsx     # Events listing
│       │   ├── EventBookingPage.jsx
│       │   ├── PaymentPage.jsx
│       │   ├── PaymentStatusPage.jsx
│       │   ├── DashboardPage.jsx
│       │   └── UserProfilePage.jsx
│       └── components/
│           ├── MovieCard.jsx      # Date tabs + time slot picker
│           ├── SeatGrid.jsx       # Interactive seat map
│           ├── EventCard.jsx
│           └── Navbar.jsx
├── gateway/                       # API Gateway
├── services/
│   ├── auth-service/              # Register, Login, JWT
│   ├── movie-service/             # Movies + Shows CRUD + seed
│   ├── booking-service/           # Seat lock + booking creation
│   ├── payment-service/           # Payment simulation + retry/DLQ
│   ├── notification-service/      # Email simulation
│   └── event-service/             # Events + Slots CRUD + seed
├── nginx/                         # Nginx config
├── jmeter/                        # Load test plan
└── docker-compose.yml
```

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose installed
- Port `5173`, `4000–4006`, `27017`, `6379`, `5672`, `15672` available

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/event-ticket-booking-system-v3.git
cd event-ticket-booking-system-v3
```

### 2. Start everything

```bash
docker-compose up --build
```

Wait ~30 seconds for all services to be healthy.

### 3. Access the app

| URL | Description |
|---|---|
| `http://localhost:5173` | React frontend |
| `http://localhost:4000` | API Gateway |
| `http://localhost:15672` | RabbitMQ Dashboard |
| `http://localhost:27017` | MongoDB |

RabbitMQ credentials: `guest` / `guest`

---

## 🌱 Seeding Data

Movie and event data is **auto-seeded on first startup** — no manual commands needed. If the database is empty when the service starts, it inserts all seed data automatically.

To manually re-seed (clears existing data and re-inserts):

```bash
# Seed movies (20 movies, 3 dates each, 3 time slots per day)
docker exec -it movie-service node seed.js

# Seed events (8 events with multiple slots)
docker exec -it event-service node seed.js
```

---

## 👤 Creating Accounts

### Register a normal user

```json
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

### Register an admin

```json
POST /auth/register
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin",
  "adminSecret": "superadmin123"
}
```

> Admin secret is configured in `docker-compose.yml` as `ADMIN_REGISTRATION_KEY`

---

## 📡 API Reference

All requests go through the gateway at `http://localhost:4000`.  
Protected routes require header: `Authorization: Bearer <token>`

---

### 🔐 Auth Service

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login, returns JWT |

**Register body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "user | admin",
  "adminSecret": "string (if admin)"
}
```

**Login body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Login response:**
```json
{
  "token": "eyJhbGci...",
  "user": { "id": "...", "name": "...", "email": "...", "role": "user" }
}
```

---

### 🎬 Movie Service

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/movies` | ✅ | Get all active movies |
| GET | `/movies/:movieId` | ✅ | Get single movie with all shows |
| POST | `/movies` | ✅ Admin | Create movie with first show |
| POST | `/movies/:movieId/shows` | ✅ Admin | Add a new show to existing movie |

**Create movie body:**
```json
{
  "title": "Interstellar",
  "description": "...",
  "genre": "Sci-Fi",
  "language": "English",
  "durationMinutes": 169,
  "posterUrl": "https://...",
  "rating": 4.9,
  "shows": [{
    "theatreName": "PVR Cinemas",
    "city": "Chennai",
    "screenName": "Screen 1",
    "date": "2026-06-01",
    "startTime": "2026-06-01T10:00:00.000Z",
    "price": 220,
    "totalSeats": 40
  }]
}
```

**Add show body:**
```json
{
  "theatreName": "INOX",
  "city": "Mumbai",
  "screenName": "Screen 2",
  "date": "2026-06-02",
  "startTime": "2026-06-02T19:00:00.000Z",
  "price": 250,
  "totalSeats": 40
}
```

---

### 🎪 Event Service

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/events` | ✅ | Get all active events |
| GET | `/events/:eventId` | ✅ | Get single event with all slots |
| POST | `/events` | ✅ Admin | Create event with slots |

**Create event body:**
```json
{
  "title": "Neon Nights",
  "description": "...",
  "category": "Concert",
  "artist": "Martin Garrix",
  "language": "Instrumental",
  "durationMinutes": 360,
  "posterUrl": "https://...",
  "rating": 4.9,
  "slots": [{
    "venueName": "MMRDA Grounds",
    "city": "Mumbai",
    "section": "General Admission",
    "startTime": "2026-06-07T17:00:00.000Z",
    "price": 2499,
    "totalSeats": 200
  }]
}
```

---

### 💺 Booking Service — Seats

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/booking/seats/status/:showId` | ✅ | Get booked + locked seats for a show |
| POST | `/booking/seats/lock` | ✅ | Lock selected seats (TTL: 5 mins) |

**Seat status response:**
```json
{
  "showId": "...",
  "bookedSeats": ["A1", "A2"],
  "lockedSeats": ["B3"]
}
```

**Lock seats body:**
```json
{
  "showId": "64abc123...",
  "seatNumbers": ["A1", "A2", "B3"]
}
```

---

### 🎫 Booking Service — Bookings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/booking/bookings` | ✅ | Create booking (seats must be locked first) |
| GET | `/booking/bookings` | ✅ | Get all bookings for logged-in user |
| GET | `/booking/bookings/:bookingId` | ✅ | Get single booking |

**Create booking body:**
```json
{
  "movieId": "64abc...",
  "movieTitle": "Interstellar",
  "showId": "64def...",
  "showStartTime": "2026-06-01T10:00:00.000Z",
  "seatNumbers": ["A1", "A2"],
  "amount": 440
}
```

**Booking response:**
```json
{
  "_id": "...",
  "userId": "...",
  "movieTitle": "Interstellar",
  "showId": "...",
  "seatNumbers": ["A1", "A2"],
  "amount": 440,
  "status": "PENDING_PAYMENT",
  "createdAt": "..."
}
```

**Booking statuses:**

| Status | Meaning |
|---|---|
| `PENDING_PAYMENT` | Booking created, payment in progress |
| `PAYMENT_SUCCESS` | Payment confirmed |
| `PAYMENT_FAILED` | All payment retries exhausted |

---

## 🔄 Complete Booking Flow

```
1. GET  /movies                          → browse movies
2. GET  /movies/:movieId                 → pick show by date + time
3. GET  /booking/seats/status/:showId    → see available seats
4. POST /booking/seats/lock              → lock chosen seats (5 min TTL)
5. POST /booking/bookings                → create booking
6. GET  /booking/bookings/:bookingId     → poll for PAYMENT_SUCCESS
```

---

## ⚙️ Environment Variables

All are pre-configured in `docker-compose.yml`. Override as needed:

| Variable | Service | Default |
|---|---|---|
| `PORT` | All | 4001–4006 |
| `MONGO_URI` | Auth, Movie, Booking, Event | `mongodb://mongo:27017/ticket_*` |
| `JWT_SECRET` | Gateway, Auth | `super-secret-jwt-key` |
| `ADMIN_REGISTRATION_KEY` | Auth | `superadmin123` |
| `RABBITMQ_URL` | Booking, Payment, Notification | `amqp://guest:guest@rabbitmq:5672` |
| `REDIS_HOST` | Booking | `redis` |
| `REDIS_PORT` | Booking | `6379` |
| `SEAT_LOCK_TTL_SECONDS` | Booking | `300` |
| `PAYMENT_MAX_RETRIES` | Payment | `3` |
| `PAYMENT_RETRY_DELAY_MS` | Payment | `5000` |
| `VITE_API_BASE_URL` | Client | `http://localhost:4000` |

---

## 🐳 Docker Services

| Container | Image | Port |
|---|---|---|
| `ticket-client` | Custom (Nginx) | 5173 |
| `ticket-gateway` | Custom (Node) | 4000 |
| `auth-service` | Custom (Node) | 4001 |
| `movie-service` | Custom (Node) | 4002 |
| `booking-service` | Custom (Node) | 4003 |
| `payment-service` | Custom (Node) | 4004 |
| `notification-service` | Custom (Node) | 4005 |
| `event-service` | Custom (Node) | 4006 |
| `ticket-mongo` | mongo:7 | 27017 |
| `ticket-redis` | redis:7-alpine | 6379 |
| `ticket-rabbitmq` | rabbitmq:3-management | 5672, 15672 |

---

## 🛠️ Useful Commands

```bash
# Start everything
docker-compose up --build

# Start in background
docker-compose up --build -d

# Stop everything
docker-compose down

# Stop and wipe all data volumes
docker-compose down -v

# View logs for a specific service
docker logs -f movie-service
docker logs -f booking-service
docker logs -f payment-service

# Re-seed movies (clears and re-inserts all 20 movies)
docker exec -it movie-service node seed.js

# Re-seed events
docker exec -it event-service node seed.js

# Open MongoDB shell
docker exec -it ticket-mongo mongosh

# Check movies in DB
docker exec -it ticket-mongo mongosh --eval "use ticket_movie; db.movies.find({}, {title:1, 'shows.date':1}).pretty()"

# Check bookings in DB
docker exec -it ticket-mongo mongosh --eval "use ticket_booking; db.bookings.find().pretty()"

# Flush Redis (clear all seat locks)
docker exec -it ticket-redis redis-cli FLUSHALL

# Rebuild a single service after code change
docker-compose up --build movie-service

# Push to original repo
git push origin main

# Push to v3 repo
git push v3 main
```

---

## 🧪 Load Testing

A JMeter test plan is included at `jmeter/ticket-booking-load-test.jmx`.

```bash
# Run load test (requires JMeter installed)
jmeter -n -t jmeter/ticket-booking-load-test.jmx -l results.jtl
```

---

## 🗺️ MongoDB Databases

| Database | Used By | Collections |
|---|---|---|
| `ticket_auth` | auth-service | `users` |
| `ticket_movie` | movie-service | `movies` (shows embedded) |
| `ticket_booking` | booking-service | `bookings` |
| `ticket_event` | event-service | `events` (slots embedded) |

---

## 🐛 Troubleshooting

**Services not starting?**
```bash
docker-compose down -v
docker-compose up --build
```

**Movies not showing?**
```bash
docker exec -it movie-service node seed.js
```

**Seats stuck as locked after failed payment?**
```bash
docker exec -it ticket-redis redis-cli FLUSHALL
```

**RabbitMQ not connecting?**  
Wait ~20 seconds after startup — RabbitMQ takes time to be fully ready. The services retry automatically.

**Port already in use?**  
Stop any local MongoDB, Redis, or other services running on the same ports before starting Docker.

---

## 👨‍💻 Author

**Abhay Kumar**  
MCA — Vellore Institute of Technology  
Student ID: 25MCA0130  
Project Guide: Dr. Senthil Murugan B.
