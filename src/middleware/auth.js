import { prisma } from "../utils/prisma-client.js";
import { verifyToken } from "../utils/jwt.js";

export const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded || !decoded.id) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    // attach user info to request
    req.user = { id: decoded.id, role: decoded.role || "STUDENT" };

    // Only query profiles when actually needed - store in JWT or lazy load
    // For now, we'll lazy load them in controllers that need them
    // This eliminates 2 unnecessary queries on every request

    return next();
  } catch (err) {
    console.error("[auth.middleware]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
