import React from 'react';

import {
  getBlogCategories,
  getWorkspaceAuthors,
  getBlogPostsByBlogId, // Updated import
} from '@/lib/actions/blog-actions';
import { BlogEditor } from '@/components/blogs/blog-editor';

interface NewPostPageProps {
  params: {
    workspaceSlug: string;
    blogId: string;
  };
}

export default async function NewPostPage({ params }: NewPostPageProps) {
  const { workspaceSlug, blogId } = params;

  // Fetch necessary data - now using blog-specific posts
  const [categories, authors, blogPosts] = await Promise.all([
    getBlogCategories(workspaceSlug),
    getWorkspaceAuthors(workspaceSlug),
    getBlogPostsByBlogId(workspaceSlug, blogId), // Updated to fetch blog-specific posts
  ]);

  return (
    <BlogEditor
      workspaceSlug={workspaceSlug}
      blogId={blogId}
      categories={categories}
      authors={authors}
      allPosts={blogPosts} // Now contains only posts from this specific blog
      isNewPost={true}
    />
  );
}
