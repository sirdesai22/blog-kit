'use client';

import { Input } from '@/components/ui/input';
import { Search, Hash, Circle, User, Tag } from 'lucide-react';
import { ActiveFiltersBar, ActiveFilter } from './active-filter-chip';
import { useBlogFilterOptions } from '@/modules/blogs/hooks/use-blog-filter-options';
import { MultiSelectFilter } from '@/components/ui/multi-select-filter';

interface BlogTableFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilters: string[]; // Changed to array
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
}: BlogTableFiltersProps) {
  const {
    categories,
    tags,
    authors,
    isLoading: optionsLoading,
  } = useBlogFilterOptions(workspaceSlug);

  // Transform data for reusable components
  const categoryOptions = categories.map((cat) => ({
    id: cat,
    name: cat,
    label: cat,
  }));

  const tagOptions = tags.map((tag) => ({
    id: tag.name,
    name: tag.name,
    label: tag.name,
    count: tag.posts,
  }));

  const authorOptions = authors.map((author) => ({
    id: author.id,
    name: author.name,
    label: author.name,
    email: author.email,
    image: author.image,
  }));

  // Build active filters array
  const activeFilters: ActiveFilter[] = [];

  if (searchTerm) {
    activeFilters.push({
      id: 'search',
      type: 'search',
      label: `"${searchTerm}"`,
      value: searchTerm,
    });
  }

  if (statusFilters.length > 0) {
    activeFilters.push({
      id: 'statuses',
      type: 'statuses',
      label:
        statusFilters.length === 1
          ? statusOptions.find((s) => s.id === statusFilters[0])?.label ||
            statusFilters[0]
          : 'Statuses',
      value: statusFilters,
      count: statusFilters.length,
    });
  }

  if (categoryFilters.length > 0) {
    activeFilters.push({
      id: 'categories',
      type: 'categories',
      label: categoryFilters.length === 1 ? categoryFilters[0] : 'Categories',
      value: categoryFilters,
      count: categoryFilters.length,
    });
  }

  if (tagFilters.length > 0) {
    activeFilters.push({
      id: 'tags',
      type: 'tags',
      label: tagFilters.length === 1 ? tagFilters[0] : 'Tags',
      value: tagFilters,
      count: tagFilters.length,
    });
  }

  if (authorFilters.length > 0) {
    const authorNames = authorFilters
      .map((id) => authors.find((a) => a.id === id)?.name)
      .filter(Boolean);
    activeFilters.push({
      id: 'authors',
      type: 'authors',
      label: authorNames.length === 1 ? authorNames[0]! : 'Authors',
      value: authorFilters,
      count: authorFilters.length,
    });
  }

  const handleRemoveFilter = (filterId: string) => {
    switch (filterId) {
      case 'search':
        setSearchTerm('');
        break;
      case 'statuses':
        setStatusFilters([]);
        break;
      case 'categories':
        setCategoryFilters([]);
        break;
      case 'tags':
        setTagFilters([]);
        break;
      case 'authors':
        setAuthorFilters([]);
        break;
    }
  };

  const handleUpdateFilter = (
    filterId: string,
    newValue: string | string[]
  ) => {
    switch (filterId) {
      case 'statuses':
        setStatusFilters(newValue as string[]);
        break;
      case 'categories':
        setCategoryFilters(newValue as string[]);
        break;
      case 'tags':
        setTagFilters(newValue as string[]);
        break;
      case 'authors':
        setAuthorFilters(newValue as string[]);
        break;
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
          {/* Categories Filter */}
          <MultiSelectFilter
            icon={Hash}
            placeholder="Categories"
            searchPlaceholder="Search categories..."
            options={categoryOptions}
            selectedValues={categoryFilters}
            onSelectionChange={setCategoryFilters}
            loading={loading || optionsLoading}
            colorScheme={{
              button: 'bg-purple-50 border-purple-200 text-purple-700',
              icon: 'text-purple-500',
            }}
          />

          {/* Tags Filter */}
          <MultiSelectFilter
            icon={Tag}
            placeholder="Tags"
            searchPlaceholder="Search tags..."
            options={tagOptions}
            selectedValues={tagFilters}
            onSelectionChange={setTagFilters}
            loading={loading || optionsLoading}
            colorScheme={{
              button: 'bg-orange-50 border-orange-200 text-orange-700',
              icon: 'text-orange-500',
            }}
          />

          {/* Status Filter */}
          <MultiSelectFilter
            icon={Circle}
            placeholder="Status"
            searchPlaceholder="Search status..."
            options={statusOptions}
            selectedValues={statusFilters}
            onSelectionChange={setStatusFilters}
            loading={loading}
            showSearch={false}
            colorScheme={{
              button: 'bg-green-50 border-green-200 text-green-700',
              icon: 'text-green-500',
            }}
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
            colorScheme={{
              button: 'bg-pink-50 border-pink-200 text-pink-700',
              icon: 'text-pink-500',
            }}
          />
        </div>
      </div>

      {/* Active Filters Bar */}
      <ActiveFiltersBar
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        onUpdateFilter={handleUpdateFilter}
        onClearAll={handleClearAll}
        categories={categories}
        tags={tags}
        authors={authors}
      />
    </div>
  );
}
