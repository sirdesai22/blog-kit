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
  addBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  reorderBlogCategories,
} from '@/lib/actions/workspace-actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

// Sortable row component
function SortableTableRow({
  category,
  workspaceSlug,
  onEdit,
  onDelete,
}: {
  category: Category;
  workspaceSlug: string;
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
      <TableCell className="font-medium">{category.name}</TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="font-medium">{category.posts}</span>
        </div>
      </TableCell>
      <TableCell className="text-center font-medium">
        <span className="">{category.traffic.toLocaleString()}</span>
      </TableCell>
      <TableCell className="text-center">
        <span className=" font-medium">{category.leads}</span>
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
            onClick={() => onEdit(category)}
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
                onClick={() => onDelete(category)}
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

export function BlogCategoriesView({
  workspaceSlug,
  blogId,
  categories: initialCategories,
}: BlogCategoriesViewProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
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
      const oldIndex = categories.findIndex((item) => item.name === active.id);
      const newIndex = categories.findIndex((item) => item.name === over.id);

      const newCategories = arrayMove(categories, oldIndex, newIndex);
      setCategories(newCategories);

      // Update the order on the server
      try {
        await reorderBlogCategories(
          workspaceSlug,
          newCategories.map((cat) => cat.name)
        );
      } catch (error) {
        console.error('Failed to update category order:', error);
        // Revert the order if the update fails
        setCategories(categories);
      }
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    setIsLoading(true);
    try {
      await addBlogCategory(workspaceSlug, newCategoryName.trim());
      setIsAddDialogOpen(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
      router.refresh();
    } catch (error) {
      console.error('Failed to add category:', error);
    } finally {
      setIsLoading(false);
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
      setSelectedCategory(null);
      setEditCategoryName('');
      setEditCategoryDescription('');
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
      setSelectedCategory(null);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete category:', error);
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
                      Organize your blog content with categories to help readers
                      find what they're looking for.
                    </>
                  }
                >
                  Categories
                </Heading>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="category-name">Category Name</Label>
                      <Input
                        id="category-name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder=""
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category-description">Description</Label>
                      <Textarea
                        id="category-description"
                        value={newCategoryDescription}
                        onChange={(e) =>
                          setNewCategoryDescription(e.target.value)
                        }
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
                        setNewCategoryName('');
                        setNewCategoryDescription('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddCategory} disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table with Drag and Drop */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{categories.length} Categories</span>
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
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Posts</TableHead>
                  <TableHead className="text-center">Traffic</TableHead>
                  <TableHead className="text-center">Leads</TableHead>
                  <TableHead className="text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-gray-500"
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
                        workspaceSlug={workspaceSlug}
                        onEdit={(cat) => {
                          setSelectedCategory(cat);
                          setEditCategoryName(cat.name);
                          setEditCategoryDescription(''); // You might want to load existing description if stored
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
                placeholder=""
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category-description">Description</Label>
              <Textarea
                id="edit-category-description"
                value={editCategoryDescription}
                onChange={(e) => setEditCategoryDescription(e.target.value)}
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
                setSelectedCategory(null);
                setEditCategoryName('');
                setEditCategoryDescription('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditCategory} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Edit'}
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
              Are you sure you want to delete "{selectedCategory?.name}"? This
              action cannot be undone. All blog posts in this category will have
              their category removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedCategory(null);
              }}
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
    </div>
  );
}
