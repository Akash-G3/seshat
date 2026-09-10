import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  attachTag,
  createTag,
  deleteTag,
  detachTag,
  getNoteTags,
  getTags,
  renameTag,
} from "../api/tag.api";

export function useTags(workspaceId: string) {
  return useQuery({
    queryKey: ["tags", workspaceId],
    queryFn: () => getTags(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useNoteTags(noteId: string) {
  return useQuery({
    queryKey: ["note-tags", noteId],
    queryFn: () => getNoteTags(noteId),
    enabled: !!noteId,
  });
}

export function useCreateTag(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createTag(workspaceId, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tags", workspaceId] }),
  });
}

export function useRenameTag(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameTag(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tags", workspaceId] }),
  });
}

export function useDeleteTag(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["note-tags"] });
    },
  });
}

export function useAttachTag(noteId: string, workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tagId: string) => attachTag(noteId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note-tags", noteId] });
      queryClient.invalidateQueries({ queryKey: ["tags", workspaceId] });
    },
  });
}

export function useDetachTag(noteId: string, workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tagId: string) => detachTag(noteId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note-tags", noteId] });
      queryClient.invalidateQueries({ queryKey: ["tags", workspaceId] });
    },
  });
}
