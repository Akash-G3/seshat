import { apiClient } from "@lib/api-client";
import type { TrashItem } from "../types/trash.types";

export async function getTrash(workspaceId?: string): Promise<TrashItem[]> {
  const response = await apiClient.get("/trash", {
    params: workspaceId ? { workspaceId } : undefined,
  });
  return response.data.data;
}

export async function moveToTrash(type: "note" | "notebook", id: string): Promise<void> {
  await apiClient.post("/trash", { type, id });
}

export async function restoreFromTrash(type: "note" | "notebook", id: string): Promise<void> {
  await apiClient.post("/trash/restore", { type, id });
}

export async function permanentlyDelete(type: "note" | "notebook", id: string): Promise<void> {
  await apiClient.delete("/trash/item", { data: { type, id } });
}

export async function emptyTrash(): Promise<void> {
  await apiClient.delete("/trash");
}
