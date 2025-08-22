'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Edit2,
  Pin,
  Copy,
  Trash2,
  Eye,
  GripVertical,
} from 'lucide-react';
import Link from 'next/link';
import { BlogPost } from '@/types/blog';
import { useBlogTable } from '@/contexts/BlogTableContext';
import { cn } from '@/lib/utils';

interface BlogTableRowProps {
  post: BlogPost;
  workspaceSlug: string;
}

export function BlogTableRow({ post, workspaceSlug }: BlogTableRowProps) {
  const { pinnedIds, togglePin } = useBlogTable();
  const isPinned = pinnedIds.has(post.id) || post.pinned;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700 border border-gray-200';
      case 'SCHEDULED':
        return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'ARCHIVED':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'DELETED':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'Published';
      case 'DRAFT':
        return 'Draft';
      case 'SCHEDULED':
        return 'Scheduled';
      case 'ARCHIVED':
        return 'Archived';
      case 'DELETED':
        return 'Deleted';
      default:
        return status;
    }
  };

  // Calculate total authors
  const coAuthorsCount = post.coAuthorIds?.length || 0;
  const hasAuthor = !!post.author;
  const totalAuthors = (hasAuthor ? 1 : 0) + coAuthorsCount;

  return (
    <TableRow className="group hover:bg-muted/50">
      <TableCell>
        <div className="flex items-center space-x-2">
          <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-6 w-6 transition-opacity',
              isPinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            )}
            onClick={() => togglePin(post.id)}
          >
            <Pin
              className={cn(
                'h-4 w-4',
                isPinned
                  ? 'fill-current text-foreground'
                  : 'text-muted-foreground'
              )}
            />
          </Button>
        </div>
      </TableCell>

      <TableCell>
        <div>
          <Link
            href={`/${workspaceSlug}/blogs/${post.pageId}/${post.id}/edit`}
            className="text-sm font-medium text-foreground hover:text-primary"
          >
            {post.title}
          </Link>
          {post.excerpt && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {post.excerpt}
            </p>
          )}
        </div>
      </TableCell>

      <TableCell>
        <span
          className={`inline-flex items-center rounded-xl px-2 py-1 text-xs font-medium ${getStatusColor(
            post.status
          )}`}
        >
          {getStatusLabel(post.status)}
        </span>
      </TableCell>

      <TableCell>
        {post.categories && post.categories.length > 0 ? (
          <div className="flex items-center gap-1">
            <span className="inline-flex rounded-xl border border-border bg-muted/50 px-2 py-1 text-xs font-medium text-muted-foreground">
              {post.categories[0]}
            </span>
            {post.categories.length > 1 && (
              <span className="text-xs text-muted-foreground">
                +{post.categories.length - 1}
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No category</span>
        )}
      </TableCell>

      <TableCell>
        {post.tags && post.tags.length > 0 ? (
          <div className="flex items-center gap-1">
            <span className="inline-flex rounded-xl border border-border bg-muted/50 px-2 py-1 text-xs font-medium text-muted-foreground">
              {post.tags[0]}
            </span>
            {post.tags.length > 1 && (
              <span className="text-xs text-muted-foreground">
                +{post.tags.length - 1}
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No tags</span>
        )}
      </TableCell>

      <TableCell>
        <div className="flex items-center space-x-2">
          {post.author ? (
            <>
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.author.image || ''} />
                <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                  {post.author.name ? post.author.name[0].toUpperCase() : 'A'}
                </AvatarFallback>
              </Avatar>
              {totalAuthors > 1 && (
                <span className="text-xs text-muted-foreground">
                  +{totalAuthors - 1}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-muted-foreground">No author</span>
          )}
        </div>
      </TableCell>

      <TableCell>
        <div className="text-xs text-muted-foreground">
          <div>
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: '2-digit',
                })
              : 'Not published'}{' '}
            /{' '}
            {new Date(post.updatedAt).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: '2-digit',
            })}
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Eye className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">
              {post.views > 1000
                ? `${(post.views / 1000).toFixed(1)}k`
                : post.views.toString()}
            </span>
          </div>
          {post.status === 'PUBLISHED' && post.views > 0 && (
            <div className="flex items-center">
              <span className="rounded bg-green-50 px-1 text-xs text-green-600">
                +{Math.floor(Math.random() * 30) + 10}%
              </span>
            </div>
          )}
        </div>
      </TableCell>

      <TableCell>
        <span className="rounded bg-red-50 px-1 text-xs font-medium text-red-600">
          {Math.floor(Math.random() * 20)} -{Math.floor(Math.random() * 5) + 1}%
        </span>
      </TableCell>

      <TableCell className="sticky right-0 z-10 bg-background text-center group-hover:bg-muted">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link
                href={`/${workspaceSlug}/blogs/${post.pageId}/${post.id}/edit`}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Post
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => togglePin(post.id)}>
              <Pin className="mr-2 h-4 w-4" />
              {isPinned ? 'Unpin' : 'Pin'}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
