import { notFound } from 'next/navigation';
import {
  getPageById,
  getWorkspaceWithPages,
} from '@/lib/actions/workspace-actions';
import { BlogTableView } from './_components/blog-table-view';

interface PageProps {
  params: {
    workspaceSlug: string;
    pageId: string;
  };
}

export default async function Page({ params }: PageProps) {
  const page = await getPageById(params.workspaceSlug, params.pageId);
  const workspace = await getWorkspaceWithPages(params.workspaceSlug);

  if (!page || !workspace) {
    notFound();
  }

  // Render different views based on page type
  switch (page.type) {
    case 'BLOG':
      // Filter only blog posts from workspace pages
      const blogPosts = workspace.pages.filter((p) => p.type === 'BLOG');
      return (
        <BlogTableView
          posts={blogPosts}
          workspaceSlug={params.workspaceSlug}
          currentPage={page}
        />
      );
    case 'HELP_DOC':
      return <div>Help Doc View (Coming Soon)</div>;
    case 'HELPDESK':
      return <div>Helpdesk View (Coming Soon)</div>;
    case 'CHANGELOG':
      return <div>Changelog View (Coming Soon)</div>;
    default:
      return <div>Unsupported page type: {page.type}</div>;
  }
}
