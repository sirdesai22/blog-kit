import { notFound } from 'next/navigation';
import {
  getPageById,
  getWorkspaceBlogCategories,
} from '@/lib/actions/workspace-actions';
import { CategoriesAndTagsView } from './_components/categories-and-tags-view';
import { getWorkspaceBlogTags } from '@/lib/actions/tag-actions';

interface PageProps {
  params: Promise<{
    workspaceSlug: string;
    blogId: string;
  }>;
}

export default async function CategoriesPage({ params }: PageProps) {
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
