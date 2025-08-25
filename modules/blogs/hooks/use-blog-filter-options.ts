'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getBlogCategories,
  getWorkspaceAuthors,
} from '../actions/blog-actions';
import { getWorkspaceBlogTags } from '../actions/tag-actions';

export function useBlogFilterOptions(workspaceSlug: string) {
  // Get categories from workspace config
  const categoriesQuery = useQuery({
    queryKey: ['blog-categories', workspaceSlug],
    queryFn: () => getBlogCategories(workspaceSlug),
    enabled: !!workspaceSlug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Get tags from workspace config
  const tagsQuery = useQuery({
    queryKey: ['blog-tags', workspaceSlug],
    queryFn: () => getWorkspaceBlogTags(workspaceSlug),
    enabled: !!workspaceSlug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Get authors from workspace
  const authorsQuery = useQuery({
    queryKey: ['workspace-authors', workspaceSlug],
    queryFn: () => getWorkspaceAuthors(workspaceSlug),
    enabled: !!workspaceSlug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  return {
    categories: categoriesQuery.data || [],
    tags: tagsQuery.data?.tags || [],
    authors: authorsQuery.data || [],
    isLoading:
      categoriesQuery.isLoading ||
      tagsQuery.isLoading ||
      authorsQuery.isLoading,
    error: categoriesQuery.error || tagsQuery.error || authorsQuery.error,
  };
}
