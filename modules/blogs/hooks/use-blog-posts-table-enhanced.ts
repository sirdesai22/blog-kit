'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  BlogPostFilters,
  BlogPostSort,
  BlogPostPagination,
  getBlogPostsForTable,
} from '../actions/blog-table-actions';
import { BlogPost } from '@/types/blog';

interface UseBlogPostsTableParams {
  workspaceSlug: string;
  blogId: string;
  filters?: BlogPostFilters;
  sort?: BlogPostSort;
  pagination?: BlogPostPagination;
}

interface BlogPostsTableResult {
  success: boolean;
  blogPosts?: BlogPost[];
  error?: string;
  pagination?: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Separate hook for base data (without filters/sort/pagination)
function useBaseBlogPosts(workspaceSlug: string, blogId: string) {
  return useQuery({
    queryKey: ['blog-posts-base', workspaceSlug, blogId],
    queryFn: () =>
      getBlogPostsForTable(
        workspaceSlug,
        blogId,
        {},
        { field: 'createdAt', direction: 'desc' },
        { page: 1, pageSize: 1000 }
      ), // Fetch all posts
    enabled: !!(workspaceSlug && blogId),
    staleTime: 5 * 60 * 1000, // 5 minutes - longer since we do client-side operations
    refetchOnWindowFocus: false,
  });
}

// Client-side filtering function
function filterPosts(posts: BlogPost[], filters: BlogPostFilters): BlogPost[] {
  return posts.filter((post) => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm));
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.statuses && filters.statuses.length > 0) {
      if (!filters.statuses.includes(post.status as any)) return false;
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      const hasMatchingCategory = post.categories.some((cat) =>
        filters.categories!.includes(cat.id)
      );
      if (!hasMatchingCategory) return false;
    }

    // Tag filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = post.tags.some((tag) =>
        filters.tags!.includes(tag.id)
      );
      if (!hasMatchingTag) return false;
    }

    // Author filter
    if (filters.authorIds && filters.authorIds.length > 0) {
      const matchesAuthor =
        (post.authorId && filters.authorIds.includes(post.authorId)) ||
        (post.coAuthorIds &&
          post.coAuthorIds.some((id) => filters.authorIds!.includes(id)));
      if (!matchesAuthor) return false;
    }

    return true;
  });
}

// Client-side sorting function
function sortPosts(posts: BlogPost[], sort: BlogPostSort): BlogPost[] {
  return [...posts].sort((a, b) => {
    // Always keep pinned posts at the top
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    let aValue: any;
    let bValue: any;

    switch (sort.field) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'publishedAt':
        aValue = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        bValue = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        aValue = new Date(a.updatedAt).getTime();
        bValue = new Date(b.updatedAt).getTime();
        break;
      case 'views':
        aValue = a.views || 0;
        bValue = b.views || 0;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// Client-side pagination function
function paginatePosts(posts: BlogPost[], pagination: BlogPostPagination) {
  const startIndex = (pagination.page - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const paginatedPosts = posts.slice(startIndex, endIndex);

  const totalCount = posts.length;
  const totalPages = Math.ceil(totalCount / pagination.pageSize);

  return {
    posts: paginatedPosts,
    pagination: {
      totalCount,
      totalPages,
      currentPage: pagination.page,
      pageSize: pagination.pageSize,
      hasNextPage: pagination.page < totalPages,
      hasPreviousPage: pagination.page > 1,
    },
  };
}

export function useBlogPostsTable({
  workspaceSlug,
  blogId,
  filters = {},
  sort = { field: 'createdAt', direction: 'desc' },
  pagination = { page: 1, pageSize: 10 },
}: UseBlogPostsTableParams): {
  data: BlogPostsTableResult | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
} {
  // Fetch base data only once
  const {
    data: baseData,
    isLoading,
    isFetching,
    error,
  } = useBaseBlogPosts(workspaceSlug, blogId);

  // Process data client-side
  const processedData = useMemo((): BlogPostsTableResult | undefined => {
    if (!baseData?.success || !baseData.blogPosts) {
      return baseData as BlogPostsTableResult;
    }

    // Apply filters
    const filteredPosts = filterPosts(baseData.blogPosts, filters);

    // Apply sorting
    const sortedPosts = sortPosts(filteredPosts, sort);

    // Apply pagination
    const { posts: paginatedPosts, pagination: paginationInfo } = paginatePosts(
      sortedPosts,
      pagination
    );

    return {
      success: true,
      blogPosts: paginatedPosts,
      pagination: paginationInfo,
    };
  }, [baseData, filters, sort, pagination]);

  return {
    data: processedData,
    isLoading,
    isFetching,
    error,
  };
}

// Hook for server-side operations when needed (for complex queries)
export function useBlogPostsTableServerSide(params: UseBlogPostsTableParams) {
  return useQuery({
    queryKey: [
      'blog-posts-table-server',
      params.workspaceSlug,
      params.blogId,
      params.filters,
      params.sort,
      params.pagination,
    ],
    queryFn: () =>
      getBlogPostsForTable(
        params.workspaceSlug,
        params.blogId,
        params.filters,
        params.sort,
        params.pagination
      ),
    enabled: !!(params.workspaceSlug && params.blogId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
}
