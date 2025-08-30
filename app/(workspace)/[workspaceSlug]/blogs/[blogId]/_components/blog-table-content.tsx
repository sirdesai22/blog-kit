"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BlogTableRow } from "./blog-table-row";
import { Button } from "@/components/ui/button";
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
  X,
} from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { useRouter } from "next/navigation";
import { BlogPost } from "@/types/blog";
import { BlogPostSort } from "@/modules/blogs/actions/blog-table-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { useBlogTable } from "@/modules/blogs/contexts/BlogTableContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { CategorySelectionDialog } from "@/modules/blogs/components/table/blogs/category-selection-dialog";
import { TagSelectionDialog } from "@/modules/blogs/components/table/blogs/tag-selection-dialog";
import { AuthorSelectionDialog } from "@/modules/blogs/components/table/blogs/author-selection-dialog";
import {
  bulkPublishPosts,
  bulkUnpublishPosts,
  bulkUpdateCategories,
  bulkUpdateTags,
  bulkUpdateAuthors, // Updated import
  bulkDeletePosts,
  bulkArchivePosts,
} from "@/modules/blogs/actions/post-bulk-actions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmationDialog } from "@/components/models/confirmation-dialog";
import { Separator } from "@/components/ui/separator";

interface BlogTableContentProps {
  posts: BlogPost[];
  workspaceSlug: string;
  currentPageId: string;
  loading?: boolean;
  onSort?: (field: BlogPostSort["field"]) => void;
  sortConfig?: BlogPostSort;
}

function SortableHeader({
  children,
  field,
  onSort,
  sortConfig,
  className = "",
}: {
  children: React.ReactNode;
  field: BlogPostSort["field"];
  onSort?: (field: BlogPostSort["field"]) => void;
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
        // onClick={() => onSort?.(field)}
        className="h-auto p-0 font-medium hover:bg-transparent !px-0"
      >
        <span>{children}</span>
        {/* {isActive ? (
          direction === "asc" ? (
            <ArrowUp className="ml-1 h-3 w-3" />
          ) : (
            <ArrowDown className="ml-1 h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
        )} */}
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // New state for the delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const queryClient = useQueryClient();
  const selectedPostIds = Array.from(selectedIds);

  const refreshTable = () => {
    queryClient.invalidateQueries({
      queryKey: ["blog-posts-base", workspaceSlug, currentPageId], // Updated to match enhanced hook
    });
    queryClient.invalidateQueries({
      queryKey: ["workspace-categories", workspaceSlug, currentPageId],
    });
    queryClient.invalidateQueries({
      queryKey: ["workspace-tags", workspaceSlug, currentPageId],
    });
    queryClient.invalidateQueries({
      queryKey: ["workspace-authors", workspaceSlug],
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
    setIsMenuOpen(false);
    setIsLoading(true);
    const toastId = toast.loading(loadingMessage);

    try {
      const result = await action();
      if (result.success) {
        toast.success(result.message || "Action completed successfully", {
          id: toastId,
        });
        onClearSelection();
        refreshTable();
      } else {
        toast.error(result.error || "Action failed", { id: toastId });
      }
    } catch (error) {
      console.error("Bulk action error:", error);
      toast.error("An unexpected error occurred", { id: toastId });
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false); // Ensure modal is closed on completion
    }
  };

  const handlePublish = () =>
    handleBulkAction(
      () => bulkPublishPosts(workspaceSlug, selectedPostIds),
      "Publishing posts..."
    );
  const handleUnpublish = () =>
    handleBulkAction(
      () => bulkUnpublishPosts(workspaceSlug, selectedPostIds),
      "Unpublishing posts..."
    );
  const handleArchive = () =>
    handleBulkAction(
      () => bulkArchivePosts(workspaceSlug, selectedPostIds),
      "Archiving posts..."
    );

  // This function is now called by the modal on confirmation
  const confirmDelete = () => {
    handleBulkAction(
      () => bulkDeletePosts(workspaceSlug, selectedPostIds),
      "Deleting posts..."
    );
  };

  const handleCategoryUpdate = (categoryIds: string[]) =>
    handleBulkAction(
      () => bulkUpdateCategories(workspaceSlug, selectedPostIds, categoryIds),
      "Updating categories..."
    );
  const handleTagUpdate = (tagIds: string[]) =>
    handleBulkAction(
      () => bulkUpdateTags(workspaceSlug, selectedPostIds, tagIds),
      "Updating tags..."
    );
  const handleAuthorUpdate = (
    authorIds: string[] // Changed parameter name and type
  ) =>
    handleBulkAction(
      () => bulkUpdateAuthors(workspaceSlug, selectedPostIds, authorIds), // Updated function call
      "Updating authors..."
    );
  const handleCancel = () => {
    onClearSelection();
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className="relative left-30 ">
        {isMenuOpen && (
          <div className="absolute bottom-full w-[98%] origin-bottom rounded-xl bg-white shadow-xl ring-[1px] ring-black/10 focus:outline-none z-10 mb-2">
            <div className="p-1" role="menu" aria-orientation="vertical">
              <p className="px-3 py-1.5 text-small">Edit</p>
              <Button
                variant="ghost"
                className="w-full text-normal justify-start h-8 px-2"
                onClick={handlePublish}
                disabled={isLoading}
              >
                <Eye className="mr-2 h-4 w-4" />
                Publish
              </Button>
              <Button
                variant="ghost"
                className="w-full text-normal justify-start h-8 px-2"
                onClick={handleUnpublish}
                disabled={isLoading}
              >
                <EyeOff className="mr-2 h-4 w-4" />
                Unpublish
              </Button>
              <Button
                variant="ghost"
                className="w-full text-normal justify-start h-8 px-2"
                onClick={() => setShowCategoryDialog(true)}
                disabled={isLoading}
              >
                <Hash className="mr-2 h-4 w-4" />
                Change Category
              </Button>
              <Button
                variant="ghost"
                className="w-full text-normal justify-start h-8 px-2"
                onClick={() => setShowTagDialog(true)}
                disabled={isLoading}
              >
                <Tag className="mr-2 h-4 w-4" />
                Change Tag
              </Button>
              <Button
                variant="ghost"
                className="w-full text-normal justify-start h-8 px-2"
                onClick={() => setShowAuthorDialog(true)}
                disabled={isLoading}
              >
                <User className="mr-2 h-4 w-4" />
                Change Author
              </Button>

              <p className="px-3 py-1.5 text-small">Actions</p>
              <Button
                variant="ghost"
                className="w-full text-normal justify-start h-8 px-2"
                onClick={handleArchive}
                disabled={isLoading}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
              <Button
                variant="ghost"
                className="w-full text-normal justify-start h-8 px-2 text-red-600 hover:text-red-700 focus:text-red-700"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>

              <Separator />

              <Button
                variant="ghost"
                className="w-full text-normal justify-start h-8 px-2"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        <Button
          size="sm"
          variant="outline"
          className="h-10 px-4 bg-white shadow-xl rounded-full flex items-center gap-3"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          disabled={isLoading}
        >
          <span className="font-semibold text-blue-800">
            {selectedCount} post{selectedCount > 1 ? "s" : ""} selected
          </span>
          <div className="h-5 border-l border-gray-300"></div>
          <span className="font-medium">Bulk Actions</span>
          <ChevronDown
            className="ml-1 h-4 w-4 transition-transform"
            style={{ transform: !isMenuOpen ? "rotate(180deg)" : "none" }}
          />
        </Button>
      </div>

      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={confirmDelete}
        title={`Delete ${selectedCount} post${selectedCount > 1 ? "s" : ""}?`}
        description="This action cannot be undone. This will permanently delete the selected posts."
        confirmButtonLabel="Delete"
        theme="danger"
        isConfirming={isLoading}
      />

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
        onSave={handleAuthorUpdate} // This now receives string[] instead of string
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

  // --- ANIMATION STATE MANAGEMENT START ---
  const [isAnimating, setIsAnimating] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    const show = selectedCount > 0;
    if (show) {
      setIsRendered(true);
      setTimeout(() => setIsAnimating(true), 10); // Animate in
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsRendered(false), 300); // Wait for animation to finish before unmounting
    }
  }, [selectedCount]);
  // --- ANIMATION STATE MANAGEMENT END ---

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
    <div className="overflow-hidden">
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-12 pl-4">
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
                className="min-w-[300px] w-[20%]"
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
              <TableHead>Published</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead className="sticky right-0 w-12 bg-muted/50 text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
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

      {isRendered && (
        <div
          className={cn(
            "fixed bottom-20 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ease-in-out",
            isAnimating
              ? "translate-y-0 opacity-100"
              : "translate-y-20 opacity-0"
          )}
        >
          <BulkActions
            selectedCount={selectedCount}
            selectedIds={selectedIds}
            onClearSelection={clearSelection}
            workspaceSlug={workspaceSlug}
            currentPageId={currentPageId}
          />
        </div>
      )}
    </div>
  );
}
