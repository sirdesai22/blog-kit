'use server';

import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';

// Get all categories for a specific page with usage stats
export async function getWorkspaceCategoriesWithStats(
  workspaceSlug: string,
  pageId: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const workspace = await db.workspace.findFirst({
    where: {
      slug: workspaceSlug,
      members: { some: { userId: session.user.id } },
    },
    include: {
      categories: {
        where: { pageId: pageId }, // ✅ Filter by specific page
        include: {
          _count: {
            select: { blogPosts: true },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!workspace) return null;

  const categoriesWithStats = workspace.categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    color: category.color,
    icon: category.icon,
    order: category.order,
    workspaceId: category.workspaceId,
    pageId: category.pageId, // ✅ Changed from blogId to pageId
    posts: category._count.blogPosts,
    traffic: Math.floor(Math.random() * 1000), // TODO: Replace with real analytics
    leads: Math.floor(Math.random() * 100), // TODO: Replace with real analytics
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }));

  return {
    workspaceId: workspace.id,
    categories: categoriesWithStats,
  };
}

// Create new category
export async function createCategory(
  workspaceSlug: string,
  pageId: string,
  data: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
  }
) {
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
    throw new Error('Access denied');
  }

  // Verify page exists and belongs to workspace
  const page = await db.page.findFirst({
    where: { id: pageId, workspaceId: workspace.id },
  });

  if (!page) {
    throw new Error('Page not found');
  }

  // Generate unique slug for this page
  const baseSlug = generateSlug(data.name);
  let slug = baseSlug;
  let counter = 1;

  while (
    await db.category.findFirst({
      where: { slug, pageId: pageId },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Get next order position for this page
  const lastCategory = await db.category.findFirst({
    where: { pageId: pageId },
    orderBy: { order: 'desc' },
  });

  const category = await db.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      color: data.color || generateRandomColor(),
      icon: data.icon,
      workspaceId: workspace.id,
      pageId: pageId,
      order: (lastCategory?.order || 0) + 1,
    },
  });

  return { success: true, category };
}

// Update category (keep same interface)
export async function updateCategory(
  workspaceSlug: string,
  categoryId: string,
  data: {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
  }
) {
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
    throw new Error('Access denied');
  }

  // Get the category to find its pageId
  const existingCategory = await db.category.findFirst({
    where: { id: categoryId, workspaceId: workspace.id },
  });

  if (!existingCategory) {
    throw new Error('Category not found');
  }

  const updateData: any = { ...data };

  // Generate new slug if name changed
  if (data.name) {
    const baseSlug = generateSlug(data.name);
    let slug = baseSlug;
    let counter = 1;

    while (
      await db.category.findFirst({
        where: {
          slug,
          pageId: existingCategory.pageId,
          id: { not: categoryId },
        },
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    updateData.slug = slug;
  }

  const category = await db.category.update({
    where: { id: categoryId, workspaceId: workspace.id },
    data: updateData,
  });

  return { success: true, category };
}

// Delete category
export async function deleteCategory(
  workspaceSlug: string,
  categoryId: string
) {
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
    throw new Error('Access denied');
  }

  // Check if category is used by any posts
  const postsUsingCategory = await db.blogPost.count({
    where: {
      workspaceId: workspace.id,
      categories: { some: { id: categoryId } },
    },
  });

  if (postsUsingCategory > 0) {
    throw new Error(
      `Cannot delete category. It's being used by ${postsUsingCategory} post(s).`
    );
  }

  await db.category.delete({
    where: { id: categoryId, workspaceId: workspace.id },
  });

  return { success: true };
}

// Reorder categories
export async function reorderCategories(
  workspaceSlug: string,
  categoryOrders: { id: string; order: number }[]
) {
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
    throw new Error('Access denied');
  }

  // Update all categories in a transaction
  await db.$transaction(
    categoryOrders.map(({ id, order }) =>
      db.category.update({
        where: { id, workspaceId: workspace.id },
        data: { order },
      })
    )
  );

  return { success: true };
}

// Helper functions
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function generateRandomColor(): string {
  const colors = [
    '#3B82F6',
    '#EF4444',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#84CC16',
    '#F97316',
    '#6366F1',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
