'use client';

import { useState, useMemo } from 'react';
import { BlogTableHeader } from './blog-table-header';
import { BlogTableFilters } from './blog-table-filters';
import { BlogTableContent } from './blog-table-content';
import { blogPostsMock, BlogPost } from '@/lib/mock-data';
import { BlogTableProvider, useBlogTable } from '@/contexts/BlogTableContext';

interface BlogTableViewProps {
  workspaceSlug: string;
  currentPage: {
    id: string;
    title: string;
    type: string;
  };
}

function BlogTable({
  workspaceSlug,
  currentPage,
}: Omit<BlogTableViewProps, 'posts'>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { pinnedIds } = useBlogTable();

  const posts = blogPostsMock;

  const filteredAndSortedPosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      const matchesSearch = post.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        post.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      const aIsPinned = pinnedIds.has(a.id);
      const bIsPinned = pinnedIds.has(b.id);
      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;
      return 0;
    });
  }, [posts, searchTerm, statusFilter, pinnedIds]);

  return (
    <div className="flex h-full flex-col bg-background ">
      <BlogTableHeader
        workspaceSlug={workspaceSlug}
        currentPageId={currentPage.id}
      />

      <div className="flex-1 overflow-y-auto">
        <div className=" md:w-[80vw] px-4 py-6 sm:px-6 lg:px-8">
          <BlogTableFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            postsCount={posts.length}
          />
          <BlogTableContent
            posts={filteredAndSortedPosts}
            workspaceSlug={workspaceSlug}
            currentPageId={currentPage.id}
          />
        </div>
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