'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getWorkspaceCategoriesWithStats,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '../actions/category-actions';

// Types
interface CategoryWithStats {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  posts: number;
  traffic: number;
  leads: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateCategoryData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface UpdateCategoryData {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface ReorderData {
  id: string;
  order: number;
}

// Main hook for categories query
export function useCategories(workspaceSlug: string, blogId: string) {
  return useQuery({
    queryKey: ['categories', workspaceSlug, blogId],
    queryFn: () => getWorkspaceCategoriesWithStats(workspaceSlug, blogId),
    enabled: !!(workspaceSlug && blogId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook for creating categories
export function useCreateCategory(workspaceSlug: string, blogId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryData) =>
      createCategory(workspaceSlug, blogId, data),

    // Optimistic update
    onMutate: async (newCategory) => {
      const queryKey = ['categories', workspaceSlug, blogId];

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        const optimisticCategory: CategoryWithStats = {
          id: `temp-${Date.now()}`, // Temporary ID
          name: newCategory.name,
          slug: newCategory.name.toLowerCase().replace(/\s+/g, '-'),
          description: newCategory.description,
          color: newCategory.color,
          icon: newCategory.icon,
          posts: 0,
          traffic: 0,
          leads: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return {
          ...old,
          categories: [...old.categories, optimisticCategory],
        };
      });

      return { previousData };
    },

    // On error, rollback
    onError: (err, newCategory, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['categories', workspaceSlug, blogId],
          context.previousData
        );
      }
      toast.error('Failed to create category');
    },

    // On success, invalidate to get real data
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['categories', workspaceSlug, blogId],
      });
      toast.success('Category created successfully!');
    },
  });
}

// Hook for updating categories
export function useUpdateCategory(workspaceSlug: string, blogId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      data,
    }: {
      categoryId: string;
      data: UpdateCategoryData;
    }) => updateCategory(workspaceSlug, categoryId, data),

    // Optimistic update
    onMutate: async ({ categoryId, data }) => {
      const queryKey = ['categories', workspaceSlug, blogId];

      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          categories: old.categories.map((cat: CategoryWithStats) =>
            cat.id === categoryId
              ? { ...cat, ...data, updatedAt: new Date() }
              : cat
          ),
        };
      });

      return { previousData };
    },

    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['categories', workspaceSlug, blogId],
          context.previousData
        );
      }
      toast.error('Failed to update category');
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['categories', workspaceSlug, blogId],
      });
      toast.success('Category updated successfully!');
    },
  });
}

// Hook for deleting categories
export function useDeleteCategory(workspaceSlug: string, blogId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) =>
      deleteCategory(workspaceSlug, categoryId),

    // Optimistic update
    onMutate: async (categoryId) => {
      const queryKey = ['categories', workspaceSlug, blogId];

      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          categories: old.categories.filter(
            (cat: CategoryWithStats) => cat.id !== categoryId
          ),
        };
      });

      return { previousData };
    },

    onError: (err, categoryId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['categories', workspaceSlug, blogId],
          context.previousData
        );
      }
      toast.error('Failed to delete category');
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['categories', workspaceSlug, blogId],
      });
      toast.success('Category deleted successfully!');
    },
  });
}

// Hook for reordering categories
export function useReorderCategories(workspaceSlug: string, blogId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reorderData: ReorderData[]) =>
      reorderCategories(workspaceSlug, reorderData),

    // Optimistic update for reordering
    onMutate: async (reorderData) => {
      const queryKey = ['categories', workspaceSlug, blogId];

      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        // Create a map for quick lookup
        const orderMap = new Map(
          reorderData.map((item) => [item.id, item.order])
        );

        // Sort categories by new order
        const sortedCategories = [...old.categories].sort((a, b) => {
          const orderA = orderMap.get(a.id) ?? 999;
          const orderB = orderMap.get(b.id) ?? 999;
          return orderA - orderB;
        });

        return {
          ...old,
          categories: sortedCategories,
        };
      });

      return { previousData };
    },

    onError: (err, reorderData, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['categories', workspaceSlug, blogId],
          context.previousData
        );
      }
      toast.error('Failed to reorder categories');
    },

    onSuccess: () => {
      toast.success('Categories reordered successfully!');
    },
  });
}
