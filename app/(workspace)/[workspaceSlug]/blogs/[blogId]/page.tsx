import { notFound } from 'next/navigation';
import {
  getPageById,
  getWorkspaceWithPages,
} from '@/modules/workspace/actions/workspace-actions';
import { getBlogPostsForTable } from '@/modules/blogs/actions/blog-table-actions';
import { BlogTableView } from './_components/blog-table-view';

interface PageProps {
  params: Promise<{
    workspaceSlug: string;
    blogId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { workspaceSlug, blogId } = await params;

  const [page, workspace, initialDataResult] = await Promise.all([
    getPageById(workspaceSlug, blogId),
    getWorkspaceWithPages(workspaceSlug),
    getBlogPostsForTable(workspaceSlug, blogId, undefined, undefined, {
      page: 1,
      pageSize: 10,
    }),
  ]);

  if (!page || !workspace || !workspaceSlug) {
    notFound();
  }

  const initialPosts = initialDataResult.success
    ? initialDataResult.blogPosts
    : [];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <BlogTableView
        workspaceSlug={workspaceSlug}
        currentPage={page}
        initialPosts={initialPosts}
      />
    </div>
  );
}
