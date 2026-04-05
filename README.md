# Scalable Ticket System

A production-structured movie ticket booking platform built with microservices, Docker, Docker Compose, MongoDB, Redis, RabbitMQ, Node.js, Express, and a React + Vite frontend.

## Services

- `client`: React frontend served with Nginx
- `gateway`: API gateway with JWT verification and reverse proxying
- `auth-service`: registration, login, JWT issuance, role-based access
- `movie-service`: movie and show management
- `booking-service`: seat locking with Redis, booking creation, booking status updates
- `payment-service`: consumes booking events, simulates payment, handles retry and DLQ flows
- `notification-service`: consumes booking and payment events, simulates email delivery
- `mongo`: shared MongoDB instance with separate databases per service
- `redis`: seat lock store
- `rabbitmq`: message broker with management dashboard

## Architecture

`Client -> API Gateway -> Services`

Inter-service workflows are event-driven through RabbitMQ. The gateway is the only HTTP entrypoint the frontend uses.

## Local Run

```bash
docker compose up --build
```

## URLs

- Frontend: `http://localhost:5173`
- Gateway: `http://localhost:4000`
- RabbitMQ dashboard: `http://localhost:15672`

Default RabbitMQ credentials:

- username: `guest`
- password: `guest`

## Test Flow

1. Register a normal user or admin user from the frontend or Postman.
2. Log in and copy the JWT if testing from Postman.
3. Create a movie as an admin with `POST /movies`.
4. Lock seats with `POST /booking/seats/lock`.
5. Create a booking with `POST /booking/bookings`.
6. Watch payment and notification logs in Docker.
7. Check booking status with `GET /booking/bookings/:bookingId`.

## Example Accounts

To create an admin account, register with:

- `role: "admin"`
- `adminSecret: "superadmin123"`

That value is configured in `docker-compose.yml` as `ADMIN_REGISTRATION_KEY`.

## Important API Routes

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Movies

- `GET /movies`
- `GET /movies/:movieId`
- `POST /movies` (admin only)

### Booking

- `GET /booking/seats/status/:showId`
- `POST /booking/seats/lock`
- `POST /booking/bookings`
- `GET /booking/bookings/:bookingId`

### Health

- `GET /health` on every service

## Environment Variables

Each backend service supports the required variables:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `RABBITMQ_URL`
- `REDIS_HOST`
- `REDIS_PORT`

The frontend uses:

- `VITE_API_BASE_URL`

## Notes

- Movies contain embedded show data for a compact local setup.
- Seat locks expire automatically in Redis.
- Payment failures are retried through `payment_retry_queue`.
- Exhausted retries are pushed to `payment_dlq`.
- Booking status updates are driven by payment events.
