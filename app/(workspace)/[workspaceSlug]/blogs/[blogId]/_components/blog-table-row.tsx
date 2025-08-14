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
import { MoreHorizontal, Edit2, Pin, Copy, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
  createdAt: Date;
  updatedAt: Date;
  author: string;
  publishedAt: Date | null;
}

interface BlogTableRowProps {
  post: BlogPost;
  workspaceSlug: string;
}

export function BlogTableRow({ post, workspaceSlug }: BlogTableRowProps) {
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
        return 'Staged';
      default:
        return status;
    }
  };

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="px-4 py-4"></TableCell>
      <TableCell className="px-4 py-4">
        <div>
          <Link
            href={`/${workspaceSlug}/pages/${post.id}`}
            className="text-sm font-medium text-gray-900 hover:text-blue-600"
          >
            {post.title}
          </Link>
        </div>
      </TableCell>

      <TableCell className="px-4 py-4">
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-xl ${getStatusColor(
            post.status
          )}`}
        >
          {getStatusLabel(post.status)}
        </span>
      </TableCell>

      <TableCell className="px-4 py-4">
        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-xl border border-gray-200">
          Category
        </span>
        <span className="text-xs text-gray-400 ml-1">+2</span>
      </TableCell>

      <TableCell className="px-4 py-4">
        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-xl border border-gray-200">
          Tag Name
        </span>
        <span className="text-xs text-gray-400 ml-1">+2</span>
      </TableCell>

      <TableCell className="px-4 py-4">
        <div className="flex items-center space-x-2">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs bg-gray-200 text-gray-700">
              {post.author}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-gray-400">+2</span>
        </div>
      </TableCell>

      <TableCell className="px-4 py-4">
        <div className="text-xs text-gray-500">
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

      <TableCell className="px-4 py-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3 text-gray-400" />
            <span className="text-xs font-medium text-gray-900">
              {(trafficData.views / 1000).toFixed(1)}k
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-green-600 bg-green-50 px-1 rounded">
              +{trafficData.growth}%
            </span>
          </div>
        </div>
      </TableCell>

      <TableCell className="px-4 py-4">
        <span className="text-xs font-medium text-red-600 bg-red-50 px-1 rounded">
          {trafficData.leads} -{Math.floor(Math.random() * 5) + 1}%
        </span>
      </TableCell>

      <TableCell className="px-4 py-4">
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
            <DropdownMenuItem>
              <Pin className="mr-2 h-4 w-4" />
              Pin / Unpin
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
