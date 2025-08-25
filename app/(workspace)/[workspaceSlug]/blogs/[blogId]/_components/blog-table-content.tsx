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
import {
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Archive,
} from 'lucide-react';
import { Heading } from '@/components/ui/heading';
import { useRouter } from 'next/navigation';
import { BlogPost } from '@/types/blog';
import { BlogPostSort } from '@/modules/blogs/actions/blog-table-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { useBlogTable } from '@/modules/blogs/contexts/BlogTableContext';
import { cn } from '@/lib/utils';

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
      <TableHead className="w-12">
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
      <TableHead className="sticky right-0 w-12 bg-muted/50">
        <Skeleton className="h-4 w-4" />
      </TableHead>
    </TableRow>
  );
}

// Bulk Actions Component
function BulkActions({
  selectedCount,
  onClearSelection,
}: {
  selectedCount: number;
  onClearSelection: () => void;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-200">
      <span className="text-sm font-medium text-blue-900">
        {selectedCount} post{selectedCount > 1 ? 's' : ''} selected
      </span>
      <div className="flex items-center gap-1 ml-4">
        <Button size="sm" variant="outline" className="h-7">
          <Archive className="mr-1 h-3 w-3" />
          Archive
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-red-600 hover:text-red-700"
        >
          <Trash2 className="mr-1 h-3 w-3" />
          Delete
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          className="h-7"
        >
          Cancel
        </Button>
      </div>
    </div>
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
  const {
    selectedIds,
    selectAll,
    clearSelection,
    isAllSelected,
    isIndeterminate,
  } = useBlogTable();

  const newPage = () => {
    router.push(`/${workspaceSlug}/blogs/${currentPageId}/new`);
  };

  const allPostIds = posts.map((post) => post.id);
  const selectedCount = selectedIds.size;
  const showBulkActions = selectedCount > 0;

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
      {showBulkActions && (
        <BulkActions
          selectedCount={selectedCount}
          onClearSelection={clearSelection}
        />
      )}

      <div className="relative max-w-[80vw] overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected(allPostIds)}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate(allPostIds);
                  }}
                  onCheckedChange={() => selectAll(allPostIds)}
                  aria-label="Select all posts"
                  disabled={loading}
                />
              </TableHead>
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
