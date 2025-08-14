'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MoreHorizontal,
  Search,
  Filter,
  Edit2,
  Pin,
  Copy,
  Trash2,
  Plus,
  Calendar,
  Eye,
  TrendingUp,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  Heading,
  headingVariants,
  subtitleVariants,
} from '@/components/ui/heading';
import { useRouter } from 'next/navigation';

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

interface BlogTableViewProps {
  posts: BlogPost[];
  workspaceSlug: string;
  currentPage: {
    id: string;
    title: string;
    type: string;
  };
}

export function BlogTableView({
  posts,
  workspaceSlug,
  currentPage,
}: BlogTableViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const router = useRouter();
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const generateMockTrafficData = () => {
    return {
      views: Math.floor(Math.random() * 10000) + 100,
      growth: Math.floor(Math.random() * 100) - 50, // -50 to +50
    };
  };
  const newPage = () => {
    router.push(`/${workspaceSlug}/blogs/${currentPage.id}/new`);
  };
  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Heading
                level="h1"
                variant="default"
                subtitleVariant="muted"
                subtitleSize="xs"
                subtitle={
                  <>
                    Create and edit and pin posts.
                    <span className="text-blue-600 cursor-pointer">
                      Watch tutorial (2 mins)
                    </span>
                  </>
                }
              >
                Posts
              </Heading>
            </div>
            <Button onClick={newPage}>
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="mb-6 flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Category
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Views
          </Button>
          <Button variant="outline" size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Author
          </Button>
          <Button variant="outline" size="sm">
            Recent on top
          </Button>
        </div>

        {/* Table */}

        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </TableHead>
              <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Post
              </TableHead>
              <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </TableHead>
              <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Published
              </TableHead>
              <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modified
              </TableHead>
              <TableHead className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Traffic
              </TableHead>
              <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.map((post) => {
              const trafficData = generateMockTrafficData();
              return (
                <TableRow key={post.id}>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                        post.status
                      )}`}
                    >
                      {post.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      Company
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <Link
                          href={`/${workspaceSlug}/pages/${post.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {post.title}
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">Tag Name</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {post.author[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDistanceToNow(new Date(post.updatedAt), {
                      addSuffix: false,
                    })}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {trafficData.views.toLocaleString()}
                        </span>
                      </div>
                      <div
                        className={`text-xs ${
                          trafficData.growth > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {trafficData.growth > 0 ? '+' : ''}
                        {trafficData.growth}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
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
            })}
          </TableBody>
        </Table>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Heading
                level="h3"
                variant="default"
                subtitle={
                  searchTerm
                    ? 'Try adjusting your search criteria.'
                    : 'Get started by creating your first blog post.'
                }
                subtitleVariant="muted"
                className="mb-6"
              >
                No blog posts found
              </Heading>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
