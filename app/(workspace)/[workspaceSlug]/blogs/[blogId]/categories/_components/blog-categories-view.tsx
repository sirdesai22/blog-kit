'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  deleteBlogCategory,
  reorderBlogCategories,
  updateBlogCategory,
} from '@/lib/actions/workspace-actions';

// Icons
import {
  ExternalLink,
  GripVertical,
  MoreHorizontal,
  MoreVertical,
  Trash2,
} from 'lucide-react';

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

interface Category {
  name: string;
  posts: number;
  traffic: number;
  leads: number;
}

interface BlogCategoriesViewProps {
  workspaceSlug: string;
  blogId: string;
  categories: Category[];
}

// Redesigned Sortable Row Component
function SortableTableRow({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <TableRow ref={setNodeRef} style={style} className="group">
      <TableCell colSpan={4} className="p-2">
        <div className="flex w-full items-center justify-between">
          {/* Left Side: Handle, Name, and External Link */}
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab rounded p-1 hover:bg-accent"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <Link
              href={`/blog/${category.name}`}
              passHref
              className="flex items-center gap-1"
            >
              <span className="font-medium text-foreground">{category.name}</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </Link>
          </div>

          {/* Right Side: Stats and Action Buttons */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-x-8 text-sm text-muted-foreground">
              <div className="flex w-16 items-center justify-end gap-1.5">
                <span className="font-semibold text-foreground">
                  {category.posts} 
                </span>
              </div>
              <div className="flex w-20 items-center justify-end gap-1.5">
                <span className="font-semibold text-foreground">
                  {category.traffic.toLocaleString()}
                  {/* <span className="rounded bg-red-50 px-1 text-xs text-red-600">+22%</span> */}

                </span>
              </div>
              <div className="flex w-16 items-center justify-end gap-1.5">
                <span className="font-semibold text-foreground">
                  {category.leads}
                  {/* <span className="rounded bg-red-50 px-1 text-xs text-red-600">+22%</span> */}

                </span>
              </div>
            </div>

            <div className="flex w-56 items-center justify-end gap-2">
              <Button variant="outline" size="sm" className='text-muted-foreground'>
                Manage Posts
              </Button>
              <Button
                variant="outline"
                size="sm"
                className='text-muted-foreground'
                onClick={() => onEdit(category)}
              >
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
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
          </div>
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
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryDescription, setEditCategoryDescription] = useState('');
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
      const oldIndex = categories.findIndex((c) => c.name === active.id);
      const newIndex = categories.findIndex((c) => c.name === over.id);
      const newCategories = arrayMove(categories, oldIndex, newIndex);
      setCategories(newCategories);

      try {
        await reorderBlogCategories(
          workspaceSlug,
          newCategories.map((cat) => cat.name)
        );
      } catch (error) {
        console.error('Failed to update category order:', error);
        setCategories(categories); // Revert on failure
      }
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory || !editCategoryName.trim()) return;
    setIsLoading(true);
    try {
      await updateBlogCategory(
        workspaceSlug,
        selectedCategory.name,
        editCategoryName.trim()
      );
      setIsEditDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to update category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    setIsLoading(true);
    try {
      await deleteBlogCategory(workspaceSlug, selectedCategory.name);
      setIsDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
          <CardTitle className="text-base font-semibold ml-8 mb-2">
            {categories.length}{' '}
            <span className="text-muted-foreground">Categories</span>
          </CardTitle>
      <Card className='shadow-none border-none p-0'>
        
        <CardContent className="p-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table >
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead colSpan={4} className="p-2">
                    <div className="flex w-full items-center justify-between">
                      <span className="pl-2 text-sm font-medium text-muted-foreground">
                        Category
                      </span>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-x-8 text-sm text-muted-foreground">
                          <span className="w-16 text-right font-medium">Posts</span>
                          <span className="w-20 text-right font-medium">
                            Traffic
                          </span>
                          <span className="w-16 text-right font-medium">Leads</span>
                        </div>
                        <div className="w-[210px]" />
                      </div>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-12 text-center text-muted-foreground"
                    >
                      No categories yet. Create your first category to organize
                      your blog posts.
                    </TableCell>
                  </TableRow>
                ) : (
                  <SortableContext
                    items={categories.map((cat) => cat.name)}
                    strategy={verticalListSortingStrategy}
                  >
                    {categories.map((category) => (
                      <SortableTableRow
                        key={category.name}
                        category={category}
                        onEdit={(cat) => {
                          setSelectedCategory(cat);
                          setEditCategoryName(cat.name);
                          setEditCategoryDescription(''); // Load description if available
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
        </CardContent>
      </Card>

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
              Are you sure you want to delete &quot;{selectedCategory?.name}&quot;?
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