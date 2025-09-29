import { Router } from "express";
import { login, logout, homePage } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.post("/login", login);
router.post("/logout", authenticateToken, logout);
router.get("/homepage", authenticateToken, homePage);

export default router;
