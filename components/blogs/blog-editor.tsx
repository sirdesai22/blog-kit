'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MoreVertical, RefreshCw } from 'lucide-react';
import { BlogEditorSidebar, BlogPost, Author } from './blog-editor-sidebar';
import Link from 'next/link';
import { TiptapEditor } from '@/components/ui/tiptap-editor';

interface BlogEditorProps {
  workspaceSlug: string;
  blogId: string;
  initialPost?: BlogPost;
  categories: string[];
  authors: Author[];
  allPosts: BlogPost[];
  tags: string[]; // Add this line
  isNewPost?: boolean;
}

export function BlogEditor({
  workspaceSlug,
  blogId,
  initialPost,
  categories,
  authors,
  allPosts,
  tags, // Add this line
  isNewPost = true,
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

  const [wordCount, setWordCount] = useState(100);
  const [isSaving, setIsSaving] = useState(false);

  const handlePostChange = (updatedPost: BlogPost) => {
    setPost(updatedPost);

    // Calculate word count
    if (updatedPost.content !== post.content) {
      const words = (updatedPost.content || '')
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
      setWordCount(words);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate saving
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handlePublish = async () => {
    // Handle publish
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navbar */}

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Content Area */}
        <div className="flex-1 bg-gray-50">
          <div className="max-w-4xl mx-auto px-8 py-8">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <Input
                  value={post.title}
                  onChange={(e) =>
                    handlePostChange({ ...post, title: e.target.value })
                  }
                  placeholder="Post Title"
                  className="text-4xl font-bold border-none bg-transparent p-0 focus-visible:ring-0 placeholder:text-gray-400 shadow-none"
                />
              </div>

              {/* Meta Description */}
              <div>
                <Input
                  value={post.description}
                  onChange={(e) =>
                    handlePostChange({ ...post, description: e.target.value })
                  }
                  placeholder="Excerpt / Meta Description"
                  className="text-lg text-gray-600 border-none bg-transparent p-0 focus-visible:ring-0 placeholder:text-gray-400 shadow-none"
                />
              </div>

              {/* Featured Image Upload */}
              <div className="mt-8">
                <Card className="border-2 border-dashed border-gray-300 bg-white">
                  <CardContent className="p-12">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg text-gray-500 font-medium">
                          Upload featured (OG) image
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Recommended: 1200 x 630 px (Facebook, Twitter, etc.)
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="bg-white border-gray-300"
                      >
                        Use Default Image
                      </Button>
                      <p className="text-xs text-gray-400">
                        Uses Logo, Post Title and Description to generate image
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tiptap Editor */}
              <div className="mt-8">
                <TiptapEditor
                  content={post.content}
                  onChange={(content) => handlePostChange({ ...post, content })}
                  placeholder="Press '/' for commands or start typing..."
                  minHeight="400px"
                  className="min-h-[400px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 flex-shrink-0">
          <BlogEditorSidebar
            post={post}
            categories={categories}
            authors={authors}
            allPosts={allPosts}
            tags={tags} // Add this line
            onPostChange={handlePostChange}
            onSave={handleSave}
            onPublish={handlePublish}
            isSaving={isSaving}
            isPublishing={false}
          />
        </div>
      </div>
    </div>
  );
}
