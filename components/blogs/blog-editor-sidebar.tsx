'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, Clock, X, Settings2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface BlogPost {
  id?: string;
  title: string;
  content: any;
  description?: string;
  category?: string;
  tags: string[];
  authorIds: string[];
  featuredImage?: string;
  publishDate?: Date;
  relatedArticleIds: string[];
  status?: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
  readTime?: number;
}

export interface Author {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
}

interface BlogEditorSidebarProps {
  post: BlogPost;
  categories: string[];
  authors: Author[];
  allPosts: BlogPost[]; // Now contains only posts from the specific blog
  onPostChange: (post: BlogPost) => void;
  onSave: () => void;
  onPublish: () => void;
  isSaving?: boolean;
  isPublishing?: boolean;
}

type TabType = 'settings' | 'seo' | 'advanced';

export function BlogEditorSidebar({
  post,
  categories,
  authors,
  allPosts, // This now contains only posts from the current blog
  onPostChange,
  onSave,
  onPublish,
  isSaving = false,
  isPublishing = false,
}: BlogEditorSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  const [selectedAuthors, setSelectedAuthors] = useState<Author[]>([]);
  const [selectedRelatedArticles, setSelectedRelatedArticles] = useState<
    BlogPost[]
  >([]);
  const [tagInput, setTagInput] = useState('');

  // SEO fields
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  useEffect(() => {
    const postAuthors = authors.filter((author) =>
      post.authorIds.includes(author.id)
    );
    setSelectedAuthors(postAuthors);

    const relatedPosts = allPosts.filter((p) =>
      post.relatedArticleIds.includes(p.id || '')
    );
    setSelectedRelatedArticles(relatedPosts);
  }, [post.authorIds, post.relatedArticleIds, authors, allPosts]);

  const handleCategoryChange = (category: string) => {
    onPostChange({ ...post, category });
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!post.tags.includes(newTag)) {
        onPostChange({ ...post, tags: [...post.tags, newTag] });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onPostChange({
      ...post,
      tags: post.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleAuthorToggle = (author: Author) => {
    const isSelected = post.authorIds.includes(author.id);
    const newAuthorIds = isSelected
      ? post.authorIds.filter((id) => id !== author.id)
      : [...post.authorIds, author.id];

    onPostChange({ ...post, authorIds: newAuthorIds });
  };

  const handleRelatedArticleToggle = (article: BlogPost) => {
    const isSelected = post.relatedArticleIds.includes(article.id || '');
    const newRelatedIds = isSelected
      ? post.relatedArticleIds.filter((id) => id !== article.id)
      : [...post.relatedArticleIds, article.id || ''];

    onPostChange({ ...post, relatedArticleIds: newRelatedIds });
  };

  const handlePublishDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined;
    onPostChange({ ...post, publishDate: date });
  };

  const tabs = [
    { id: 'settings', label: 'Settings' },
    { id: 'seo', label: 'SEO' },
    { id: 'advanced', label: 'Advanced' },
  ] as const;

  const renderSettingsTab = () => (
    <div className="space-y-6 ">
      {/* Category */}
      <div>
        <Label className="text-sm font-medium text-gray-700">Category</Label>
        <Select value={post.category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="Select Categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      <div>
        <Label className="text-sm font-medium text-gray-700">Tag</Label>
        <div className="mt-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Select Tags"
            className="mb-2"
          />
          <div className="flex flex-wrap gap-1">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Authors */}
      <div>
        <Label className="text-sm font-medium text-gray-700">Authors</Label>
        <Select
          onValueChange={(value) => {
            const author = authors.find((a) => a.id === value);
            if (author) handleAuthorToggle(author);
          }}
        >
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="Select author(s)" />
          </SelectTrigger>
          <SelectContent>
            {authors.map((author) => (
              <SelectItem key={author.id} value={author.id}>
                <div className="flex items-center space-x-2">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={author.image || ''} />
                    <AvatarFallback className="text-xs">
                      {(author.name || author.email)[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{author.name || author.email}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="mt-2 space-y-2">
          {selectedAuthors.map((author) => (
            <div
              key={author.id}
              className="flex items-center justify-between text-sm bg-gray-50 rounded px-2 py-1"
            >
              <div className="flex items-center space-x-2">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={author.image || ''} />
                  <AvatarFallback className="text-xs">
                    {(author.name || author.email)[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{author.name || author.email}</span>
              </div>
              <button
                onClick={() => handleAuthorToggle(author)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Publish Date */}
      <div>
        <Label className="text-sm font-medium text-gray-700">
          Publish Date
        </Label>
        <div className="relative mt-2">
          <Input
            type="date"
            value={
              post.publishDate
                ? post.publishDate.toISOString().split('T')[0]
                : ''
            }
            onChange={handlePublishDateChange}
            className="pl-10"
          />
          <CalendarDays className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Related Articles - Updated */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium text-gray-700">
            Related Articles
          </Label>
          <div className="flex items-center space-x-1">
            <input
              type="checkbox"
              id="auto-related"
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              defaultChecked
            />
            <label htmlFor="auto-related" className="text-xs text-gray-600">
              Auto
            </label>
            <Settings2 className="w-3 h-3 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          {/* Show message if no articles available */}
          {allPosts.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No other articles in this blog yet
            </p>
          )}

          {/* Show up to 5 article selectors */}
          {[1, 2, 3, 4, 5].map((num) => (
            <Select
              key={num}
              onValueChange={(value) => {
                const article = allPosts.find((p) => p.id === value);
                if (article) handleRelatedArticleToggle(article);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`Article ${num}`} />
              </SelectTrigger>
              <SelectContent>
                {allPosts
                  .filter((p) => p.id !== post.id) // Exclude current post
                  .map((article) => (
                    <SelectItem key={article.id} value={article.id || ''}>
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate">{article.title}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {article.status}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          ))}
        </div>

        {/* Show selected related articles */}
        {selectedRelatedArticles.length > 0 && (
          <div className="mt-3 space-y-2">
            <Label className="text-xs text-gray-600">Selected Articles:</Label>
            {selectedRelatedArticles.map((article, index) => (
              <div
                key={article.id}
                className="flex items-center justify-between bg-gray-50 rounded px-2 py-1"
              >
                <div>
                  <p className="text-sm font-medium">Article {index + 1}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {article.title}
                  </p>
                </div>
                <button
                  onClick={() => handleRelatedArticleToggle(article)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Section */}
      <div>
        <Label className="text-sm font-medium text-gray-700">Form</Label>
        <div className="mt-2 p-3 border border-gray-200 rounded-md text-center text-gray-500 text-sm">
          No form selected
        </div>
      </div>
    </div>
  );

  const renderSeoTab = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium text-gray-700">SEO Title</Label>
        <Input
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
          placeholder="Enter SEO title..."
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700">
          Meta Description
        </Label>
        <Textarea
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
          placeholder="Enter meta description..."
          className="mt-2 min-h-[100px]"
        />
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700">Keywords</Label>
        <Input
          value={seoKeywords}
          onChange={(e) => setSeoKeywords(e.target.value)}
          placeholder="Enter keywords separated by commas..."
          className="mt-2"
        />
      </div>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium text-gray-700">Custom CSS</Label>
        <Textarea
          placeholder="Add custom CSS..."
          className="mt-2 min-h-[100px] font-mono text-sm"
        />
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700">
          Custom JavaScript
        </Label>
        <Textarea
          placeholder="Add custom JavaScript..."
          className="mt-2 min-h-[100px] font-mono text-sm"
        />
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700">
          Canonical URL
        </Label>
        <Input
          placeholder="https://example.com/canonical-url"
          className="mt-2"
        />
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-black text-black bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'settings' && renderSettingsTab()}
        {activeTab === 'seo' && renderSeoTab()}
        {activeTab === 'advanced' && renderAdvancedTab()}
      </div>
    </div>
  );
}
