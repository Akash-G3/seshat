import { apiClient } from "@lib/api-client";
import type { Note, NoteSummary } from "../types/workspace.types";

export async function getNotes(): Promise<NoteSummary[]> {
  const response = await apiClient.get("/notes"); // scoped to current user server-side
  return response.data.data;
}

export async function createNote(payload: {
  workspaceId: string;
  notebookId?: string | null;
  title?: string;
}): Promise<Note> {
  const response = await apiClient.post("/notes", payload);
  return response.data.data;
}

export async function getNote(noteId: string): Promise<Note> {
  const response = await apiClient.get(`/notes/${noteId}`);
  return response.data.data;
}

export async function updateNote(
  noteId: string,
  payload: Partial<Pick<Note, "title" | "content">>
): Promise<Note> {
  const response = await apiClient.patch(`/notes/${noteId}`, payload);
  return response.data.data;
}

export async function deleteNote(noteId: string): Promise<void> {
  await apiClient.delete(`/notes/${noteId}`);
}