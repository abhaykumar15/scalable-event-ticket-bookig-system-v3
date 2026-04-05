const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const services = require("../config/services");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

const buildProxy = (target, pathRewrite) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    proxyTimeout: 15000,
    timeout: 15000,
    on: {
      proxyReq(proxyReq, req) {
        if (!req.user) {
          return;
        }

        proxyReq.setHeader("x-user-id", req.user.id);
        proxyReq.setHeader("x-user-email", req.user.email);
        proxyReq.setHeader("x-user-role", req.user.role);
        proxyReq.setHeader("x-user-name", req.user.name);
      },
      error(error, _req, res) {
        console.error("Proxy error:", error.message);
        if (!res.headersSent) {
          res.status(502).json({ message: "Upstream service unavailable." });
        }
      },
    },
  });

router.use(
  "/auth",
  buildProxy(services.authService, {
    "^/auth": "",
  })
);

router.use(
  "/movies",
  (req, res, next) => {
    if (req.method === "POST") {
      return authenticate({ roles: ["admin"] })(req, res, next);
    }

    return next();
  },
  buildProxy(services.movieService)
);

router.use(
  "/booking",
  authenticate(),
  buildProxy(services.bookingService, {
    "^/booking": "",
  })
);

router.use(
  "/payment",
  authenticate(),
  buildProxy(services.paymentService, {
    "^/payment": "",
  })
);

router.use(
  "/notify",
  authenticate({ roles: ["admin"] }),
  buildProxy(services.notificationService, {
    "^/notify": "",
  })
);

module.exports = router;
