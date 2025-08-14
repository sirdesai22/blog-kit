'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MoreHorizontal,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Eye,
  Tag,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Heading } from '@/components/ui/heading';
import {
  addBlogTag,
  updateBlogTag,
  deleteBlogTag,
  reorderBlogTags,
} from '@/lib/actions/tag-actions';
import { useRouter } from 'next/navigation';

// Import drag and drop components
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Tag {
  name: string;
  posts: number;
  traffic: number;
  leads: number;
}

interface BlogTagsViewProps {
  workspaceSlug: string;
  blogId: string;
  tags: Tag[];
}

// Sortable row component
function SortableTableRow({
  tag,
  workspaceSlug,
  onEdit,
  onDelete,
}: {
  tag: Tag;
  workspaceSlug: string;
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tag.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'z-50' : ''}
    >
      <TableCell className="w-8">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:cursor-grabbing p-1 hover:bg-gray-100 rounded"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      </TableCell>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-blue-500" />
          {tag.name}
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="font-medium">{tag.posts}</span>
        </div>
      </TableCell>
      <TableCell className="text-center font-medium">
        <span className="">{tag.traffic.toLocaleString()}</span>
      </TableCell>
      <TableCell className="text-center">
        <span className=" font-medium">{tag.leads}</span>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl text-gray-600 hover:text-gray-800"
          >
            View Posts
          </Button>
          <Button
            variant="outline"
            className="rounded-xl text-gray-600 hover:text-gray-800"
            onClick={() => onEdit(tag)}
          >
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(tag)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function BlogTagsView({
  workspaceSlug,
  blogId,
  tags: initialTags,
}: BlogTagsViewProps) {
  const router = useRouter();
  const [tags, setTags] = useState(initialTags);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagDescription, setNewTagDescription] = useState('');
  const [editTagName, setEditTagName] = useState('');
  const [editTagDescription, setEditTagDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tags.findIndex((item) => item.name === active.id);
      const newIndex = tags.findIndex((item) => item.name === over.id);

      const newTags = arrayMove(tags, oldIndex, newIndex);
      setTags(newTags);

      // Update the order on the server
      try {
        await reorderBlogTags(
          workspaceSlug,
          newTags.map((tag) => tag.name)
        );
      } catch (error) {
        console.error('Failed to update tag order:', error);
        // Revert the order if the update fails
        setTags(tags);
      }
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;

    setIsLoading(true);
    try {
      await addBlogTag(workspaceSlug, newTagName.trim());
      setIsAddDialogOpen(false);
      setNewTagName('');
      setNewTagDescription('');
      router.refresh();
    } catch (error) {
      console.error('Failed to add tag:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTag = async () => {
    if (!selectedTag || !editTagName.trim()) return;

    setIsLoading(true);
    try {
      await updateBlogTag(workspaceSlug, selectedTag.name, editTagName.trim());
      setIsEditDialogOpen(false);
      setSelectedTag(null);
      setEditTagName('');
      setEditTagDescription('');
      router.refresh();
    } catch (error) {
      console.error('Failed to update tag:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!selectedTag) return;

    setIsLoading(true);
    try {
      await deleteBlogTag(workspaceSlug, selectedTag.name);
      setIsDeleteDialogOpen(false);
      setSelectedTag(null);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete tag:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="w-full">
          <div className="max-w-7xl mx-auto py-6">
            <div className="flex items-center w-full justify-between">
              <div>
                <Heading
                  level="h1"
                  variant="default"
                  subtitleVariant="muted"
                  subtitleSize="xs"
                  subtitle={
                    <>
                      Organize your blog content with tags to help readers find
                      related articles and improve discoverability.
                    </>
                  }
                >
                  Tags
                </Heading>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Tag
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Create New Tag</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="tag-name">Tag Name</Label>
                      <Input
                        id="tag-name"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder=""
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tag-description">Description</Label>
                      <Textarea
                        id="tag-description"
                        value={newTagDescription}
                        onChange={(e) => setNewTagDescription(e.target.value)}
                        placeholder=""
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        setNewTagName('');
                        setNewTagDescription('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddTag} disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Tags Table with Drag and Drop */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{tags.length} Tags</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead className="text-center">Posts</TableHead>
                  <TableHead className="text-center">Traffic</TableHead>
                  <TableHead className="text-center">Leads</TableHead>
                  <TableHead className="text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-gray-500"
                    >
                      No tags yet. Create your first tag to organize your blog
                      posts.
                    </TableCell>
                  </TableRow>
                ) : (
                  <SortableContext
                    items={tags.map((tag) => tag.name)}
                    strategy={verticalListSortingStrategy}
                  >
                    {tags.map((tag) => (
                      <SortableTableRow
                        key={tag.name}
                        tag={tag}
                        workspaceSlug={workspaceSlug}
                        onEdit={(selectedTag) => {
                          setSelectedTag(selectedTag);
                          setEditTagName(selectedTag.name);
                          setEditTagDescription(''); // You might want to load existing description if stored
                          setIsEditDialogOpen(true);
                        }}
                        onDelete={(selectedTag) => {
                          setSelectedTag(selectedTag);
                          setIsDeleteDialogOpen(true);
                        }}
                      />
                    ))}
                  </SortableContext>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </CardContent>
      </Card>

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
                placeholder=""
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tag-description">Description</Label>
              <Textarea
                id="edit-tag-description"
                value={editTagDescription}
                onChange={(e) => setEditTagDescription(e.target.value)}
                placeholder=""
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedTag(null);
                setEditTagName('');
                setEditTagDescription('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditTag} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Edit'}
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
              Are you sure you want to delete "{selectedTag?.name}"? This action
              cannot be undone. All blog posts using this tag will have it
              removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedTag(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTag}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Tag'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
