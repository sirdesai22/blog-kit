'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit2, Pin, Copy, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { BlogPost } from '@/types/blog';
import { useBlogTable } from '@/modules/blogs/contexts/BlogTableContext';
import { cn } from '@/lib/utils';

interface BlogTableRowProps {
  post: BlogPost;
  workspaceSlug: string;
}

export function BlogTableRow({ post, workspaceSlug }: BlogTableRowProps) {
  const { pinnedIds, togglePin, selectedIds, toggleSelection } = useBlogTable();
  const isPinned = pinnedIds.has(post.id) || post.pinned;
  const isSelected = selectedIds.has(post.id);

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
    <TableRow
      className={cn(
        'group hover:bg-muted/50',
        isSelected && 'bg-blue-50 hover:bg-blue-50'
      )}
    >
      <TableCell className="pl-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleSelection(post.id)}
          aria-label={`Select ${post.title}`}
        />
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          {isPinned && <Pin className="h-3 w-3 fill-current text-blue-600" />}
          <div>
            <Link
              href={`/${workspaceSlug}/blogs/${post.pageId}/${post.id}/edit`}
              className="text-sm font-medium text-foreground hover:text-primary"
            >
              {post.title}
            </Link>
          </div>
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
              {post.categories[0].name}
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
              {post.tags[0].name}
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

      <TableCell className="text-center group-hover:bg-muted">
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
