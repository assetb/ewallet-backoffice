import { Router } from "express";
import {
  getRedemptionRequestsHandler,
  getHistoryHandler,
  getBalanceHandler,
  confirmRedemptionHandler
} from "../controllers/supervisorController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = Router();

router.use(authMiddleware, roleMiddleware(["supervisor"]));

/**
 * GET /api/supervisor/redemption-requests
 *   Ответ: [RedemptionRequest]
 */
router.get("/redemption-requests", getRedemptionRequestsHandler);

/**
 * GET /api/supervisor/history
 *   Ответ: [HistoryRecord]
 */
router.get("/history", getHistoryHandler);

/**
 * GET /api/supervisor/balance
 *   Ответ: { balance }
 */
router.get("/balance", getBalanceHandler);

/**
 * POST /api/supervisor/confirm-redemption
 *   Body: { requestId }
 *   Ответ: { success: true }
 */
router.post("/confirm-redemption", confirmRedemptionHandler);

export default router;
