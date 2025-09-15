import { notFound } from 'next/navigation';
import {
  getPageById,
  getWorkspaceWithPages,
} from '@/modules/workspace/actions/workspace-actions';
import { BlogTableView } from './_components/blog-table-view';

interface PageProps {
  params: Promise<{
    workspaceSlug: string;
    blogId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { workspaceSlug, blogId } = await params;

  // Only fetch the essential data server-side, let the hook handle posts
  const [page, workspace] = await Promise.all([
    getPageById(workspaceSlug, blogId),
    getWorkspaceWithPages(workspaceSlug),
  ]);

  if (!page || !workspace || !workspaceSlug) {
    notFound();
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <BlogTableView
        workspaceSlug={workspaceSlug}
        currentPage={page}
        // Remove initialPosts prop since the hook will handle all data fetching
      />
    </div>
  );
}
