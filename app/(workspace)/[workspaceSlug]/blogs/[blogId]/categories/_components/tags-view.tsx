'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

// Icons
import { ExternalLink, MoreVertical, Trash2 } from 'lucide-react';

// Drag and Drop
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ✅ Use the new hooks instead of direct actions
import {
  useTags,
  useUpdateTag,
  useDeleteTag,
  useReorderTags,
} from '@/modules/blogs/hooks/use-tags';

// Types
interface TagWithStats {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  workspaceId: string;
  pageId: string;
  posts: number;
  traffic: number;
  leads: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface BlogTagsViewProps {
  workspaceSlug: string;
  blogId: string;
}

// Redesigned Sortable Row Component for Tags
function SortableTableRow({
  tag,
  onEdit,
  onDelete,
}: {
  tag: TagWithStats;
  onEdit: (tag: TagWithStats) => void;
  onDelete: (tag: TagWithStats) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tag.id }); // ✅ Use tag.id instead of tag.name

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className="group cursor-grab"
      {...attributes}
    >
      <TableCell className="font-medium pl-lg" {...listeners}>
        <Link
          href={`/blog/tags/${tag.slug}`} // ✅ Use tag.slug instead of tag.name
          passHref
          className="flex items-center gap-1.5 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-normal">{tag.name}</span>
        </Link>
      </TableCell>
      <TableCell>{tag.posts}</TableCell>
      <TableCell
        className="sticky right-0 bg-background group-hover:bg-accent/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" className="text-normal-muted">
            View Posts
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-normal-muted"
            onClick={() => onEdit(tag)}
          >
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4 text-normal-muted" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(tag)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function BlogTagsView({ workspaceSlug, blogId }: BlogTagsViewProps) {
  // ✅ Use TanStack Query hooks
  const { data: tagsData, isLoading, error } = useTags(workspaceSlug, blogId);
  const updateTagMutation = useUpdateTag(workspaceSlug, blogId);
  const deleteTagMutation = useDeleteTag(workspaceSlug, blogId);
  const reorderTagsMutation = useReorderTags(workspaceSlug, blogId);

  // Local state for dialogs
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagWithStats | null>(null);
  const [editTagName, setEditTagName] = useState('');
  const [editTagDescription, setEditTagDescription] = useState('');

  const tags = tagsData?.tags || [];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tags.findIndex((t) => t.id === active.id);
      const newIndex = tags.findIndex((t) => t.id === over.id);
      const newTags = arrayMove(tags, oldIndex, newIndex);

      const reorderedTagIds = newTags.map((tag) => tag.id);
      reorderTagsMutation.mutate(reorderedTagIds);
    }
  };

  const handleEditTag = async () => {
    if (!selectedTag || !editTagName.trim()) return;

    updateTagMutation.mutate(
      {
        tagId: selectedTag.id,
        data: {
          name: editTagName.trim(),
          description: editTagDescription.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
        },
      }
    );
  };

  const handleDeleteTag = async () => {
    if (!selectedTag) return;

    deleteTagMutation.mutate(selectedTag.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      },
    });
  };

  if (error) {
    return <div>Error loading tags</div>;
  }

  return (
    <>
      <CardTitle className="text-sm ml-lg mb-sm text-normal">
        {tags.length} <span className="text-small">Tags</span>
      </CardTitle>
      <div className="overflow-hidden">
        <div className="relative w-full overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="pl-lg w-full">Tag</TableHead>
                  <TableHead className="min-w-[200px]">Posts</TableHead>
                  <TableHead className="sticky right-0 w-12 text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-12 text-center text-muted-foreground"
                    >
                      No tags yet. Create your first tag to organize your blog
                      posts.
                    </TableCell>
                  </TableRow>
                ) : isLoading ? (
                  // ✅ Skeleton rows (not complete table)
                  <>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <TableRow key={`loading-${index}`} className="group">
                        <TableCell className="pl-lg">
                          <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                        </TableCell>
                        <TableCell>
                          <div className="h-5 w-8 bg-muted animate-pulse rounded" />
                        </TableCell>
                        <TableCell className="sticky right-0 bg-background">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                            <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : (
                  <SortableContext
                    items={tags.map((tag) => tag.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {tags.map((tag) => (
                      <SortableTableRow
                        key={tag.id}
                        tag={tag}
                        onEdit={(t) => {
                          setSelectedTag(t);
                          setEditTagName(t.name);
                          setEditTagDescription(t.description || '');
                          setIsEditDialogOpen(true);
                        }}
                        onDelete={(t) => {
                          setSelectedTag(t);
                          setIsDeleteDialogOpen(true);
                        }}
                      />
                    ))}
                  </SortableContext>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-tag-name">Tag Name</Label>
              <Input
                id="edit-tag-name"
                value={editTagName}
                onChange={(e) => setEditTagName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tag-description">Description</Label>
              <Textarea
                id="edit-tag-description"
                value={editTagDescription}
                onChange={(e) => setEditTagDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditTag}
              disabled={updateTagMutation.isPending}
            >
              {updateTagMutation.isPending ? 'Updating...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedTag?.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTag}
              disabled={deleteTagMutation.isPending}
            >
              {deleteTagMutation.isPending ? 'Deleting...' : 'Delete Tag'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
