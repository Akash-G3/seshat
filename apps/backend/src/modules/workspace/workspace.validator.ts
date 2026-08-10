import { z } from "zod";

export const renameWorkspaceSchema = z.object({
  name: z.string().min(1),
});