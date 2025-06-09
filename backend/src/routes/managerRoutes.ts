import { Router } from "express";
import {
  getUploadedFilesHandler,
  uploadFileMiddleware,
  uploadFileHandler
} from "../controllers/managerController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = Router();

/**
 * Все роуты защищены:
 *   - authMiddleware проверяет JWT
 *   - roleMiddleware(["manager"]) проверяет роль
 */
router.use(authMiddleware, roleMiddleware(["manager"]));

/**
 * GET /api/manager/uploaded-files
 *   Ответ: [UploadedFileRecord]
 */
router.get("/uploaded-files", getUploadedFilesHandler);

/**
 * POST /api/manager/upload
 *   FormData: file
 *   Ответ: { success: true, detail: { ... } }
 */
router.post("/upload", uploadFileMiddleware, uploadFileHandler);

export default router;
