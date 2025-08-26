'use client';

import { useState, useMemo, useEffect } from 'react';
import { BlogTableHeader } from './blog-table-header';
import { BlogTableFilters } from './blog-table-filters';
import { BlogTableContent } from './blog-table-content';
import { BlogTablePagination } from './blog-table-pagination';
import { BlogPost } from '@/types/blog';
import {
  BlogTableProvider,
  useBlogTable,
} from '@/modules/blogs/contexts/BlogTableContext';
import { useBlogPostsTable } from '@/modules/blogs/hooks/use-blog-posts-table';
import {
  BlogPostFilters,
  BlogPostSort,
  BlogPostPagination,
} from '@/modules/blogs/actions/blog-table-actions';
import { useDebounce } from '@/hooks/use-debounce';

interface BlogTableViewProps {
  workspaceSlug: string;
  currentPage: {
    id: string;
    title: string;
    type: string;
  };
  initialPosts?: BlogPost[];
}

function BlogTable({
  workspaceSlug,
  currentPage,
  initialPosts = [],
}: BlogTableViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [authorFilters, setAuthorFilters] = useState<string[]>([]);
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<BlogPostSort>({
    field: 'createdAt',
    direction: 'desc',
  });

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { pinnedIds } = useBlogTable();

  const filters: BlogPostFilters = useMemo(() => {
    const filterObj: BlogPostFilters = {};

    if (debouncedSearch) {
      filterObj.search = debouncedSearch;
    }

    if (statusFilters.length > 0) {
      filterObj.statuses = statusFilters as any[];
    }

    if (categoryFilters.length > 0) {
      filterObj.categories = categoryFilters;
    }

    if (tagFilters.length > 0) {
      filterObj.tags = tagFilters;
    }

    if (authorFilters.length > 0) {
      filterObj.authorIds = authorFilters;
    }

    return filterObj;
  }, [
    debouncedSearch,
    statusFilters,
    categoryFilters,
    tagFilters,
    authorFilters,
  ]);

  const pagination: BlogPostPagination = useMemo(
    () => ({
      page: currentPageNum,
      pageSize: pageSize,
    }),
    [currentPageNum, pageSize]
  );

  // Fetch data with TanStack Query
  const {
    data: queryResult,
    isLoading,
    isFetching,
    error,
  } = useBlogPostsTable({
    workspaceSlug,
    blogId: currentPage.id,
    filters,
    sort: sortConfig,
    pagination,
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPageNum(1);
  }, [
    debouncedSearch,
    statusFilters,
    categoryFilters,
    tagFilters,
    authorFilters,
  ]);

  const blogPosts = useMemo(() => {
    return queryResult?.success ? queryResult.blogPosts || [] : initialPosts;
  }, [queryResult?.success, queryResult?.blogPosts, initialPosts]);

  const paginationInfo = queryResult?.pagination;

  const processedPosts = useMemo(() => {
    return blogPosts
      .map((post) => ({
        ...post,
        pinned: pinnedIds.has(post.id) || post.pinned,
      }))
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0;
      });
  }, [blogPosts, pinnedIds]);

  const handlePageChange = (page: number) => {
    setCurrentPageNum(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPageNum(1); // Reset to first page when changing page size
  };

  const handleSort = (field: BlogPostSort['field']) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPageNum(1); // Reset to first page when sorting changes
  };

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">
            Error loading blog posts
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <BlogTableHeader
        workspaceSlug={workspaceSlug}
        currentPageId={currentPage.id}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        <BlogTableFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilters={statusFilters}
          setStatusFilters={setStatusFilters}
          categoryFilters={categoryFilters}
          setCategoryFilters={setCategoryFilters}
          tagFilters={tagFilters}
          setTagFilters={setTagFilters}
          authorFilters={authorFilters}
          setAuthorFilters={setAuthorFilters}
          postsCount={paginationInfo?.totalCount || blogPosts.length}
          loading={isLoading || isFetching}
          workspaceSlug={workspaceSlug}
          pageId={currentPage.id}
        />

        <div className="flex-1 overflow-y-auto">
          <BlogTableContent
            posts={processedPosts}
            workspaceSlug={workspaceSlug}
            currentPageId={currentPage.id}
            loading={isLoading}
            onSort={handleSort}
            sortConfig={sortConfig}
          />
        </div>

        {paginationInfo && (
          <BlogTablePagination
            pagination={paginationInfo}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={isLoading || isFetching}
          />
        )}
      </div>
    </div>
  );
}

export function BlogTableView(props: BlogTableViewProps) {
  return (
    <BlogTableProvider>
      <BlogTable {...props} />
    </BlogTableProvider>
  );
}
