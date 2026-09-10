import { apiClient } from "@lib/api-client";

export async function copyNote(payload: {
  id: string;
  notebookId?: string | null;
  title?: string;
}) {
  const { id, ...body } = payload;
  const response = await apiClient.post(`/export/notes/${id}/copy`, body);
  return response.data.data;
}

export async function copyNotebook(payload: {
  id: string;
  parentId?: string | null;
  title?: string;
}) {
  const { id, ...body } = payload;
  const response = await apiClient.post(`/export/notebooks/${id}/copy`, body);
  return response.data.data;
}

export async function exportNote(noteId: string, format: "md" | "json"): Promise<void> {
  const response = await apiClient.get(`/export/notes/${noteId}/export`, {
    params: { format },
    responseType: "blob",
  });

  const disposition = response.headers["content-disposition"] as string | undefined;
  const match = disposition?.match(/filename="([^"]+)"/);
  const fallback = `note.${format}`;
  const filename = match?.[1] ?? fallback;

  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
