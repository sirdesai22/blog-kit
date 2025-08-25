import { notFound } from 'next/navigation';
import {
  getPageById,
  getWorkspaceBlogCategories,
} from '@/modules/workspace/actions/workspace-actions';
import { CategoriesAndTagsView } from './_components/categories-and-tags-view';
import { getWorkspaceBlogTags } from '@/modules/blogs/actions/tag-actions';
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{
    workspaceSlug: string;
    blogId: string;
  }>;
}

// Separate loading component
function CategoriesLoading() {
  return (
    <div className="p-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );
}

export default async function CategoriesPage({ params }: PageProps) {
  return (
    <Suspense fallback={<CategoriesLoading />}>
      <CategoriesContent params={params} />
    </Suspense>
  );
}

async function CategoriesContent({
  params,
}: {
  params: Promise<{ workspaceSlug: string; blogId: string }>;
}) {
  const { workspaceSlug, blogId } = await params;

  const [page, categoriesData, tagsData] = await Promise.all([
    getPageById(workspaceSlug, blogId),
    getWorkspaceBlogCategories(workspaceSlug),
    getWorkspaceBlogTags(workspaceSlug),
  ]);

  if (!page || !categoriesData || !tagsData || !workspaceSlug) {
    notFound();
  }

  return (
    <CategoriesAndTagsView
      workspaceSlug={workspaceSlug}
      blogId={blogId}
      categories={categoriesData.categories}
      tags={tagsData.tags}
    />
  );
}
