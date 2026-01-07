import { Router } from "express";
import { signup, login, oauthLogin } from "../controllers/auth.controller.js";
import { auth } from "../middleware/auth.js";
import { prisma } from "../utils/prisma-client.js";

const router = Router();

// Handle OPTIONS for CORS preflight
router.options("/signup", (req, res) => {
  res.status(200).end();
});

//SIGNUP 
router.post("/signup", async (req, res) => {
  try {
    await signup(req, res);
  } catch (err) {
    console.error("[auth.routes.signup]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});
//login
router.post("/login", async (req, res) => {
  try {
    await login(req, res);
  } catch (err) {
    console.error("[auth.routes.login]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// OAUTH LOGIN
router.post("/oauth", async (req, res) => {
  try {
    await oauthLogin(req, res);
  } catch (err) {
    console.error("[auth.routes.oauth]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// TEST PROTECTED ROUTE 
router.get("/me", auth, async (req, res) => {
  try {
    console.log('[auth.routes.me] Request user ID:', req.user?.id);
    
    if (!req.user || !req.user.id) {
      console.log('[auth.routes.me] No user in request');
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        is_active: true,
        created_at: true,
        studentProfile: {
          select: { id: true, full_name: true }
        },
        instructorProfile: {
          select: { 
            id: true, 
            full_name: true, 
            is_verified: true, 
            is_pending_approval: true,
            qualifications: true,
            experience_years: true
          }
        }
      }
    });

    console.log('[auth.routes.me] User found:', !!user);
    if (user) {
      console.log('[auth.routes.me] User role:', user.role);
      console.log('[auth.routes.me] Has instructor profile:', !!user.instructorProfile);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (err) {
    console.error("[auth.routes.me] Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
