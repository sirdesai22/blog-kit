import React from 'react';
import db from '@/lib/db';
import {
  getBlogCategories,
  getWorkspaceAuthors,
  getBlogPostsByBlogId,
  getBlogTags, // Add this import
} from '@/lib/actions/blog-actions';
import { BlogEditor } from '@/components/blogs/blog-editor';
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
  // Fetch necessary data - now including tags
  const [categories, authors, blogPosts, tags] = await Promise.all([
    getBlogCategories(workspaceSlug),
    getWorkspaceAuthors(workspaceSlug),
    getBlogPostsByBlogId(workspaceSlug, blogId),
    getBlogTags(workspaceSlug), // Add this line
  ]);

  return (
    <BlogEditor
      workspaceSlug={workspaceSlug}
      blogId={blogId}
      workspaceId={workspace?.id}
      categories={categories}
      authors={authors}
      allPosts={blogPosts}
      tags={tags} // Add this line
      isNewPost={true}
    />
  );
}
