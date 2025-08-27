// @ts-ignore
// @ts-nocheck
'use client';

import { Input } from '@/components/ui/input';
import { Search, Hash, Circle, User, Tag } from 'lucide-react';
import { ActiveFiltersBar, ActiveFilter } from './active-filter-chip';
import { useBlogFilterOptions } from '@/modules/blogs/hooks/use-blog-filter-options';
import { MultiSelectFilter } from '@/components/ui/multi-select-filter';

interface BlogTableFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilters: string[];
  setStatusFilters: (values: string[]) => void;
  categoryFilters: string[];
  setCategoryFilters: (values: string[]) => void;
  tagFilters: string[];
  setTagFilters: (values: string[]) => void;
  authorFilters: string[];
  setAuthorFilters: (values: string[]) => void;
  postsCount: number;
  loading?: boolean;
  workspaceSlug: string;
  pageId: string;
}

const statusOptions = [
  { id: 'PUBLISHED', name: 'Published', label: 'Published' },
  { id: 'DRAFT', name: 'Draft', label: 'Draft' },
  { id: 'SCHEDULED', name: 'Scheduled', label: 'Scheduled' },
  { id: 'ARCHIVED', name: 'Archived', label: 'Archived' },
];

export function BlogTableFilters({
  searchTerm,
  setSearchTerm,
  statusFilters,
  setStatusFilters,
  categoryFilters,
  setCategoryFilters,
  tagFilters,
  setTagFilters,
  authorFilters,
  setAuthorFilters,
  postsCount,
  loading = false,
  workspaceSlug,
  pageId,
}: BlogTableFiltersProps) {
  const {
    categories,
    tags,
    authors,
    isLoading: optionsLoading,
  } = useBlogFilterOptions(workspaceSlug, pageId);

  const categoryOptions = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    label: cat.name,
  }));

  const tagOptions = tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    label: tag.name,
    count: tag.usageCount,
  }));

  const authorOptions = authors.map((author) => ({
    id: author.id,
    name: author.name,
    label: author.name,
    email: author.email,
    image: author.image,
  }));

  const activeFilters: ActiveFilter[] = [];

  if (searchTerm) {
    activeFilters.push({
      id: 'search',
      type: 'search',
      label: `"${searchTerm}"`,
      value: searchTerm,
    });
  }

  // Create individual chips for each selected status
  statusFilters.forEach((statusId) => {
    const statusOption = statusOptions.find((s) => s.id === statusId);
    activeFilters.push({
      id: `status-${statusId}`,
      type: 'statuses',
      label: statusOption?.label || statusId,
      value: statusId,
    });
  });

  categoryFilters.forEach((categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    activeFilters.push({
      id: `category-${categoryId}`,
      type: 'categories',
      label: category?.name || categoryId,
      value: categoryId,
    });
  });

  tagFilters.forEach((tagId) => {
    const tag = tags.find((t) => t.id === tagId);
    activeFilters.push({
      id: `tag-${tagId}`,
      type: 'tags',
      label: tag?.name || tagId,
      value: tagId,
    });
  });

  authorFilters.forEach((authorId) => {
    const author = authors.find((a) => a.id === authorId);
    activeFilters.push({
      id: `author-${authorId}`,
      type: 'authors',
      label: author?.name || authorId,
      value: authorId,
    });
  });

  const handleRemoveFilter = (filterId: string) => {
    // Extract type and value from filterId
    if (filterId === 'search') {
      setSearchTerm('');
    } else if (filterId.startsWith('status-')) {
      const statusId = filterId.replace('status-', '');
      setStatusFilters((prev: string[]) =>
        prev.filter((id) => id !== statusId)
      ); // ✅ Fixed type
    } else if (filterId.startsWith('category-')) {
      const categoryId = filterId.replace('category-', '');
      setCategoryFilters((prev) => prev.filter((id) => id !== categoryId));
    } else if (filterId.startsWith('tag-')) {
      const tagId = filterId.replace('tag-', '');
      setTagFilters((prev) => prev.filter((id) => id !== tagId));
    } else if (filterId.startsWith('author-')) {
      const authorId = filterId.replace('author-', '');
      setAuthorFilters((prev) => prev.filter((id) => id !== authorId));
    }
  };

  const handleClearAll = () => {
    setSearchTerm('');
    setStatusFilters([]);
    setCategoryFilters([]);
    setTagFilters([]);
    setAuthorFilters([]);
  };

  return (
    <div className="space-y-0">
      <div className="px-4 py-6 sm:px-md lg:px-lg pt-0 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-4">
          <div className="text-normal font-medium">
            {postsCount} <span className="text-small">Posts</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search Posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 w-64 pl-10 text-small"
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Categories Filter  */}
          <MultiSelectFilter
            icon={Hash}
            placeholder="Categories"
            searchPlaceholder="Search categories..."
            options={categoryOptions}
            selectedValues={categoryFilters}
            onSelectionChange={setCategoryFilters}
            loading={loading || optionsLoading}
          />

          {/* Tags Filter  */}
          <MultiSelectFilter
            icon={Tag}
            placeholder="Tags"
            searchPlaceholder="Search tags..."
            options={tagOptions}
            selectedValues={tagFilters}
            onSelectionChange={setTagFilters}
            loading={loading || optionsLoading}
          />

          {/* Status Filter  */}
          <MultiSelectFilter
            icon={Circle}
            placeholder="Status"
            searchPlaceholder="Search status..."
            options={statusOptions}
            selectedValues={statusFilters}
            onSelectionChange={setStatusFilters}
            loading={loading}
            showSearch={false}
          />

          {/* Authors Filter */}
          <MultiSelectFilter
            icon={User}
            placeholder="Authors"
            searchPlaceholder="Search authors..."
            options={authorOptions}
            selectedValues={authorFilters}
            onSelectionChange={setAuthorFilters}
            loading={loading || optionsLoading}
          />
        </div>
      </div>

      {/* Active Filters Bar */}
      <ActiveFiltersBar
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAll}
        categories={categories.map((c) => c.name)}
        tags={tags.map((t) => ({
          name: t.name,
          posts: t.usageCount,
          traffic: 0,
          leads: 0,
        }))}
        authors={authors}
      />
    </div>
  );
}
