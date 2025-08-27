'use server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { PostStatus } from '@prisma/client';
import { redirect } from 'next/navigation';

/**
 * Bulk publish blog posts
 */
export async function bulkPublishPosts(
  workspaceSlug: string,
  postIds: string[]
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
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
            role: { in: ['OWNER', 'ADMIN', 'EDITOR'] },
          },
        },
      },
    });

    if (!workspace) {
      return { success: false, error: 'Access denied' };
    }

    await db.blogPost.updateMany({
      where: {
        id: { in: postIds },
        workspaceId: workspace.id,
      },
      data: {
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    return {
      success: true,
      message: `${postIds.length} post${
        postIds.length > 1 ? 's' : ''
      } published successfully!`,
    };
  } catch (error) {
    console.error('Error bulk publishing posts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish posts',
    };
  }
}

/**
 * Bulk unpublish blog posts
 */
export async function bulkUnpublishPosts(
  workspaceSlug: string,
  postIds: string[]
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
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
            role: { in: ['OWNER', 'ADMIN', 'EDITOR'] },
          },
        },
      },
    });

    if (!workspace) {
      return { success: false, error: 'Access denied' };
    }

    await db.blogPost.updateMany({
      where: {
        id: { in: postIds },
        workspaceId: workspace.id,
      },
      data: {
        status: PostStatus.DRAFT,
        publishedAt: null,
      },
    });

    return {
      success: true,
      message: `${postIds.length} post${
        postIds.length > 1 ? 's' : ''
      } unpublished successfully!`,
    };
  } catch (error) {
    console.error('Error bulk unpublishing posts:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to unpublish posts',
    };
  }
}

/**
 * Bulk update categories for blog posts
 */
export async function bulkUpdateCategories(
  workspaceSlug: string,
  postIds: string[],
  categoryIds: string[]
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
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
            role: { in: ['OWNER', 'ADMIN', 'EDITOR'] },
          },
        },
      },
    });

    if (!workspace) {
      return { success: false, error: 'Access denied' };
    }

    // Update each post's categories
    await Promise.all(
      postIds.map(async (postId) => {
        // First, disconnect all existing categories
        await db.blogPost.update({
          where: { id: postId },
          data: {
            categories: {
              set: [], // Clear all existing categories
            },
          },
        });

        // Then, connect the new categories
        if (categoryIds.length > 0) {
          await db.blogPost.update({
            where: { id: postId },
            data: {
              categories: {
                connect: categoryIds.map((id) => ({ id })),
              },
            },
          });
        }
      })
    );

    return {
      success: true,
      message: `Categories updated for ${postIds.length} post${
        postIds.length > 1 ? 's' : ''
      }!`,
    };
  } catch (error) {
    console.error('Error bulk updating categories:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update categories',
    };
  }
}

/**
 * Bulk update tags for blog posts
 */
export async function bulkUpdateTags(
  workspaceSlug: string,
  postIds: string[],
  tagIds: string[]
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
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
            role: { in: ['OWNER', 'ADMIN', 'EDITOR'] },
          },
        },
      },
    });

    if (!workspace) {
      return { success: false, error: 'Access denied' };
    }

    // Update each post's tags
    await Promise.all(
      postIds.map(async (postId) => {
        // First, disconnect all existing tags
        await db.blogPost.update({
          where: { id: postId },
          data: {
            tags: {
              set: [], // Clear all existing tags
            },
          },
        });

        // Then, connect the new tags
        if (tagIds.length > 0) {
          await db.blogPost.update({
            where: { id: postId },
            data: {
              tags: {
                connect: tagIds.map((id) => ({ id })),
              },
            },
          });
        }
      })
    );

    return {
      success: true,
      message: `Tags updated for ${postIds.length} post${
        postIds.length > 1 ? 's' : ''
      }!`,
    };
  } catch (error) {
    console.error('Error bulk updating tags:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update tags',
    };
  }
}

/**
 * Bulk update author for blog posts
 */
export async function bulkUpdateAuthor(
  workspaceSlug: string,
  postIds: string[],
  authorId: string
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
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
            role: { in: ['OWNER', 'ADMIN', 'EDITOR'] },
          },
        },
      },
    });

    if (!workspace) {
      return { success: false, error: 'Access denied' };
    }

    await db.blogPost.updateMany({
      where: {
        id: { in: postIds },
        workspaceId: workspace.id,
      },
      data: {
        authorId: authorId,
      },
    });

    return {
      success: true,
      message: `Author updated for ${postIds.length} post${
        postIds.length > 1 ? 's' : ''
      }!`,
    };
  } catch (error) {
    console.error('Error bulk updating author:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update author',
    };
  }
}

/**
 * Bulk delete blog posts
 */
export async function bulkDeletePosts(
  workspaceSlug: string,
  postIds: string[]
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
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
            role: { in: ['OWNER', 'ADMIN', 'EDITOR'] },
          },
        },
      },
    });

    if (!workspace) {
      return { success: false, error: 'Access denied' };
    }

    await db.blogPost.deleteMany({
      where: {
        id: { in: postIds },
        workspaceId: workspace.id,
      },
    });

    return {
      success: true,
      message: `${postIds.length} post${
        postIds.length > 1 ? 's' : ''
      } deleted successfully!`,
    };
  } catch (error) {
    console.error('Error bulk deleting posts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete posts',
    };
  }
}

/**
 * Bulk archive blog posts
 */
export async function bulkArchivePosts(
  workspaceSlug: string,
  postIds: string[]
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
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
            role: { in: ['OWNER', 'ADMIN', 'EDITOR'] },
          },
        },
      },
    });

    if (!workspace) {
      return { success: false, error: 'Access denied' };
    }

    await db.blogPost.updateMany({
      where: {
        id: { in: postIds },
        workspaceId: workspace.id,
      },
      data: {
        status: PostStatus.ARCHIVED,
      },
    });

    return {
      success: true,
      message: `${postIds.length} post${
        postIds.length > 1 ? 's' : ''
      } archived successfully!`,
    };
  } catch (error) {
    console.error('Error bulk archiving posts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to archive posts',
    };
  }
}
