import { apiClient } from "@lib/api-client";
import type { Tag } from "../types/tag.types";

export async function getTags(workspaceId?: string): Promise<Tag[]> {
  const response = await apiClient.get("/tags", {
    params: workspaceId ? { workspaceId } : undefined,
  });
  return response.data.data;
}

export async function createTag(workspaceId: string, name: string): Promise<Tag> {
  const response = await apiClient.post("/tags", { workspaceId, name });
  return response.data.data;
}

export async function renameTag(tagId: string, name: string): Promise<Tag> {
  const response = await apiClient.patch(`/tags/${tagId}`, { name });
  return response.data.data;
}

export async function deleteTag(tagId: string): Promise<void> {
  await apiClient.delete(`/tags/${tagId}`);
}

export async function getNoteTags(noteId: string): Promise<Tag[]> {
  const response = await apiClient.get(`/tags/note/${noteId}`);
  return response.data.data;
}

export async function attachTag(noteId: string, tagId: string): Promise<Tag> {
  const response = await apiClient.post(`/tags/note/${noteId}`, { tagId });
  return response.data.data;
}

export async function detachTag(noteId: string, tagId: string): Promise<void> {
  await apiClient.delete(`/tags/note/${noteId}/${tagId}`);
}
