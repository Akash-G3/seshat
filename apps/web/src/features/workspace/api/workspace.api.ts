import { apiClient } from "@lib/api-client";
import type { Workspace } from "../types/workspace.types";

export async function getMyWorkspace(): Promise<Workspace> {
  const response = await apiClient.get("/workspace");
  return response.data.data;
}
export async function renameWorkspace(name: string): Promise<Workspace> {
  const response = await apiClient.patch("/workspace", { name });
  return response.data.data;
}