"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteBlogTag,
  reorderBlogTags,
  updateBlogTag,
} from "@/modules/blogs/actions/tag-actions";

// Icons
import { ExternalLink, MoreVertical, Trash2 } from "lucide-react";

// Drag and Drop
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TagType {
  name: string;
  posts: number;
  traffic: number;
  leads: number;
}

interface BlogTagsViewProps {
  workspaceSlug: string;
  blogId: string;
  tags: TagType[];
}

// Redesigned Sortable Row Component for Tags
function SortableTableRow({
  tag,
  onEdit,
  onDelete,
}: {
  tag: TagType;
  onEdit: (tag: TagType) => void;
  onDelete: (tag: TagType) => void;
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
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className="group cursor-grab"
      {...attributes}
    >
      <TableCell className="font-medium pl-4" {...listeners}>
        <Link
          href={`/blog/tags/${tag.name}`}
          passHref
          className="flex items-center gap-1.5 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-normal">{tag.name}</span>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </Link>
      </TableCell>
      <TableCell>{tag.posts}</TableCell>
      {/* <TableCell>{tag.traffic.toLocaleString()} <span className="rounded bg-red-50 px-1 text-xs font-medium text-red-600">
          {Math.floor(Math.random() * 60)}%
        </span></TableCell>
      <TableCell>{tag.leads} <span className="rounded bg-green-50 px-1 text-xs font-medium text-green-600">
          {Math.floor(Math.random() * 60)}%
        </span></TableCell> */}
      <TableCell
        className="sticky right-0 bg-background group-hover:bg-accent/50"
        onClick={(e) => e.stopPropagation()} // Prevents drag from firing on button clicks
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

export function BlogTagsView({
  workspaceSlug,
  tags: initialTags,
}: BlogTagsViewProps) {
  const router = useRouter();
  const [tags, setTags] = useState(initialTags);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagType | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const [editTagDescription, setEditTagDescription] = useState("");
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
      const oldIndex = tags.findIndex((t) => t.name === active.id);
      const newIndex = tags.findIndex((t) => t.name === over.id);
      const newTags = arrayMove(tags, oldIndex, newIndex);
      setTags(newTags);

      try {
        await reorderBlogTags(
          workspaceSlug,
          newTags.map((tag) => tag.name)
        );
      } catch (error) {
        console.error("Failed to update tag order:", error);
        setTags(tags); // Revert on failure
      }
    }
  };

  const handleEditTag = async () => {
    if (!selectedTag || !editTagName.trim()) return;
    setIsLoading(true);
    try {
      await updateBlogTag(workspaceSlug, selectedTag.name, editTagName.trim());
      setIsEditDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to update tag:", error);
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
      router.refresh();
    } catch (error) {
      console.error("Failed to delete tag:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CardTitle className="text-sm ml-4 text-normal">
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
                  <TableHead className="pl-4">Tag</TableHead>
                  <TableHead>Posts</TableHead>
                  {/* <TableHead>Traffic</TableHead>
                  <TableHead>Leads</TableHead> */}
                  <TableHead className="sticky right-0 w-12  text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-12 text-center text-muted-foreground"
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
                        onEdit={(t) => {
                          setSelectedTag(t);
                          setEditTagName(t.name);
                          setEditTagDescription("");
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
            <Button onClick={handleEditTag} disabled={isLoading}>
              {isLoading ? "Updating..." : "Save Changes"}
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
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Tag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
