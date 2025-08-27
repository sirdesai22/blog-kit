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
  Eye,
  EyeOff,
  Hash,
  Tag,
  User,
  ChevronDown,
} from 'lucide-react';
import { Heading } from '@/components/ui/heading';
import { useRouter } from 'next/navigation';
import { BlogPost } from '@/types/blog';
import { BlogPostSort } from '@/modules/blogs/actions/blog-table-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { useBlogTable } from '@/modules/blogs/contexts/BlogTableContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { CategorySelectionDialog } from '@/modules/blogs/components/table/blogs/category-selection-dialog';
import { TagSelectionDialog } from '@/modules/blogs/components/table/blogs/tag-selection-dialog';
import { AuthorSelectionDialog } from '@/modules/blogs/components/table/blogs/author-selection-dialog';
import {
  bulkPublishPosts,
  bulkUnpublishPosts,
  bulkUpdateCategories,
  bulkUpdateTags,
  bulkUpdateAuthor,
  bulkDeletePosts,
  bulkArchivePosts,
} from '@/modules/blogs/actions/post-bulk-actions';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

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

function BulkActions({
  selectedCount,
  selectedIds,
  onClearSelection,
  workspaceSlug,
  currentPageId,
}: {
  selectedCount: number;
  selectedIds: Set<string>;
  onClearSelection: () => void;
  workspaceSlug: string;
  currentPageId: string;
}) {
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [showAuthorDialog, setShowAuthorDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  const selectedPostIds = Array.from(selectedIds);

  const refreshTable = () => {
    queryClient.invalidateQueries({
      queryKey: ['blog-posts-table', workspaceSlug, currentPageId],
    });

    queryClient.invalidateQueries({
      queryKey: ['workspace-categories', workspaceSlug, currentPageId],
    });
    queryClient.invalidateQueries({
      queryKey: ['workspace-tags', workspaceSlug, currentPageId],
    });
    queryClient.invalidateQueries({
      queryKey: ['workspace-authors', workspaceSlug],
    });
  };

  const handleBulkAction = async (
    action: () => Promise<{
      success: boolean;
      message?: string;
      error?: string;
    }>,
    loadingMessage: string
  ) => {
    setIsLoading(true);
    const toastId = toast.loading(loadingMessage);

    try {
      const result = await action();

      if (result.success) {
        toast.success(result.message || 'Action completed successfully', {
          id: toastId,
        });
        onClearSelection();
        // Refresh the table data
        refreshTable();
      } else {
        toast.error(result.error || 'Action failed', {
          id: toastId,
        });
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error('An unexpected error occurred', {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = () => {
    handleBulkAction(
      () => bulkPublishPosts(workspaceSlug, selectedPostIds),
      'Publishing posts...'
    );
  };

  const handleUnpublish = () => {
    handleBulkAction(
      () => bulkUnpublishPosts(workspaceSlug, selectedPostIds),
      'Unpublishing posts...'
    );
  };

  const handleArchive = () => {
    handleBulkAction(
      () => bulkArchivePosts(workspaceSlug, selectedPostIds),
      'Archiving posts...'
    );
  };

  const handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete ${selectedCount} post${
          selectedCount > 1 ? 's' : ''
        }? This action cannot be undone.`
      )
    ) {
      handleBulkAction(
        () => bulkDeletePosts(workspaceSlug, selectedPostIds),
        'Deleting posts...'
      );
    }
  };

  const handleCategoryUpdate = (categoryIds: string[]) => {
    handleBulkAction(
      () => bulkUpdateCategories(workspaceSlug, selectedPostIds, categoryIds),
      'Updating categories...'
    );
  };

  const handleTagUpdate = (tagIds: string[]) => {
    handleBulkAction(
      () => bulkUpdateTags(workspaceSlug, selectedPostIds, tagIds),
      'Updating tags...'
    );
  };

  const handleAuthorUpdate = (authorId: string) => {
    handleBulkAction(
      () => bulkUpdateAuthor(workspaceSlug, selectedPostIds, authorId),
      'Updating author...'
    );
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} post{selectedCount > 1 ? 's' : ''} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Individual action buttons */}
          <Button
            size="sm"
            variant="outline"
            className="h-7"
            onClick={handlePublish}
            disabled={isLoading}
          >
            <Eye className="mr-1 h-3 w-3" />
            Publish
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-7"
            onClick={handleUnpublish}
            disabled={isLoading}
          >
            <EyeOff className="mr-1 h-3 w-3" />
            Unpublish
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-7"
            onClick={() => setShowCategoryDialog(true)}
            disabled={isLoading}
          >
            <Hash className="mr-1 h-3 w-3" />
            Change Category
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-7"
            onClick={() => setShowTagDialog(true)}
            disabled={isLoading}
          >
            <Tag className="mr-1 h-3 w-3" />
            Change Tag
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-7"
            onClick={() => setShowAuthorDialog(true)}
            disabled={isLoading}
          >
            <User className="mr-1 h-3 w-3" />
            Change Author
          </Button>

          {/* Bulk Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-7"
                disabled={isLoading}
              >
                Bulk Actions
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
            className="h-7"
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <CategorySelectionDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        onSave={handleCategoryUpdate}
        workspaceSlug={workspaceSlug}
        pageId={currentPageId}
      />

      <TagSelectionDialog
        open={showTagDialog}
        onOpenChange={setShowTagDialog}
        onSave={handleTagUpdate}
        workspaceSlug={workspaceSlug}
        pageId={currentPageId}
      />

      <AuthorSelectionDialog
        open={showAuthorDialog}
        onOpenChange={setShowAuthorDialog}
        onSave={handleAuthorUpdate}
        workspaceSlug={workspaceSlug}
        pageId={currentPageId}
      />
    </>
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
          selectedIds={selectedIds}
          onClearSelection={clearSelection}
          workspaceSlug={workspaceSlug}
          currentPageId={currentPageId}
        />
      )}

      <div className="relative max-w-[80vw] overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected(allPostIds)}
                  ref={(el: any) => {
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
