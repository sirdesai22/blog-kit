'use client';

import * as React from 'react';
import { useState } from 'react';

import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/components/platejs/editor/editor-kit';
import { Editor, EditorContainer } from '../../ui/editor';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BlogEditorToolbar } from '@/components/blogs/blog-editor-toolbar';

interface PlateEditorProps {
  initialValue?: any[];
  onChange?: (content: any[]) => void;
  placeholder?: string;
  // Blog-specific props
  title?: string;
  description?: string;
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
  // Toolbar props
  workspaceSlug?: string;
  blogId?: string;
  onSave?: () => void;
  onPublish?: () => void;
  isSaving?: boolean;
  isPublishing?: boolean;
  showToolbar?: boolean;
}

export function PlateEditor({
  initialValue,
  onChange,
  placeholder = "Press '/' for commands or start typing...",
  title = '',
  description = '',
  onTitleChange,
  onDescriptionChange,
  workspaceSlug,
  blogId,
  onSave,
  onPublish,
  isSaving = false,
  isPublishing = false,
  showToolbar = false,
}: PlateEditorProps) {
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: initialValue || value,
  });

  const initvalue = [
    {
      children: [{ text: '' }],
      type: 'p',
    },
  ];
  return (
    <Plate
      editor={editor}
      onValueChange={(newValue) => {
        console.log('Plate onValueChange triggered with value:', newValue); // Debug log
        if (newValue.value) {
          onChange?.(newValue.value);
        }
      }}
    >
      {/* Toolbar - now inside Plate context */}
      <BlogEditorToolbar
        workspaceSlug={workspaceSlug}
        blogId={blogId}
        onSave={onSave}
        onPublish={onPublish}
        isSaving={isSaving}
        isPublishing={isPublishing}
      />

      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <Input
              value={title}
              onChange={(e) => onTitleChange?.(e.target.value)}
              placeholder="Post Title"
              className="text-4xl font-bold border-none bg-transparent p-0 focus-visible:ring-0 placeholder:text-gray-400 shadow-none"
            />
          </div>

          {/* Meta Description */}
          <div>
            <Input
              value={description}
              onChange={(e) => onDescriptionChange?.(e.target.value)}
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

          {/* Editor */}
          <div className="mt-8">
            <EditorContainer>
              <Editor
                value={initvalue}
                variant="demo"
                placeholder={placeholder}
              />
            </EditorContainer>
          </div>
        </div>
      </div>
    </Plate>
  );
}
const value = [
  {
    children: [{ text: '' }],
    type: 'p',
  },
];
