'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BlogTableRow } from './blog-table-row';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Heading } from '@/components/ui/heading';
import { useRouter } from 'next/navigation';

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

interface BlogTableContentProps {
  posts: BlogPost[];
  workspaceSlug: string;
  currentPageId: string;
}

export function BlogTableContent({
  posts,
  workspaceSlug,
  currentPageId,
}: BlogTableContentProps) {
  const router = useRouter();

  const newPage = () => {
    router.push(`/${workspaceSlug}/blogs/${currentPageId}/new`);
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <Heading
            level="h3"
            variant="default"
            subtitle="Get started by creating your first blog post."
            subtitleVariant="muted"
            className="mb-6"
          >
            No blog posts found
          </Heading>
          <Button onClick={newPage}>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="w-12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Posts
            </TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tags
            </TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Author
            </TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Published / Modified
            </TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Traffic
            </TableHead>
            <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Leads
            </TableHead>
            <TableHead className="w-12 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <BlogTableRow
              key={post.id}
              post={post}
              workspaceSlug={workspaceSlug}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
