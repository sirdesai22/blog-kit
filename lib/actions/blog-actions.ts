'use server';

import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import { PageType, PageStatus } from '@prisma/client';

export interface BlogPostData {
  title: string;
  content: any;
  description?: string;
  category?: string;
  tags: string[];
  authorIds: string[];
  featuredImage?: string;
  publishDate?: Date;
  relatedArticleIds: string[];
}

export async function createBlogPost(
  workspaceSlug: string,
  data: BlogPostData
) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Check workspace access
  const workspace = await db.workspace.findFirst({
    where: {
      slug: workspaceSlug,
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
  });

  if (!workspace) {
    throw new Error('Workspace not found or insufficient permissions');
  }

  // Generate slug from title
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Create the page and blog post
  const page = await db.page.create({
    data: {
      title: data.title,
      slug,
      type: PageType.BLOG,
      description: data.description,
      content: data.content,
      status: PageStatus.DRAFT,
      category: data.category,
      featuredImage: data.featuredImage,
      publishedAt: data.publishDate,
      workspaceId: workspace.id,
      createdById: session.user.id,
      blogPost: {
        create: {
          tags: data.tags,
          categories: data.category ? [data.category] : [],
        },
      },
      authors: {
        createMany: {
          data: data.authorIds.map((userId) => ({ userId })),
        },
      },
    },
    include: {
      blogPost: true,
      authors: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
  });

  return page;
}

export async function updateBlogPost(
  pageId: string,
  workspaceSlug: string,
  data: Partial<BlogPostData>
) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Check workspace access and page ownership
  const page = await db.page.findFirst({
    where: {
      id: pageId,
      workspace: {
        slug: workspaceSlug,
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
    },
    include: {
      blogPost: true,
    },
  });

  if (!page) {
    throw new Error('Blog post not found or insufficient permissions');
  }

  // Update the page and blog post
  const updatedPage = await db.page.update({
    where: {
      id: pageId,
    },
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      category: data.category,
      featuredImage: data.featuredImage,
      publishedAt: data.publishDate,
      updatedById: session.user.id,
      ...(data.tags && {
        blogPost: {
          update: {
            tags: data.tags,
            categories: data.category ? [data.category] : [],
          },
        },
      }),
      ...(data.authorIds && {
        authors: {
          deleteMany: {},
          createMany: {
            data: data.authorIds.map((userId) => ({ userId })),
          },
        },
      }),
    },
    include: {
      blogPost: true,
      authors: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
    },
  });

  return updatedPage;
}

export async function publishBlogPost(pageId: string, workspaceSlug: string) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const page = await db.page.findFirst({
    where: {
      id: pageId,
      workspace: {
        slug: workspaceSlug,
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
    },
  });

  if (!page) {
    throw new Error('Blog post not found or insufficient permissions');
  }

  const updatedPage = await db.page.update({
    where: {
      id: pageId,
    },
    data: {
      status: PageStatus.PUBLISHED,
      publishedAt: new Date(),
      updatedById: session.user.id,
    },
  });

  return updatedPage;
}

export async function getBlogCategories(workspaceSlug: string) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const workspace = await db.workspace.findFirst({
    where: {
      slug: workspaceSlug,
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      config: true,
    },
  });

  if (!workspace?.config) {
    return [];
  }

  return workspace.config.blogCategories || [];
}

export async function getWorkspaceAuthors(workspaceSlug: string) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const workspace = await db.workspace.findFirst({
    where: {
      slug: workspaceSlug,
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      authors: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!workspace) {
    return [];
  }

  // Return actual authors, not workspace members
  return workspace.authors;
}

// NEW: Get blog posts for a specific blog ID
export async function getBlogPostsByBlogId(
  workspaceSlug: string,
  blogId: string
) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // First verify the user has access to this workspace and blog
  const workspace = await db.workspace.findFirst({
    where: {
      slug: workspaceSlug,
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
  });

  if (!workspace) {
    return [];
  }

  // Get blog posts that belong to this specific blog
  const pages = await db.page.findMany({
    where: {
      type: PageType.BLOG,
      workspaceId: workspace.id,
      // Add your blog filtering logic here - this depends on your schema
      // If you have a blogId field, use it. If blogs are categorized differently, adjust accordingly
      category: blogId, // or however you're linking pages to specific blogs
    },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return pages;
}

// Keep the original function for general workspace blog posts
export async function getBlogPosts(workspaceSlug: string) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const pages = await db.page.findMany({
    where: {
      type: PageType.BLOG,
      workspace: {
        slug: workspaceSlug,
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return pages;
}
