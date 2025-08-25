'use client';

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BlogTableRow } from './blog-table-row';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Heading } from '@/components/ui/heading';
import { useRouter } from 'next/navigation';
import { BlogPost } from '@/types/blog';
import { BlogPostSort } from '@/modules/blogs/actions/blog-table-actions';
import { Skeleton } from '@/components/ui/skeleton';

interface BlogTableContentProps {
  posts: BlogPost[];
  workspaceSlug: string;
  currentPageId: string;
  loading?: boolean;
  onSort?: (field: BlogPostSort['field']) => void;
  sortConfig?: BlogPostSort;
}

function SortableHeader({
  children,
  field,
  onSort,
  sortConfig,
  className = '',
}: {
  children: React.ReactNode;
  field: BlogPostSort['field'];
  onSort?: (field: BlogPostSort['field']) => void;
  sortConfig?: BlogPostSort;
  className?: string;
}) {
  const isActive = sortConfig?.field === field;
  const direction = isActive ? sortConfig.direction : null;

  return (
    <TableHead className={className}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onSort?.(field)}
        className="h-auto p-0 font-medium hover:bg-transparent"
      >
        <span>{children}</span>
        {isActive ? (
          direction === 'asc' ? (
            <ArrowUp className="ml-1 h-3 w-3" />
          ) : (
            <ArrowDown className="ml-1 h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
        )}
      </Button>
    </TableHead>
  );
}

function LoadingRow() {
  return (
    <TableRow>
      <TableHead className="w-14">
        <Skeleton className="h-4 w-4 rounded" />
      </TableHead>
      <TableHead>
        <Skeleton className="h-4 w-32" />
      </TableHead>
      <TableHead>
        <Skeleton className="h-4 w-16" />
      </TableHead>
      <TableHead>
        <Skeleton className="h-4 w-20" />
      </TableHead>
      <TableHead>
        <Skeleton className="h-4 w-24" />
      </TableHead>
      <TableHead>
        <Skeleton className="h-4 w-20" />
      </TableHead>
      <TableHead>
        <Skeleton className="h-4 w-28" />
      </TableHead>
      <TableHead>
        <Skeleton className="h-4 w-12" />
      </TableHead>
      <TableHead>
        <Skeleton className="h-4 w-12" />
      </TableHead>
      <TableHead className="sticky right-0 w-12 bg-muted/50">
        <Skeleton className="h-4 w-4" />
      </TableHead>
    </TableRow>
  );
}

export function BlogTableContent({
  posts,
  workspaceSlug,
  currentPageId,
  loading = false,
  onSort,
  sortConfig,
}: BlogTableContentProps) {
  const router = useRouter();

  const newPage = () => {
    router.push(`/${workspaceSlug}/blogs/${currentPageId}/new`);
  };

  if (!loading && posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto">
          <Heading
            level="h3"
            variant="default"
            subtitle="Get started by creating your first blog post."
            subtitleVariant="muted"
          >
            No blog posts found
          </Heading>

          <Button onClick={newPage} className="mt-3">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="relative max-w-[80vw] overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-14"></TableHead>
              <SortableHeader
                field="title"
                onSort={onSort}
                sortConfig={sortConfig}
              >
                Posts
              </SortableHeader>
              <SortableHeader
                field="status"
                onSort={onSort}
                sortConfig={sortConfig}
              >
                Status
              </SortableHeader>
              <TableHead>Category</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Author</TableHead>
              <SortableHeader
                field="publishedAt"
                onSort={onSort}
                sortConfig={sortConfig}
              >
                Published / Modified
              </SortableHeader>
              <SortableHeader
                field="views"
                onSort={onSort}
                sortConfig={sortConfig}
              >
                Traffic
              </SortableHeader>
              <TableHead>Leads</TableHead>
              <TableHead className="sticky right-0 w-12 bg-muted/50 text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? // Show skeleton rows while loading
                Array.from({ length: 5 }).map((_, index) => (
                  <LoadingRow key={`loading-${index}`} />
                ))
              : posts.map((post) => (
                  <BlogTableRow
                    key={post.id}
                    post={post}
                    workspaceSlug={workspaceSlug}
                  />
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
