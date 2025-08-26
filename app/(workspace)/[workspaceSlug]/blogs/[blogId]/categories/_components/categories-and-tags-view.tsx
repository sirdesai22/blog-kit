'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Plus } from 'lucide-react';
import { BlogCategoriesView } from './blog-categories-view';
import { BlogTagsView } from './tags-view';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createCategory } from '@/modules/blogs/actions/category-actions';
import { createTag } from '@/modules/blogs/actions/tag-actions-new';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// UPDATED interfaces to match new rich data
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

interface TagWithStats {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  posts: number;
  traffic: number;
  leads: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoriesAndTagsViewProps {
  workspaceSlug: string;
  blogId: string;
  categories: CategoryWithStats[];
  tags: TagWithStats[];
}

export function CategoriesAndTagsView({
  workspaceSlug,
  blogId,
  categories,
  tags,
}: CategoriesAndTagsViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>(
    'categories'
  );
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isAddTagDialogOpen, setIsAddTagDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagDescription, setNewTagDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    setIsLoading(true);
    try {
      await createCategory(workspaceSlug, blogId, {
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
      });

      toast.success('Category created successfully!');
      setIsAddCategoryDialogOpen(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create category'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;

    setIsLoading(true);
    try {
      await createTag(workspaceSlug, blogId, {
        name: newTagName.trim(),
        description: newTagDescription.trim() || undefined,
      });

      toast.success('Tag created successfully!');
      setIsAddTagDialogOpen(false);
      setNewTagName('');
      setNewTagDescription('');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create tag'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="">
      {/* Header with Main Title */}
      <div className="flex items-center justify-between">
        <div className="w-full">
          <div className=" mx-auto">
            <div className="flex items-start w-full justify-between flex-col md:flex-row px-4 py-6 sm:px-md lg:px-lg">
              <div className="space-y-4 ">
                {/* Tab Navigation */}
                <div className="flex items-center bg-muted p-1 rounded-lg w-fit">
                  <Button
                    variant={activeTab === 'categories' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('categories')}
                    className={`w-28 flex items-center justify-center gap-2 text-normal transition-all duration-200 rounded-md  ${
                      activeTab === 'categories'
                        ? 'bg-card shadow-sm hover:bg-card/80'
                        : 'bg-transparent hover:bg-accent cursor-pointer'
                    }`}
                  >
                    <p className="text-main">Categories</p>
                  </Button>
                  <Button
                    variant={activeTab === 'tags' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('tags')}
                    className={`w-28 flex items-center justify-center gap-2 text-normal transition-all duration-200 rounded-md ${
                      activeTab === 'tags'
                        ? 'bg-card  shadow-sm hover:bg-card'
                        : ' bg-transparent hover:bg-accent cursor-pointer'
                    }`}
                  >
                    <p className="text-main">Tags</p>
                  </Button>
                </div>
                <Heading
                  level="h1"
                  variant="default"
                  subtitleVariant="muted"
                  subtitleSize="xs"
                  subtitle={
                    <div className="">
                      <p className="text-small">
                        Organize your blog content with categories and tags
                      </p>
                      <p className="text-small">
                        to help readers find what they&apos;re looking for.
                      </p>
                    </div>
                  }
                ></Heading>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-5 md:mt-0">
                <Dialog
                  open={isAddCategoryDialogOpen}
                  onOpenChange={setIsAddCategoryDialogOpen}
                >
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
                          placeholder="Enter category name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category-description">
                          Description
                        </Label>
                        <Textarea
                          id="category-description"
                          value={newCategoryDescription}
                          onChange={(e) =>
                            setNewCategoryDescription(e.target.value)
                          }
                          placeholder="Brief description of this category"
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddCategoryDialogOpen(false);
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
                <Dialog
                  open={isAddTagDialogOpen}
                  onOpenChange={setIsAddTagDialogOpen}
                >
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
                          placeholder="Enter tag name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tag-description">Description</Label>
                        <Textarea
                          id="tag-description"
                          value={newTagDescription}
                          onChange={(e) => setNewTagDescription(e.target.value)}
                          placeholder="Brief description of this tag"
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddTagDialogOpen(false);
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
      </div>

      {/* Tab Content */}
      <div className="">
        {activeTab === 'categories' ? (
          <CategoriesContent
            workspaceSlug={workspaceSlug}
            blogId={blogId}
            categories={categories}
          />
        ) : (
          <TagsContent
            workspaceSlug={workspaceSlug}
            blogId={blogId}
            tags={tags}
          />
        )}
      </div>
    </div>
  );
}

// Categories Content Component (without header)
function CategoriesContent({
  workspaceSlug,
  blogId,
  categories,
}: {
  workspaceSlug: string;
  blogId: string;
  categories: CategoryWithStats[];
}) {
  return (
    <div className="space-y-6">
      <BlogCategoriesView
        workspaceSlug={workspaceSlug}
        blogId={blogId}
        categories={categories}
      />
    </div>
  );
}

// Tags Content Component (without header)
function TagsContent({
  workspaceSlug,
  blogId,
  tags,
}: {
  workspaceSlug: string;
  blogId: string;
  tags: TagWithStats[];
}) {
  return (
    <div className="space-y-6">
      <BlogTagsView workspaceSlug={workspaceSlug} blogId={blogId} tags={tags} />
    </div>
  );
}
