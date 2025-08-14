'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Tag, List } from 'lucide-react';
import { BlogCategoriesView } from './blog-categories-view';
import { BlogTagsView } from './tags-view';

interface Category {
  name: string;
  posts: number;
  traffic: number;
  leads: number;
}

interface TagType {
  name: string;
  posts: number;
  traffic: number;
  leads: number;
}

interface CategoriesAndTagsViewProps {
  workspaceSlug: string;
  blogId: string;
  categories: Category[];
  tags: TagType[];
}

export function CategoriesAndTagsView({
  workspaceSlug,
  blogId,
  categories,
  tags,
}: CategoriesAndTagsViewProps) {
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>(
    'categories'
  );

  return (
    <div className="px-4">
      {/* Header with Main Title */}
      <div className="flex items-center justify-between">
        <div className="w-full">
          <div className="max-w-7xl mx-auto py-6">
            <div className="flex items-center w-full justify-between">
              <div className="space-y-4">
                <Heading
                  level="h1"
                  variant="default"
                  subtitleVariant="muted"
                  subtitleSize="xs"
                  subtitle={
                    <>
                      Organize your blog content with categories and tags to
                      help readers find what they're looking for.
                    </>
                  }
                >
                  Categories & Tags
                </Heading>

                {/* Tab Navigation */}
                <div className="flex items-center bg-gray-200 p-1 rounded-lg w-fit">
                  <Button
                    variant={activeTab === 'categories' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('categories')}
                    className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 ${
                      activeTab === 'categories'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 bg-transparent hover:bg-gray-100'
                    }`}
                  >
                    Categories
                  </Button>
                  <Button
                    variant={activeTab === 'tags' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('tags')}
                    className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 ${
                      activeTab === 'tags'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 bg-transparent hover:bg-gray-100'
                    }`}
                  >
                    Tags
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
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
  categories: Category[];
}) {
  return (
    <div className="space-y-6">
      <BlogCategoriesView
        workspaceSlug={workspaceSlug}
        blogId={blogId}
        categories={categories}
        hideHeader={true}
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
  tags: TagType[];
}) {
  return (
    <div className="space-y-6">
      <BlogTagsView
        workspaceSlug={workspaceSlug}
        blogId={blogId}
        tags={tags}
        hideHeader={true}
      />
    </div>
  );
}
