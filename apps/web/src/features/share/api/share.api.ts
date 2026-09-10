import { apiClient } from "@lib/api-client";
import type { CreatedShareLink, ShareLink } from "../types/share.types";

export async function listShareLinks(): Promise<ShareLink[]> {
  const response = await apiClient.get("/share");
  return response.data.data;
}

export async function createShareLink(payload: {
  type: "note" | "notebook";
  id: string;
  expiresAt?: string;
}): Promise<CreatedShareLink> {
  const response = await apiClient.post("/share", payload);
  return response.data.data;
}

export async function revokeShareLink(id: string): Promise<void> {
  await apiClient.delete(`/share/${id}`);
}

export async function getPublicShare(token: string): Promise<unknown> {
  const response = await apiClient.get(`/share/public/${token}`);
  return response.data.data;
}
