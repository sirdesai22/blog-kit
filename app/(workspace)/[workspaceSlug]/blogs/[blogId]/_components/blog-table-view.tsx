"use client";

import { useState, useMemo, useEffect, useRef } from "react"; // Add useRef
import { BlogTableHeader } from "./blog-table-header";
import { BlogTableFilters } from "./blog-table-filters";
import { BlogTableContent } from "./blog-table-content";
import { BlogTablePagination } from "./blog-table-pagination";
import { BlogPost } from "@/types/blog";
import {
  BlogTableProvider,
  useBlogTable,
} from "@/modules/blogs/contexts/BlogTableContext";
import { useBlogPostsTable } from "@/modules/blogs/hooks/use-blog-posts-table-enhanced";
import {
  BlogPostFilters,
  BlogPostSort,
  BlogPostPagination,
} from "@/modules/blogs/actions/blog-table-actions";
import { useDebounce } from "@/hooks/use-debounce";

interface BlogTableViewProps {
  workspaceSlug: string;
  currentPage: {
    id: string;
    title: string;
    type: string;
  };
}

function BlogTable({ workspaceSlug, currentPage }: BlogTableViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [authorFilters, setAuthorFilters] = useState<string[]>([]);
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<BlogPostSort>({
    field: "createdAt",
    direction: "desc",
  });

  // Track if we've ever had successful data
  const hasEverLoadedData = useRef(false);

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

  // Fetch data with the new API-based hook
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

  // Update the ref when we successfully get data
  useEffect(() => {
    if (queryResult?.success) {
      hasEverLoadedData.current = true;
    }
  }, [queryResult?.success]);

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
    return queryResult?.success ? queryResult.blogPosts || [] : [];
  }, [queryResult]);
  const paginationInfo = queryResult?.pagination;

  // More robust loading state logic
  const isInitialLoading = isLoading && !hasEverLoadedData.current;
  const isRefetching = isFetching && hasEverLoadedData.current;

  const processedPosts = useMemo(() => {
    return blogPosts.map((post) => ({
      ...post,
      pinned: pinnedIds.has(post.id) || post.pinned,
    }));
  }, [blogPosts, pinnedIds]);

  const handlePageChange = (page: number) => {
    setCurrentPageNum(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPageNum(1);
  };

  const handleSort = (field: BlogPostSort["field"]) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPageNum(1);
  };

  if (error && !hasEverLoadedData.current) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">
            Error loading blog posts
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {error instanceof Error ? error.message : "Something went wrong"}
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
          loading={isInitialLoading} // Only disable inputs during true initial loading
          fetching={isRefetching} // Show loading indicators during refetch
          workspaceSlug={workspaceSlug}
          pageId={currentPage.id}
          sortConfig={sortConfig}
          onSort={handleSort}
        />

        <div className="flex-1 overflow-y-auto">
          <BlogTableContent
            posts={processedPosts}
            workspaceSlug={workspaceSlug}
            currentPageId={currentPage.id}
            loading={isInitialLoading} // Only show skeleton during true initial loading
            onSort={handleSort}
            sortConfig={sortConfig}
          />
        </div>

        {paginationInfo && (
          <BlogTablePagination
            pagination={paginationInfo}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={isInitialLoading} // Only disable pagination during true initial loading
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
