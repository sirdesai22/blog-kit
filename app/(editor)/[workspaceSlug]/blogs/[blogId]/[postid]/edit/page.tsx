import React from 'react';
import { notFound } from 'next/navigation';

import { auth } from '@/lib/auth';
import db from '@/lib/db';
import {
  getBlogPostsByBlogId,
  getWorkspaceAuthors,
} from '@/modules/blogs/actions/blog-actions';
import { getWorkspaceCategoriesWithStats } from '@/modules/blogs/actions/category-actions';
import { getWorkspaceTagsWithStats } from '@/modules/blogs/actions/tag-actions-new';
import { BlogEditor } from '@/modules/blogs/components/blog-editor';

interface EditPostPageProps {
  params: Promise<{
    workspaceSlug: string;
    blogId: string;
    postid: string;
  }>;
}

export default async function EditPostPage(props: EditPostPageProps) {
  const session = await auth();
  const params = await props.params;
  const { workspaceSlug, blogId, postid } = params;

  const workspace = await db.workspace.findFirst({
    where: {
      slug: workspaceSlug,
      members: { some: { userId: session?.user.id } },
    },
  });

  if (!workspace) {
    notFound();
  }

  const [categoriesData, authors, blogPosts, tagsData, blogPost] =
    await Promise.all([
      getWorkspaceCategoriesWithStats(workspaceSlug, blogId),
      getWorkspaceAuthors(workspaceSlug),
      getBlogPostsByBlogId(workspaceSlug, blogId),
      getWorkspaceTagsWithStats(workspaceSlug, blogId),
      db.blogPost.findFirst({
        where: {
          id: postid,
          workspaceId: workspace.id,
          pageId: blogId,
        },
        include: {
          categories: { select: { id: true } },
          tags: { select: { id: true } },
        },
      }),
    ]);

  if (!blogPost) {
    notFound();
  }

  const content = typeof blogPost.content === 'string'
    ? blogPost.content
    : JSON.stringify(blogPost.content ?? []);

  const status =
    blogPost.status === 'DRAFT' ||
    blogPost.status === 'PUBLISHED' ||
    blogPost.status === 'SCHEDULED'
      ? blogPost.status
      : 'DRAFT';

  const initialPost = {
    id: blogPost.id,
    title: blogPost.title,
    slug: blogPost.slug,
    content,
    description: blogPost.excerpt ?? '',
    categoryIds: blogPost.categories.map((category) => category.id),
    tagIds: blogPost.tags.map((tag) => tag.id),
    authorIds: [
      ...(blogPost.authorId ? [blogPost.authorId] : []),
      ...(Array.isArray(blogPost.coAuthorIds) ? blogPost.coAuthorIds : []),
    ],
    featuredImage: blogPost.featuredImage ?? '',
    publishDate: blogPost.scheduledFor ?? blogPost.publishedAt ?? undefined,
    relatedArticleIds: [] as string[],
    status,
    readTime: blogPost.readTime ?? blogPost.estimatedReadTime ?? undefined,
  };

  return (
    <BlogEditor
      workspaceSlug={workspaceSlug}
      blogId={blogId}
      workspaceId={workspace.id}
      initialPost={initialPost}
      categories={categoriesData?.categories || []}
      authors={authors}
      allPosts={blogPosts}
      tags={tagsData?.tags || []}
      isNewPost={false}
    />
  );
}
