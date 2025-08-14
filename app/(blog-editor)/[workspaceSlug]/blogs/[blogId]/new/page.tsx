import React from 'react';

import {
  getBlogCategories,
  getWorkspaceAuthors,
  getBlogPostsByBlogId,
  getBlogTags, // Add this import
} from '@/lib/actions/blog-actions';
import { BlogEditor } from '@/components/blogs/blog-editor';

interface NewPostPageProps {
  params: Promise<{
    workspaceSlug: string;
    blogId: string;
  }>;
}

export default async function NewPostPage(props: NewPostPageProps) {
  const params = await props.params;
  const { workspaceSlug, blogId } = params;

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
      categories={categories}
      authors={authors}
      allPosts={blogPosts}
      tags={tags} // Add this line
      isNewPost={true}
    />
  );
}
