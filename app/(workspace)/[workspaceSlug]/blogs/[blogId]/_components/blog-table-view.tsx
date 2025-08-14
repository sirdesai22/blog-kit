'use client';

import { useState } from 'react';
import { BlogTableHeader } from './blog-table-header';
import { BlogTableFilters } from './blog-table-filters';
import { BlogTableContent } from './blog-table-content';

// Dummy data
const dummyPosts = [
  {
    id: '1',
    title: 'How to market B2B products on Reddit',
    slug: 'how-to-market-b2b-products-on-reddit-1',
    type: 'BLOG',
    status: 'PUBLISHED' as const,
    createdAt: new Date('2025-06-25'),
    updatedAt: new Date('2025-06-28'),
    author: 'A',
    publishedAt: new Date('2025-06-25'),
  },
  {
    id: '2',
    title: 'How to market B2B products on Reddit',
    slug: 'how-to-market-b2b-products-on-reddit-2',
    type: 'BLOG',
    status: 'DRAFT' as const,
    createdAt: new Date('2025-06-30'),
    updatedAt: new Date('2025-06-30'),
    author: 'A',
    publishedAt: null,
  },
  {
    id: '3',
    title: 'How to market B2B products on Reddit',
    slug: 'how-to-market-b2b-products-on-reddit-3',
    type: 'BLOG',
    status: 'SCHEDULED' as const,
    createdAt: new Date('2025-06-28'),
    updatedAt: new Date('2025-06-30'),
    author: 'A',
    publishedAt: new Date('2025-06-28'),
  },
];

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
  createdAt: Date;
  updatedAt: Date;
  author: string;
  publishedAt: Date | null;
}

interface BlogTableViewProps {
  posts?: BlogPost[];
  workspaceSlug: string;
  currentPage: {
    id: string;
    title: string;
    type: string;
  };
}

export function BlogTableView({
  workspaceSlug,
  currentPage,
}: BlogTableViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Use dummy data for now
  const posts = dummyPosts;

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-white">
      <BlogTableHeader
        workspaceSlug={workspaceSlug}
        currentPageId={currentPage.id}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <BlogTableFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          postsCount={posts.length}
        />

        <BlogTableContent
          posts={filteredPosts}
          workspaceSlug={workspaceSlug}
          currentPageId={currentPage.id}
        />
      </div>
    </div>
  );
}
