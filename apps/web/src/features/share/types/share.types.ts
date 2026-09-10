export interface ShareLink {
  id: string;
  noteId: string | null;
  notebookId: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface CreatedShareLink extends Omit<ShareLink, "expiresAt" | "createdAt"> {
  expiresAt: string | null;
  createdAt: string;
  token: string;
}
