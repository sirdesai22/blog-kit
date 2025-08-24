'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { BlogEditorSidebar, BlogPost, Author } from './blog-editor-sidebar';
import { PlateEditor } from '../../../components/platejs/components/editor/plate-editor';

interface BlogEditorProps {
  workspaceSlug: string;
  blogId?: string; // This is actually pageId (the blog publication)
  initialPost?: BlogPost;
  categories: string[];
  authors: Author[];
  allPosts: any[];
  tags: string[];
  isNewPost?: boolean;
  workspaceId: string;
}

export function BlogEditor({
  workspaceSlug,
  blogId, // This is the pageId of the blog publication
  initialPost,
  categories,
  authors,
  allPosts,
  tags,
  isNewPost = true,
  workspaceId,
}: BlogEditorProps) {
  const [post, setPost] = useState<BlogPost>({
    title: '',
    content: '',
    description: '',
    category: '',
    tags: [],
    authorIds: [],
    featuredImage: '',
    publishDate: undefined,
    relatedArticleIds: [],
    status: 'DRAFT',
    readTime: 5,
    ...initialPost,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [currentBlogPostId, setCurrentBlogPostId] = useState<
    string | undefined
  >(initialPost?.id);

  const handlePostChange = (updatedPost: BlogPost) => {
    setPost(updatedPost);
  };

  const handleContentChange = (content: any[]) => {
    console.log('BlogEditor handleContentChange called!'); // Debug log
    console.log('BlogEditor received content:', content); // Debug log
    console.log('Content length:', content?.length); // Debug log
    console.log('Content structure:', JSON.stringify(content, null, 2)); // Debug log

    handlePostChange({ ...post, content: JSON.stringify(content) });
  };

  const handleTitleChange = (title: string) => {
    const slug = generateSlug(title);
    handlePostChange({ ...post, title, slug });
  };

  const handleDescriptionChange = (description: string) => {
    handlePostChange({ ...post, description });
  };

  const handleSave = async () => {
    if (!post.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!blogId) {
      toast.error('Blog ID is required');
      return;
    }

    if (!workspaceId) {
      toast.error('Workspace ID is required');
      return;
    }

    setIsSaving(true);

    try {
      console.log(post);
      const content = post.content ? JSON.parse(post.content) : [];

      const requestData = {
        title: post.title,
        slug: post.slug,
        content,
        excerpt: post.description,
        featuredImage: post.featuredImage,
        tags: post.tags,
        category: post.category,
        metaTitle: post.title,
        metaDescription: post.description,
        featured: false,
        pinned: false,
        scheduledFor: post.publishDate,
        authorIds: post.authorIds,
        workspaceId,
        pageId: blogId,
        blogPostId: currentBlogPostId,
      };
      console.log(content);
      const response = await fetch('/api/blogs/posts/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);

        if (!currentBlogPostId && result.blogPostId) {
          setCurrentBlogPostId(result.blogPostId);
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to save draft');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!post.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!post.content || post.content.trim() === '') {
      toast.error('Please add some content');
      return;
    }

    if (!blogId) {
      toast.error('Blog ID is required');
      return;
    }

    setIsPublishing(true);

    try {
      const content = JSON.parse(post.content);

      const requestData = {
        title: post.title,
        slug: post.slug,
        content,
        excerpt: post.description,
        featuredImage: post.featuredImage,
        tags: post.tags,
        category: post.category,
        metaTitle: post.title,
        metaDescription: post.description,
        featured: false,
        pinned: false,
        publishedAt: post.publishDate || new Date(),
        workspaceId,
        pageId: blogId,
        blogPostId: currentBlogPostId,
      };

      const response = await fetch('/api/blog-posts/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        // Redirect to the blog posts list
        window.location.href = `/${workspaceSlug}/blogs/${blogId}`;
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to publish blog');
      console.error('Publish error:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1  overflow-auto">
          <PlateEditor
            initialValue={post.content ? JSON.parse(post.content) : undefined}
            onChange={handleContentChange}
            title={post.title}
            description={post.description}
            onTitleChange={handleTitleChange}
            onDescriptionChange={handleDescriptionChange}
            placeholder="Press '/' for commands or start typing..."
            workspaceSlug={workspaceSlug}
            blogId={blogId || 'new'}
            onSave={handleSave}
            onPublish={handlePublish}
            isSaving={isSaving}
            isPublishing={isPublishing}
          />
        </div>

        <div className="w-80  border-l border-gray-200 flex-shrink-0">
          <BlogEditorSidebar
            post={post}
            categories={categories}
            authors={authors}
            allPosts={allPosts}
            tags={tags}
            onPostChange={handlePostChange}
            onSave={handleSave}
            onPublish={handlePublish}
            isSaving={isSaving}
            isPublishing={isPublishing}
          />
        </div>
      </div>
    </div>
  );
}

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
