import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { PostStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { convertContent } from '@/lib/content-transforms';

export interface BlogPostData {
  title: string;
  slug?: string;
  content: any; // PlateJS content
  excerpt?: string;
  featuredImage?: string;
  tags: string[];
  category?: string;
  metaTitle?: string;
  metaDescription?: string;
  featured?: boolean;
  pinned?: boolean;
  scheduledFor?: Date;
  publishedAt?: Date;
  authorId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      workspaceId,
      pageId,
      blogPostId,
      ...postData
    }: BlogPostData & {
      workspaceId: string;
      pageId: string;
      blogPostId?: string;
    } = body;

    // Validate required fields
    if (!workspaceId || !pageId || !postData.title) {
      return NextResponse.json(
        { error: 'WorkspaceId, pageId, and title are required' },
        { status: 400 }
      );
    }

    // Validate content exists
    if (
      !postData.content ||
      (Array.isArray(postData.content) && postData.content.length === 0)
    ) {
      return NextResponse.json(
        { error: 'Content is required for publishing' },
        { status: 400 }
      );
    }

    // Check if content is meaningful (not just empty paragraphs)
    const hasContent = Array.isArray(postData.content)
      ? postData.content.some((node: any) => {
          if (node.children) {
            return node.children.some(
              (child: any) => child.text && child.text.trim()
            );
          }
          return false;
        })
      : true;

    if (!hasContent) {
      return NextResponse.json(
        { error: 'Please add some content before publishing' },
        { status: 400 }
      );
    }

    // Verify the blog publication exists and user has access
    const blogPage = await db.page.findFirst({
      where: {
        id: pageId,
        type: 'BLOG',
        workspaceId,
        workspace: {
          members: {
            some: {
              userId: session.user.id,
              role: { in: ['OWNER', 'ADMIN', 'EDITOR'] },
            },
          },
        },
      },
      include: {
        workspace: {
          select: { slug: true },
        },
      },
    });

    if (!blogPage) {
      return NextResponse.json(
        { error: 'Blog not found or access denied' },
        { status: 403 }
      );
    }

    // Generate slug
    const slug = postData.slug || generateSlug(postData.title);

    // Check slug uniqueness within workspace
    const existingPost = await db.blogPost.findFirst({
      where: {
        slug,
        workspaceId,
        ...(blogPostId && { id: { not: blogPostId } }),
      },
    });

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists in this workspace' },
        { status: 409 }
      );
    }

    // Validate author if provided
    if (postData.authorId) {
      const author = await db.author.findFirst({
        where: {
          id: postData.authorId,
          workspaceId,
        },
      });

      if (!author) {
        return NextResponse.json(
          { error: 'Author not found in this workspace' },
          { status: 400 }
        );
      }
    }

    // Convert content to multiple formats
    const contentFormats = await convertContent(
      Array.isArray(postData.content) ? postData.content : [postData.content],
      ['html', 'mdx']
    );

    const blogPost = blogPostId
      ? await db.blogPost.update({
          where: { id: blogPostId },
          data: {
            title: postData.title,
            slug,
            content: contentFormats.json,
            htmlContent: contentFormats.html,
            mdx: contentFormats.mdx,
            excerpt: postData.excerpt,
            featuredImage: postData.featuredImage,
            tags: postData.tags,
            categories: postData.category ? [postData.category] : [],
            metaTitle: postData.metaTitle,
            metaDescription: postData.metaDescription,
            featured: postData.featured || false,
            pinned: postData.pinned || false,
            readTime: contentFormats.readTime,
            scheduledFor: postData.scheduledFor,
            estimatedReadTime: contentFormats.readTime,
            status: PostStatus.PUBLISHED,
            publishedAt: postData.publishedAt || new Date(),
            ...(postData.authorId && { authorId: postData.authorId }),
          },
        })
      : await db.blogPost.create({
          data: {
            title: postData.title,
            slug,
            content: contentFormats.json,
            htmlContent: contentFormats.html,
            mdx: contentFormats.mdx,
            excerpt: postData.excerpt,
            status: PostStatus.PUBLISHED,
            publishedAt: postData.publishedAt || new Date(),
            featuredImage: postData.featuredImage,
            tags: postData.tags,
            categories: postData.category ? [postData.category] : [],
            metaTitle: postData.metaTitle,
            metaDescription: postData.metaDescription,
            featured: postData.featured || false,
            pinned: postData.pinned || false,
            readTime: contentFormats.readTime,
            scheduledFor: postData.scheduledFor,
            workspaceId,
            pageId,
            estimatedReadTime: contentFormats.readTime,
            ...(postData.authorId && { authorId: postData.authorId }),
          },
        });

    // Revalidate cache
    revalidatePath(`/${blogPage.workspace.slug}/blogs/${blogPage.slug}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Blog post published successfully!',
        blogPostId: blogPost.id,
        data: {
          content: {
            json: contentFormats.json,
            html: contentFormats.html,
            mdx: contentFormats.mdx,
          },
          readTime: contentFormats.readTime,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error publishing blog:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to publish blog',
      },
      { status: 500 }
    );
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
