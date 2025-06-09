import { Router } from "express";
import { loginHandler, meHandler } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

/**
 * POST /api/auth/login
 *   Body: { login, password }
 *   Ответ: { token, user: { userId, role, login } }
 */
router.post("/login", loginHandler);

/**
 * GET /api/auth/me
 *   Headers: Authorization: Bearer <token>
 *   Ответ: { user: { userId, role, login } }
 */
router.get("/me", authMiddleware, meHandler);

export default router;
