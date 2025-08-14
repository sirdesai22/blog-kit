// import { notFound } from 'next/navigation';
// import {
//   getPageById,
//   getWorkspaceBlogTags,
// } from '@/lib/actions/workspace-actions';
// import { BlogTagsView } from './_components/tags-view';

// interface PageProps {
//   params: Promise<{
//     workspaceSlug: string;
//     blogId: string;
//   }>;
// }

// export default async function TagsPage({ params }: PageProps) {
//   const { workspaceSlug, blogId } = await params;

//   const [page, tagsData] = await Promise.all([
//     getPageById(workspaceSlug, blogId),
//     getWorkspaceBlogTags(workspaceSlug),
//   ]);

//   if (!page || !tagsData || !workspaceSlug) {
//     notFound();
//   }

//   return (
//     <BlogTagsView
//       workspaceSlug={workspaceSlug}
//       blogId={blogId}
//       tags={tagsData.tags}
//     />
//   );
// }
