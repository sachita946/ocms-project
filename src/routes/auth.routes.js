import { Router } from "express";
import { signup, login, oauthLogin } from "../controllers/auth.controller.js";

import { auth } from "../middleware/auth.js";
import { success, error } from "../utils/json.js";

const router = Router();

//SIGNUP 
router.post("/signup", async (req, res) => {
  try {
    await signup(req, res);
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
});
//login
router.post("/login", async (req, res) => {
  try {
    await login(req, res);
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
});

// OAUTH LOGIN
router.post("/oauth", async (req, res) => {
  try {
    await oauthLogin(req, res);
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
});

// TEST PROTECTED ROUTE 
router.get("/me", auth, async (req, res) => {
  try {
    return success(res, { user: req.user, studentProfileId: req.studentProfileId, instructorProfileId: req.instructorProfileId });
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
});

export default router;
