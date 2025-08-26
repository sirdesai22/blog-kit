import React from 'react';
import db from '@/lib/db';
import {
  getWorkspaceAuthors,
  getBlogPostsByBlogId,
} from '@/modules/blogs/actions/blog-actions';
import { getWorkspaceCategoriesWithStats } from '@/modules/blogs/actions/category-actions';
import { getWorkspaceTagsWithStats } from '@/modules/blogs/actions/tag-actions-new';
import { BlogEditor } from '@/modules/blogs/components/blog-editor';
import { auth } from '@/lib/auth';

interface NewPostPageProps {
  params: Promise<{
    workspaceSlug: string;
    blogId: string;
  }>;
}

export default async function NewPostPage(props: NewPostPageProps) {
  const session = await auth();
  const params = await props.params;
  const { workspaceSlug, blogId } = params;
  const workspace = await db.workspace.findUnique({
    where: {
      slug: workspaceSlug,
      members: { some: { userId: session?.user.id } },
    },
  });

  // ✅ Use new ID-based actions
  const [categoriesData, authors, blogPosts, tagsData] = await Promise.all([
    getWorkspaceCategoriesWithStats(workspaceSlug),
    getWorkspaceAuthors(workspaceSlug),
    getBlogPostsByBlogId(workspaceSlug, blogId),
    getWorkspaceTagsWithStats(workspaceSlug),
  ]);

  return (
    <BlogEditor
      workspaceSlug={workspaceSlug}
      blogId={blogId}
      workspaceId={workspace?.id}
      categories={categoriesData?.categories || []}
      authors={authors}
      allPosts={blogPosts}
      tags={tagsData?.tags || []}
      isNewPost={true}
    />
  );
}
