'use client';

import { useQuery } from '@tanstack/react-query';
import { getWorkspaceAuthors } from '../actions/blog-actions';
import { getWorkspaceCategoriesWithStats } from '../actions/category-actions';
import { getWorkspaceTagsWithStats } from '../actions/tag-actions-new';

export function useBlogFilterOptions(workspaceSlug: string, pageId: string) {
  // ✅ Pass pageId to get categories for specific page
  const categoriesQuery = useQuery({
    queryKey: ['workspace-categories', workspaceSlug, pageId],
    queryFn: () => getWorkspaceCategoriesWithStats(workspaceSlug, pageId),
    enabled: !!workspaceSlug && !!pageId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // ✅ Pass pageId to get tags for specific page
  const tagsQuery = useQuery({
    queryKey: ['workspace-tags', workspaceSlug, pageId],
    queryFn: () => getWorkspaceTagsWithStats(workspaceSlug, pageId),
    enabled: !!workspaceSlug && !!pageId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Authors remain workspace-wide
  const authorsQuery = useQuery({
    queryKey: ['workspace-authors', workspaceSlug],
    queryFn: () => getWorkspaceAuthors(workspaceSlug),
    enabled: !!workspaceSlug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  return {
    categories: categoriesQuery.data?.categories || [],
    tags: tagsQuery.data?.tags || [],
    authors: authorsQuery.data || [],
    isLoading:
      categoriesQuery.isLoading ||
      tagsQuery.isLoading ||
      authorsQuery.isLoading,
  };
}
