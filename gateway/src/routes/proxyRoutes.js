const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const services = require("../config/services");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

const buildProxy = (target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    proxyTimeout: 15000,
    timeout: 15000,
    on: {
      proxyReq(proxyReq, req) {
        if (!req.user) return;
        proxyReq.setHeader("x-user-id",    req.user.id);
        proxyReq.setHeader("x-user-email", req.user.email);
        proxyReq.setHeader("x-user-role",  req.user.role);
        proxyReq.setHeader("x-user-name",  req.user.name);
      },
      error(error, _req, res) {
        console.error("Proxy error:", error.message);
        if (!res.headersSent) {
          res.status(502).json({ message: "Upstream service unavailable." });
        }
      },
    },
  });

// Auth — public
router.use("/auth", buildProxy(services.authService));

// Movies — GET is public, POST/PUT/DELETE require auth (PUT/DELETE require admin)
router.use(
  "/movies",
  (req, res, next) => {
    if (req.method === "GET")    return next();                              // public
    if (req.method === "POST")   return authenticate({ roles: ["admin"] })(req, res, next);
    if (req.method === "PUT")    return authenticate({ roles: ["admin"] })(req, res, next);
    if (req.method === "DELETE") return authenticate({ roles: ["admin"] })(req, res, next);
    return next();
  },
  buildProxy(services.movieService)
);

// Events — same pattern as movies
router.use(
  "/events",
  (req, res, next) => {
    if (req.method === "GET")    return next();
    if (req.method === "POST")   return authenticate({ roles: ["admin"] })(req, res, next);
    if (req.method === "PUT")    return authenticate({ roles: ["admin"] })(req, res, next);
    if (req.method === "DELETE") return authenticate({ roles: ["admin"] })(req, res, next);
    return next();
  },
  buildProxy(services.eventService)
);

// Booking — all methods require auth
router.use("/booking",  authenticate(),                buildProxy(services.bookingService));
router.use("/payment",  authenticate(),                buildProxy(services.paymentService));
router.use("/notify",   authenticate({ roles: ["admin"] }), buildProxy(services.notificationService));

module.exports = router;