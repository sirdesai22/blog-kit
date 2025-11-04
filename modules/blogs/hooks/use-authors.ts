'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getWorkspaceAuthors,
  addAuthor,
  updateAuthor,
  deleteAuthor,
} from '@/modules/workspace/actions/workspace-actions';

// Types
interface Author {
  id: string;
  name: string;
  bio?: string;
  image?: string;
  email?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  posts: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateAuthorData {
  name: string;
  bio?: string;
  email?: string;
  website?: string;
  image?: string;
  socialLinks?: Record<string, string>;
}

interface UpdateAuthorData {
  name: string;
  bio?: string;
  email?: string;
  website?: string;
  image?: string;
  socialLinks?: Record<string, string>;
}

// Main hook for authors query
export function useAuthors(workspaceSlug: string) {
  return useQuery({
    queryKey: ['authors', workspaceSlug],
    queryFn: () => getWorkspaceAuthors(workspaceSlug),
    enabled: !!workspaceSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook for creating authors
export function useCreateAuthor(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAuthorData) => addAuthor(workspaceSlug, data),

    // Optimistic update
    onMutate: async (newAuthor) => {
      const queryKey = ['authors', workspaceSlug];

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        const optimisticAuthor: Author = {
          id: `temp-${Date.now()}`, // Temporary ID
          name: newAuthor.name,
          bio: newAuthor.bio,
          email: newAuthor.email,
          website: newAuthor.website,
          image: newAuthor.image,
          socialLinks: newAuthor.socialLinks,
          posts: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return {
          ...old,
          authors: [...old.authors, optimisticAuthor],
        };
      });

      return { previousData };
    },

    // On error, rollback
    onError: (err, newAuthor, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['authors', workspaceSlug],
          context.previousData
        );
      }

      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create author';
      toast.error(errorMessage);
    },

    // On success, invalidate to get real data
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['authors', workspaceSlug],
      });
      toast.success('Author created successfully!');
    },
  });
}

// Hook for updating authors
export function useUpdateAuthor(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      authorId,
      data,
    }: {
      authorId: string;
      data: UpdateAuthorData;
    }) => updateAuthor(workspaceSlug, authorId, data),

    // Optimistic update
    onMutate: async ({ authorId, data }) => {
      const queryKey = ['authors', workspaceSlug];

      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          authors: old.authors.map((author: Author) =>
            author.id === authorId
              ? { ...author, ...data, updatedAt: new Date() }
              : author
          ),
        };
      });

      return { previousData };
    },

    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['authors', workspaceSlug],
          context.previousData
        );
      }

      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update author';
      toast.error(errorMessage);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['authors', workspaceSlug],
      });
      toast.success('Author updated successfully!');
    },
  });
}

// Hook for deleting authors
export function useDeleteAuthor(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (authorId: string) => deleteAuthor(workspaceSlug, authorId),

    // Optimistic update
    onMutate: async (authorId) => {
      const queryKey = ['authors', workspaceSlug];

      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          authors: old.authors.filter(
            (author: Author) => author.id !== authorId
          ),
        };
      });

      return { previousData };
    },

    onError: (err, authorId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['authors', workspaceSlug],
          context.previousData
        );
      }

      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete author';
      toast.error(errorMessage);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['authors', workspaceSlug],
      });
      toast.success('Author deleted successfully!');
    },
  });
}
