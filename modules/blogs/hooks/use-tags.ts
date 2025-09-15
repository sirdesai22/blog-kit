'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getWorkspaceTagsWithStats,
  createTag,
  updateTag,
  deleteTag,
} from '../actions/tag-actions-new';

// Types
interface TagWithStats {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  workspaceId: string;
  pageId: string;
  posts: number;
  traffic: number;
  leads: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateTagData {
  name: string;
  description?: string;
  color?: string;
}

interface UpdateTagData {
  name?: string;
  description?: string;
  color?: string;
}

// Main hook for tags query
export function useTags(workspaceSlug: string, blogId: string) {
  return useQuery({
    queryKey: ['tags', workspaceSlug, blogId],
    queryFn: () => getWorkspaceTagsWithStats(workspaceSlug, blogId),
    enabled: !!(workspaceSlug && blogId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook for creating tags
export function useCreateTag(workspaceSlug: string, blogId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTagData) => createTag(workspaceSlug, blogId, data),

    // Optimistic update
    onMutate: async (newTag) => {
      const queryKey = ['tags', workspaceSlug, blogId];

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        const optimisticTag: TagWithStats = {
          id: `temp-${Date.now()}`, // Temporary ID
          name: newTag.name,
          slug: newTag.name.toLowerCase().replace(/\s+/g, '-'),
          description: newTag.description,
          color: newTag.color,
          workspaceId: old.workspaceId,
          pageId: blogId,
          posts: 0,
          traffic: 0,
          leads: 0,
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return {
          ...old,
          tags: [...old.tags, optimisticTag],
        };
      });

      return { previousData };
    },

    // On error, rollback
    onError: (err, newTag, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['tags', workspaceSlug, blogId],
          context.previousData
        );
      }
      toast.error('Failed to create tag');
    },

    // On success, invalidate to get real data
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['tags', workspaceSlug, blogId],
      });
      toast.success('Tag created successfully!');
    },
  });
}

// Hook for updating tags
export function useUpdateTag(workspaceSlug: string, blogId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tagId, data }: { tagId: string; data: UpdateTagData }) =>
      updateTag(workspaceSlug, tagId, data),

    // Optimistic update
    onMutate: async ({ tagId, data }) => {
      const queryKey = ['tags', workspaceSlug, blogId];

      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          tags: old.tags.map((tag: TagWithStats) =>
            tag.id === tagId ? { ...tag, ...data, updatedAt: new Date() } : tag
          ),
        };
      });

      return { previousData };
    },

    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['tags', workspaceSlug, blogId],
          context.previousData
        );
      }
      toast.error('Failed to update tag');
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tags', workspaceSlug, blogId],
      });
      toast.success('Tag updated successfully!');
    },
  });
}

// Hook for deleting tags
export function useDeleteTag(workspaceSlug: string, blogId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagId: string) => deleteTag(workspaceSlug, tagId),

    // Optimistic update
    onMutate: async (tagId) => {
      const queryKey = ['tags', workspaceSlug, blogId];

      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          tags: old.tags.filter((tag: TagWithStats) => tag.id !== tagId),
        };
      });

      return { previousData };
    },

    onError: (err, tagId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['tags', workspaceSlug, blogId],
          context.previousData
        );
      }
      toast.error('Failed to delete tag');
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tags', workspaceSlug, blogId],
      });
      toast.success('Tag deleted successfully!');
    },
  });
}

// Hook for reordering tags (if needed later)
// Note: The new tag system doesn't have explicit ordering yet,
// but we can add it similar to how categories work
export function useReorderTags(workspaceSlug: string, blogId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reorderedTagIds: string[]) => {
      // This would need to be implemented in tag-actions-new.ts
      // For now, just return a promise that resolves immediately
      return Promise.resolve();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tags', workspaceSlug, blogId],
      });
      toast.success('Tags reordered successfully!');
    },

    onError: () => {
      toast.error('Failed to reorder tags');
    },
  });
}
