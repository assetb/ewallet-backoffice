import { Router } from "express";
import {
  getMerchantsHandler,
  getRedemptionRequestsHandler,
  getHistoryHandler,
  getBalanceHandler,
  createRedemptionRequestHandler
} from "../controllers/financeController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = Router();

router.use(authMiddleware, roleMiddleware(["finance"]));

/**
 * GET /api/finance/merchants
 *   Ответ: [ { merchantId, merchantName } ]
 */
router.get("/merchants", getMerchantsHandler);

/**
 * GET /api/finance/redemption-requests
 *   Ответ: [RedemptionRequest]
 */
router.get("/redemption-requests", getRedemptionRequestsHandler);

/**
 * GET /api/finance/history
 *   Ответ: [HistoryRecord]
 */
router.get("/history", getHistoryHandler);

/**
 * GET /api/finance/balance
 *   Ответ: { balance }
 */
router.get("/balance", getBalanceHandler);

/**
 * POST /api/finance/redemption-requests
 *   Body: { merchantId, amount }
 *   Ответ: { success: true, requestId }
 */
router.post("/redemption-requests", createRedemptionRequestHandler);

export default router;
