import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createShareLink, listShareLinks, revokeShareLink } from "../api/share.api";

export function useShareLinks() {
  return useQuery({
    queryKey: ["share-links"],
    queryFn: listShareLinks,
  });
}

export function useCreateShareLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createShareLink,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["share-links"] }),
  });
}

export function useRevokeShareLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeShareLink,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["share-links"] }),
  });
}
