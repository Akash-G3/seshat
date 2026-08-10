import { Router } from "express";
import { notebookController } from "./notebook.controller";
import { requireAuth } from "../auth/auth.middleware";
import { validate } from "../../shared/middlewares/validate";
import { createNotebookSchema } from "./notebook.validator";

const router = Router();

router.use(requireAuth);
router.post("/", validate(createNotebookSchema), notebookController.create);
router.get("/workspace/:workspaceId", notebookController.listByWorkspace);
router.delete("/:id", notebookController.remove);

export default router;