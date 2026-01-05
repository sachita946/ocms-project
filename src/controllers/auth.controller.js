import { prisma } from "../utils/prisma-client.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";
import { success, error } from "../utils/json.js";

// ------------------ SIGNUP ------------------
export const signup = async (req, res) => {
  try {
    const { first_name, last_name, full_name, email, password, role } = req.body;
    if (!email || !password || (!first_name && !full_name))
      return error(res, "Missing fields", 400);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return error(res, "Email already exists", 409);

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        first_name: first_name || (full_name || "").split(" ")[0],
        last_name: last_name || (full_name || "").split(" ").slice(1).join(" ") || "",
        email,
        password: hashed,
        role: role || "STUDENT",
      },
    });

    // Create profile based on role
    if (user.role === "STUDENT") {
      await prisma.studentProfile.create({
        data: { user_id: user.id, full_name: `${user.first_name} ${user.last_name}`, interests: [] },
      });
    } else if (user.role === "INSTRUCTOR") {
      const { qualifications, experience_years, expertise_area, bio, phone, website } = req.body;
      await prisma.instructorProfile.create({
        data: {
          user_id: user.id,
          full_name: `${user.first_name} ${user.last_name}`,
          qualifications,
          experience_years: experience_years ? parseInt(experience_years) : null,
          expertise_area,
          bio,
          phone,
          website,
          is_pending_approval: true,
          is_verified: false
        },
      });
    }

    const token = generateToken(user);

    return success(res, { token, user: { id: user.id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name } }, "Signup successful");
  } catch (err) {
    console.error("signup", err);
    return error(res, "Server error", 500);
  }
};

// ------------------ LOGIN ------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return error(res, "Missing fields", 400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return error(res, "Invalid credentials", 400);

    const match = await bcrypt.compare(password, user.password);
    if (!match) return error(res, "Invalid credentials", 400);

    const token = generateToken(user);

    return success(res, { token, user: { id: user.id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name } }, "Login successful");
  } catch (err) {
    console.error("login", err);
    return error(res, "Server error", 500);
  }
};

// ------------------ OAUTH LOGIN ------------------
export const oauthLogin = async (req, res) => {
  try {
    const { email, first_name, last_name, role = "STUDENT" } = req.user; // populated by Passport
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: { email, first_name, last_name, role },
      });

      if (role === "STUDENT") {
        await prisma.studentProfile.create({ data: { user_id: user.id, full_name: `${first_name} ${last_name}`, interests: [] } });
      } else if (role === "INSTRUCTOR") {
        await prisma.instructorProfile.create({ data: { user_id: user.id, full_name: `${first_name} ${last_name}` } });
      }
    }

    const token = generateToken(user);
    return success(res, { token, role: user.role }, "OAuth login successful");
  } catch (err) {
    console.error("oauthLogin", err);
    return error(res, "Server error", 500);
  }
};
