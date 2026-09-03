import { apiClient } from "@lib/api-client";
import type { Notebook } from "../types/workspace.types";

export async function getNotebooks(workspaceId: string): Promise<Notebook[]> {
  const response = await apiClient.get(`/notebooks/workspace/${workspaceId}`);
  return response.data.data;
}

export async function createNotebook(workspaceId: string, title: string): Promise<Notebook> {
  const response = await apiClient.post("/notebooks", { workspaceId, title });
  return response.data.data;
}

export async function renameNotebook(notebookId: string, title: string): Promise<Notebook> {
  const response = await apiClient.patch(`/notebooks/${notebookId}`, { title });
  return response.data.data;
}

export async function deleteNotebook(notebookId: string): Promise<void> {
  await apiClient.delete(`/notebooks/${notebookId}`);
}
