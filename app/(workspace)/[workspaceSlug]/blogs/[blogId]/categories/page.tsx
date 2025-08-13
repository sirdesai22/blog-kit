import { notFound } from 'next/navigation';
import {
  getPageById,
  getWorkspaceBlogCategories,
} from '@/lib/actions/workspace-actions';
import { BlogCategoriesView } from './_components/blog-categories-view';

interface PageProps {
  params: Promise<{
    workspaceSlug: string;
    blogId: string;
  }>;
}

export default async function CategoriesPage({ params }: PageProps) {
  const { workspaceSlug, blogId } = await params;

  const [page, categoriesData] = await Promise.all([
    getPageById(workspaceSlug, blogId),
    getWorkspaceBlogCategories(workspaceSlug),
  ]);

  if (!page || !categoriesData || !workspaceSlug) {
    notFound();
  }

  return (
    <BlogCategoriesView
      workspaceSlug={workspaceSlug}
      blogId={blogId}
      categories={categoriesData.categories}
    />
  );
}
