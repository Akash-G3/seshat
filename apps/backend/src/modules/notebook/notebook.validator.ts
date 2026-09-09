// import { z } from 'zod';

// export const createNotebookSchema = z.object({
//   workspaceId: z.string(),
//   title: z.string().min(1),
// });
// //rename function
// export const renameNotebookSchema = z.object({
//   title: z.string().min(1),
// });


import { z } from 'zod';

export const createNotebookSchema = z.object({
  workspaceId: z.string(),
  title: z.string().min(1),
  // Omit or pass null to create the notebook at the workspace root.
  parentId: z.string().nullable().optional(),
});

//rename function
export const renameNotebookSchema = z.object({
  title: z.string().min(1),
});

// Move a notebook under a new parent (null = move to workspace root).
export const moveNotebookSchema = z.object({
  parentId: z.string().nullable(),
});