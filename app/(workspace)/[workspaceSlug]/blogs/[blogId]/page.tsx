import { notFound } from 'next/navigation';
import {
  getPageById,
  getWorkspaceWithPages,
} from '@/lib/actions/workspace-actions';
import { BlogTableView } from './_components/blog-table-view';

interface PageProps {
  params: Promise<{
    workspaceSlug: string;
    blogId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { workspaceSlug, blogId } = await params;

  const page = await getPageById(workspaceSlug, blogId);
  const workspace = await getWorkspaceWithPages(workspaceSlug);

  if (!page || !workspace || !workspaceSlug) {
    notFound();
  }

  const blogPosts = workspace.pages.filter((p) => p.type === 'BLOG');
  return (
    <BlogTableView
      posts={blogPosts}
      workspaceSlug={workspaceSlug}
      currentPage={page}
    />
  );
}
