import { prisma } from "../utils/prisma-client.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";

// SIGNUP
export const signup = async (req, res) => {
  try {
    const { first_name, last_name, full_name, email, password, role } = req.body;
    if (!email || !password || (!first_name && !full_name))
      return res.status(400).json({ message: "Missing fields" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: "Email already exists" });

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
      const { phone, bio, current_education_level, interests } = req.body;
      await prisma.studentProfile.create({
        data: { 
          user_id: user.id, 
          full_name: `${user.first_name} ${user.last_name}`, 
          phone,
          bio,
          current_education_level,
          interests: interests || []
        },
      });
    } else if (user.role === "INSTRUCTOR") {
      try {
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
        console.log('Instructor profile created successfully for user:', user.id);
      } catch (profileError) {
        console.error('Failed to create instructor profile:', profileError);
        // Delete the user since profile creation failed
        await prisma.user.delete({ where: { id: user.id } });
        return res.status(500).json({ message: "Failed to create instructor profile. Signup cancelled." });
      }
    }

    const token = generateToken(user);

    return res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name } });
  } catch (err) {
    console.error("[auth.signup]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('[auth.login] Login attempt for email:', email);
    
    if (!email || !password) {
      console.log('[auth.login] Missing fields');
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    console.log('[auth.login] User found:', !!user);
    if (user) {
      console.log('[auth.login] User role:', user.role);
    }
    
    if (!user || !user.password) {
      console.log('[auth.login] Invalid credentials - user not found or no password');
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    console.log('[auth.login] Password match:', match);
    
    if (!match) {
      console.log('[auth.login] Invalid credentials - password mismatch');
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    console.log('[auth.login] Login successful for user:', user.email, 'role:', user.role);

    return res.json({ token, user: { id: user.id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name } });
  } catch (err) {
    console.error("[auth.login] Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//  OAUTH LOGIN 
export const oauthLogin = async (req, res) => {
  try {
    const { email, first_name, last_name, role = "STUDENT" } = req.user; 
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
    return res.json({ token, role: user.role });
  } catch (err) {
    console.error("[auth.oauthLogin]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
