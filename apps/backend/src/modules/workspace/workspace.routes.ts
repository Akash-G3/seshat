import { Router } from "express";
import { workspaceController } from "./workspace.controller";
import { requireAuth } from "../auth/auth.middleware";
import { validate } from "../../shared/middlewares/validate";
import { renameWorkspaceSchema } from "./workspace.validator";

const router = Router();

router.use(requireAuth);
router.get("/", workspaceController.getMine);
router.patch("/", validate(renameWorkspaceSchema), workspaceController.rename);

export default router;