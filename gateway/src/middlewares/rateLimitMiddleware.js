const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

// Key: authenticated user-id when available, otherwise raw IP (IPv6 safe)
const userOrIpKey = (req) => req.headers["x-user-id"] || ipKeyGenerator(req);

const jsonMessage = (msg) => (_req, res) =>
  res.status(429).json({
    status: 429,
    error: "Too Many Requests",
    message: msg,
    retryAfter: res.getHeader("Retry-After"),
  });

// 1. Global limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 1000,
  max: 200,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req),
  handler: jsonMessage("Gateway rate limit reached. Please slow down."),
});

// 2. Auth limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req),
  skipSuccessfulRequests: true,
  handler: jsonMessage("Too many login attempts. Please wait 15 minutes."),
});

// 3. Standard limiter
const standardLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  handler: jsonMessage("Too many requests. Please wait a moment."),
});

// 4. Booking limiter
const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: userOrIpKey,
  handler: jsonMessage("Too many booking requests. Please try again in a minute."),
});

module.exports = {
  globalLimiter,
  authLimiter,
  standardLimiter,
  bookingLimiter,
};
