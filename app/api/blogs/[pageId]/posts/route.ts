import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { PostStatus } from '@prisma/client';
import { BlogPost } from '@/types/blog';

export interface BlogPostFilters {
  search?: string;
  statuses?: PostStatus[];
  categories?: string[];
  tags?: string[];
  authorIds?: string[];
  featured?: boolean;
  pinned?: boolean;
}

export interface BlogPostSort {
  field:
    | 'title'
    | 'status'
    | 'publishedAt'
    | 'createdAt'
    | 'updatedAt'
    | 'views';
  direction: 'asc' | 'desc';
}

export interface BlogPostPagination {
  page: number;
  pageSize: number;
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ pageId: string }> }
) {
  const params = await props.params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    // Filters
    const search = searchParams.get('search') || undefined;
    const statuses =
      (searchParams
        .get('statuses')
        ?.split(',')
        .filter(Boolean) as PostStatus[]) || [];
    const categories =
      searchParams.get('categories')?.split(',').filter(Boolean) || [];
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const authorIds =
      searchParams.get('authorIds')?.split(',').filter(Boolean) || [];
    const featured = searchParams.get('featured')
      ? searchParams.get('featured') === 'true'
      : undefined;
    const pinned = searchParams.get('pinned')
      ? searchParams.get('pinned') === 'true'
      : undefined;

    // Sort
    const sortField =
      (searchParams.get('sortField') as BlogPostSort['field']) || 'createdAt';
    const sortDirection =
      (searchParams.get('sortDirection') as 'asc' | 'desc') || 'desc';

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('pageSize') || '10'))
    );

    // Verify workspace and page access
    const workspace = await db.workspace.findFirst({
      where: {
        pages: {
          some: {
            id: params.pageId,
          },
        },
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found or access denied' },
        { status: 403 }
      );
    }

    const blogPage = await db.page.findFirst({
      where: {
        id: params.pageId,
        workspaceId: workspace.id,
        type: 'BLOG',
      },
    });

    if (!blogPage) {
      return NextResponse.json(
        { error: 'Blog publication not found' },
        { status: 404 }
      );
    }

    // Build where clause
    const whereClause: any = {
      pageId: params.pageId,
      workspaceId: workspace.id,
    };

    if (statuses.length > 0) {
      whereClause.status = { in: statuses };
    }

    if (search) {
      whereClause.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          excerpt: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (categories.length > 0) {
      whereClause.categories = {
        some: {
          id: { in: categories },
        },
      };
    }

    if (tags.length > 0) {
      whereClause.tags = {
        some: {
          id: { in: tags },
        },
      };
    }

    if (authorIds.length > 0) {
      whereClause.OR = [
        { authorId: { in: authorIds } },
        {
          coAuthorIds: {
            hasSome: authorIds,
          },
        },
      ];
    }

    if (featured !== undefined) {
      whereClause.featured = featured;
    }

    if (pinned !== undefined) {
      whereClause.pinned = pinned;
    }

    // Build order by clause
    let orderBy: any = [{ pinned: 'desc' }];

    if (sortField === 'publishedAt') {
      orderBy.push({ publishedAt: sortDirection });
    } else if (sortField === 'createdAt') {
      orderBy.push({ createdAt: sortDirection });
    } else if (sortField === 'updatedAt') {
      orderBy.push({ updatedAt: sortDirection });
    } else if (sortField === 'title') {
      orderBy.push({ title: sortDirection });
    } else if (sortField === 'views') {
      orderBy.push({ views: sortDirection });
    } else {
      // Default sorting
      orderBy.push({ publishedAt: 'desc' });
      orderBy.push({ createdAt: 'desc' });
    }

    // Get total count
    const totalCount = await db.blogPost.count({
      where: whereClause,
    });

    // Calculate pagination
    const skip = (page - 1) * pageSize;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Fetch posts
    const dbBlogPosts = await db.blogPost.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            description: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
        workspace: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
      orderBy,
      take: pageSize,
      skip: skip,
    });

    // Transform the data
    const blogPosts: BlogPost[] = await Promise.all(
      dbBlogPosts.map(async (post) => {
        // Get co-authors information if they exist
        let coAuthors: Array<{ id: string; name: string; image?: string }> = [];

        if (post.coAuthorIds && post.coAuthorIds.length > 0) {
          coAuthors = await db.author.findMany({
            where: {
              id: {
                in: post.coAuthorIds,
              },
              workspaceId: workspace.id,
            },
            select: {
              id: true,
              name: true,
              image: true,
            },
          });
        }

        return {
          id: post.id,
          title: post.title,
          slug: post.slug,
          content: post.content,
          htmlContent: post.htmlContent || undefined,
          excerpt: post.excerpt || undefined,
          status: post.status as
            | 'DRAFT'
            | 'PUBLISHED'
            | 'SCHEDULED'
            | 'ARCHIVED'
            | 'DELETED',
          publishedAt: post.publishedAt || undefined,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          tags: post.tags.map((tag) => ({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            color: tag.color || undefined,
            usageCount: 0,
          })),
          categories: post.categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            color: category.color || undefined,
            description: category.description || undefined,
          })),
          featured: post.featured,
          pinned: post.pinned,
          views: post.views,
          readTime: post.readTime || undefined,
          featuredImage: post.featuredImage || undefined,
          authorId: post.authorId || undefined,
          coAuthorIds: post.coAuthorIds,
          author: post.author
            ? {
                id: post.author.id,
                name: post.author.name,
                image: post.author.image || undefined,
              }
            : undefined,
          coAuthors: coAuthors,
          workspaceId: post.workspaceId,
          pageId: post.pageId,
        } as BlogPost & {
          coAuthors: Array<{ id: string; name: string; image?: string }>;
        };
      })
    );

    return NextResponse.json({
      success: true,
      blogPosts,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        pageSize,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
