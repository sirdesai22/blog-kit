'use client';

import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Eye,
  ChevronDown,
  Undo2,
  Redo2,
  MoreVertical,
} from 'lucide-react';
import Link from 'next/link';
import { useEditorRef, useEditorSelector } from 'platejs/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface BlogEditorToolbarProps {
  workspaceSlug: string;
  blogId: string;
  onSave?: () => void;
  onPublish?: () => void;
  isSaving?: boolean;
  isPublishing?: boolean; // Add this line
}

export function BlogEditorToolbar({
  workspaceSlug,
  blogId,
  onSave,
  onPublish,
  isSaving = false,
  isPublishing = false, // Add this
}: BlogEditorToolbarProps) {
  const editor = useEditorRef();
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Undo/Redo state
  const canUndo = useEditorSelector(
    (editor) => editor.history.undos.length > 0,
    []
  );
  const canRedo = useEditorSelector(
    (editor) => editor.history.redos.length > 0,
    []
  );

  // Calculate word count and read time from editor content
  const calculateStats = useCallback(() => {
    if (!editor) return;

    try {
      const content = editor.children;
      let text = '';

      // Extract text from editor nodes recursively
      const extractText = (nodes: any[]): string => {
        return nodes
          .map((node) => {
            if (node.text) {
              return node.text;
            }
            if (node.children) {
              return extractText(node.children);
            }
            return '';
          })
          .join(' ');
      };

      text = extractText(content);

      // Calculate word count
      const words = text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
      const estimatedReadTime = Math.ceil(words / 200); // 200 words per minute

      setWordCount(words);
      setReadTime(estimatedReadTime);
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  }, [editor]);

  // Update stats when editor content changes
  useEditorSelector(
    (editor) => {
      calculateStats();
      return editor.children;
    },
    [calculateStats]
  );

  // Auto-save functionality
  useEffect(() => {
    if (!editor) return;

    const autoSaveInterval = setInterval(() => {
      if (onSave && wordCount > 0) {
        onSave();
        setLastSaved(new Date());
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [editor, onSave, wordCount]);

  const handleUndo = () => {
    if (editor && canUndo) {
      editor.undo();
    }
  };

  const handleRedo = () => {
    if (editor && canRedo) {
      editor.redo();
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'Not saved';
    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    return `${diffMins} mins ago`;
  };

  const handlePublishClick = async () => {
    if (onPublish) {
      await onPublish();
    }
  };

  const handleSaveClick = async () => {
    if (onSave) {
      await onSave();
    }
  };

  return (
    <div className=" px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <Link href={`/${workspaceSlug}/blogs/${blogId}`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 px-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Go back
            </Button>
          </Link>

          <div className="text-sm text-gray-500">
            {readTime} min read | {wordCount} words
          </div>

          {/* Undo/Redo buttons */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 px-2"
              onClick={handleUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 px-2"
              onClick={handleRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Center - Status indicators */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 text-sm">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Draft
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {isSaving ? 'Saving...' : 'Saved'}
            </span>
            {lastSaved && (
              <span className="text-xs text-gray-400">{formatLastSaved()}</span>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>

          <DropdownMenu>
            <div className="flex items-center">
              <Button
                onClick={handlePublishClick}
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-r-none border-r border-gray-700"
                size="sm"
                disabled={isSaving || isPublishing} // Update this line
              >
                {isPublishing ? 'Publishing...' : 'Publish'}
              </Button>
              <DropdownMenuTrigger asChild>
                <Button
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-l-none px-2"
                  size="sm"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
            </div>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Publish now</DropdownMenuItem>
              <DropdownMenuItem>Schedule for later</DropdownMenuItem>
              <DropdownMenuItem>Save as draft</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                Delete post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
