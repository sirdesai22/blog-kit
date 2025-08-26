'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

import {
  deleteCategory,
  reorderCategories,
  updateCategory,
} from '@/modules/blogs/actions/category-actions';

// Icons
import { ExternalLink, GripVertical, MoreVertical, Trash2 } from 'lucide-react';

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
import { toast } from 'sonner';

// ✅ Updated interface to match new rich data
interface CategoryWithStats {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  posts: number;
  traffic: number;
  leads: number;
  createdAt: Date;
  updatedAt: Date;
}

interface BlogCategoriesViewProps {
  workspaceSlug: string;
  blogId: string;
  categories: CategoryWithStats[];
}

// ✅ Updated Sortable Row Component
function SortableTableRow({
  category,
  onEdit,
  onDelete,
}: {
  category: CategoryWithStats;
  onEdit: (category: CategoryWithStats) => void;
  onDelete: (category: CategoryWithStats) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <TableRow ref={setNodeRef} style={style} className="group">
      <TableCell className="w-14">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab rounded p-1 hover:bg-accent flex items-center justify-center"
        >
          <GripVertical className="h-4 w-4 text-normal-muted" />
        </div>
      </TableCell>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <Link
            href={`/blog/${category.slug}`}
            passHref
            className="flex items-center gap-1.5 hover:underline"
          >
            <span className="text-normal">{category.name}</span>
            <ExternalLink className="h-4 w-4 text-normal" />
          </Link>
        </div>
      </TableCell>
      <TableCell>{category.posts}</TableCell>
      <TableCell>
        {(category.traffic || 0).toLocaleString()}{' '}
        <span className="rounded bg-red-50 px-1 text-xs font-medium text-red-600">
          {Math.floor(Math.random() * 20)}%
        </span>
      </TableCell>
      <TableCell>
        {category.leads || 0}
        <span className="rounded bg-green-50 px-1 text-xs font-medium text-green-600">
          {Math.floor(Math.random() * 60)}%
        </span>
      </TableCell>
      <TableCell className="sticky right-0 bg-background group-hover:bg-accent/50">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" className="text-normal-muted">
            Manage featured posts
          </Button>
          <Button variant="outline" size="sm" className="text-normal-muted">
            View Posts
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(category)}
            className="text-normal-muted"
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
                onClick={() => onDelete(category)}
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

export function BlogCategoriesView({
  workspaceSlug,
  categories: initialCategories,
}: BlogCategoriesViewProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryWithStats | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryDescription, setEditCategoryDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    console.log('🚀 Drag STARTED:', event.active.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    console.log('🔄 Drag ENDED:', {
      activeId: active.id,
      overId: over?.id,
    });

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);

      console.log('📊 Reorder details:', {
        oldIndex,
        newIndex,
        activeId: active.id,
        overId: over.id,
      });

      const newCategories = arrayMove(categories, oldIndex, newIndex);
      setCategories(newCategories);

      try {
        const categoryOrders = newCategories.map((cat, index) => ({
          id: cat.id,
          order: index + 1,
        }));

        console.log('🚀 Sending reorder request:', categoryOrders);

        await reorderCategories(workspaceSlug, categoryOrders);
        toast.success('Categories reordered successfully!');

        console.log('✅ Reorder successful');

        router.refresh();
      } catch (error) {
        console.error('❌ Failed to update category order:', error);
        toast.error('Failed to reorder categories');
        setCategories(categories);
      }
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory || !editCategoryName.trim()) return;
    setIsLoading(true);
    try {
      await updateCategory(workspaceSlug, selectedCategory.id, {
        name: editCategoryName.trim(),
        description: editCategoryDescription.trim() || undefined,
      });

      toast.success('Category updated successfully!');
      setIsEditDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to update category:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update category'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    setIsLoading(true);
    try {
      await deleteCategory(workspaceSlug, selectedCategory.id);
      toast.success('Category deleted successfully!');
      setIsDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete category'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CardTitle className="text-normal ml-lg mb-md">
        {categories.length} <span className="text-small">Categories</span>
      </CardTitle>
      <div className="overflow-hidden">
        <div className="relative w-full overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-14"></TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Posts</TableHead>
                  <TableHead>Traffic</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead className="sticky right-0 w-12 text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-muted-foreground"
                    >
                      No categories yet. Create your first category to organize
                      your blog posts.
                    </TableCell>
                  </TableRow>
                ) : (
                  <SortableContext
                    items={categories.map((cat) => cat.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {categories.map((category) => (
                      <SortableTableRow
                        key={category.id}
                        category={category}
                        onEdit={(cat) => {
                          setSelectedCategory(cat);
                          setEditCategoryName(cat.name);
                          setEditCategoryDescription(cat.description || '');
                          setIsEditDialogOpen(true);
                        }}
                        onDelete={(cat) => {
                          setSelectedCategory(cat);
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
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">Category Name</Label>
              <Input
                id="edit-category-name"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category-description">Description</Label>
              <Textarea
                id="edit-category-description"
                value={editCategoryDescription}
                onChange={(e) => setEditCategoryDescription(e.target.value)}
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
            <Button onClick={handleEditCategory} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedCategory?.name}
              &quot;? This action cannot be undone.
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
              onClick={handleDeleteCategory}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
