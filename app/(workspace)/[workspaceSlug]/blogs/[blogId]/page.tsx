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

  const [page, workspace, blogPostsResult] = await Promise.all([
    getPageById(workspaceSlug, blogId),
    getWorkspaceWithPages(workspaceSlug),
    getBlogPostsForTable(workspaceSlug, blogId),
  ]);

  if (!page || !workspace || !workspaceSlug) {
    notFound();
  }

  const blogPosts = blogPostsResult.success ? blogPostsResult.blogPosts : [];

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <BlogTableView
        workspaceSlug={workspaceSlug}
        currentPage={page}
        blogPosts={blogPosts}
      />
    </div>
  );
}
