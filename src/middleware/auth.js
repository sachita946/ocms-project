import { prisma } from "../utils/prisma-client.js";
import { verifyToken } from "../utils/jwt.js";
import { error } from "../utils/json.js";

export const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return error(res, "Missing token", 401);
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded || !decoded.id) {
    return error(res, "Invalid token", 401);
  }

  try {
    // attach user info to request
    req.user = { id: decoded.id, role: decoded.role || "STUDENT" };

    // optional: attach studentProfile/instructorProfile ids
    const student = await prisma.studentProfile.findUnique({ where: { user_id: decoded.id } });
    if (student) req.studentProfileId = student.id;

    const instructor = await prisma.instructorProfile.findUnique({ where: { user_id: decoded.id } });
    if (instructor) req.instructorProfileId = instructor.id;

    return next();
  } catch (err) {
    console.error("auth middleware", err);
    return error(res, "Server error", 500);
  }
};
