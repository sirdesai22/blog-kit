'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { BlogPost } from '@/lib/mock-data';
import { useBlogTable } from '@/contexts/BlogTableContext';
import { cn } from '@/lib/utils';

interface BlogTableRowProps {
  post: BlogPost;
  workspaceSlug: string;
}

export function BlogTableRow({ post, workspaceSlug }: BlogTableRowProps) {
  const { pinnedIds, togglePin } = useBlogTable();
  const isPinned = pinnedIds.has(post.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700 border border-gray-200';
      case 'SCHEDULED':
        return 'bg-orange-100 text-orange-700 border border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const generateMockTrafficData = () => {
    const baseViews =
      post.status === 'PUBLISHED'
        ? 1200
        : post.status === 'SCHEDULED'
        ? 1200
        : 0;
    const growth =
      post.status === 'DRAFT' ? 0 : Math.floor(Math.random() * 30) + 10;
    return {
      views: baseViews + Math.floor(Math.random() * 200),
      growth,
      leads: Math.floor(growth * 0.8) + Math.floor(Math.random() * 10),
    };
  };

  const trafficData = generateMockTrafficData();

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'Published';
      case 'DRAFT':
        return 'Draft';
      case 'SCHEDULED':
        return 'Scheduled';
      default:
        return status;
    }
  };

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
            href={`/${workspaceSlug}/blogs/${post.id}`}
            className="text-sm font-medium text-foreground hover:text-primary"
          >
            {post.title}
          </Link>
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
        <span className="inline-flex rounded-xl border border-border bg-muted/50 px-2 py-1 text-xs font-medium text-muted-foreground">
          Category
        </span>
        <span className="ml-1 text-xs text-muted-foreground">+2</span>
      </TableCell>
      <TableCell>
        <span className="inline-flex rounded-xl border border-border bg-muted/50 px-2 py-1 text-xs font-medium text-muted-foreground">
          Tag Name
        </span>
        <span className="ml-1 text-xs text-muted-foreground">+2</span>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-muted text-xs text-muted-foreground">
              {post.author}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">+2</span>
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
              : 'N/A'}{' '}
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
              {(trafficData.views / 1000).toFixed(1)}k
            </span>
          </div>
          <div className="flex items-center">
            <span className="rounded bg-green-50 px-1 text-xs text-green-600">
              +{trafficData.growth}%
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="rounded bg-red-50 px-1 text-xs font-medium text-red-600">
          {trafficData.leads} -{Math.floor(Math.random() * 5) + 1}%
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
            <DropdownMenuItem>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Post
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