const jwt = require("jsonwebtoken");

const getBearerToken = (authorizationHeader = "") => {
  if (!authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice(7);
};

const authenticate =
  ({ roles = [] } = {}) =>
  (req, res, next) => {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ message: "Authentication token missing." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "You do not have access." });
      }

      req.user = decoded;
      return next();
    } catch (_error) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
  };

module.exports = {
  authenticate,
};
