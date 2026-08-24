import { apiClient } from "@lib/api-client";

export interface Workspace {
  id: string;
  name: string;
}

export async function getMyWorkspace(): Promise<Workspace> {
  const response = await apiClient.get("/workspace");
  return response.data.data;
}