'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  ChevronDown,
  Hash,
  Circle,
  User,
  ArrowUpDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BlogTableFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  postsCount: number;
}

export function BlogTableFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  postsCount,
}: BlogTableFiltersProps) {
  return (
    <div className="mb-6 flex items-center space-x-2">
      <div className="flex items-center space-x-4">
        <div className="text-sm font-medium text-gray-700">
          {postsCount} Posts
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search Posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64 h-8 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Category Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Hash className="w-3 h-3 mr-1" />
              Category
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>All Categories</DropdownMenuItem>
            <DropdownMenuItem>Company</DropdownMenuItem>
            <DropdownMenuItem>Product</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tags Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Hash className="w-3 h-3 mr-1" />
              Tags
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>All Tags</DropdownMenuItem>
            <DropdownMenuItem>Tag Name</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Circle className="w-3 h-3 mr-1" />
              Status
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>
              All Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('PUBLISHED')}>
              Published
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('DRAFT')}>
              Draft
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('SCHEDULED')}>
              Scheduled
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Author Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <User className="w-3 h-3 mr-1" />
              Authors
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>All Authors</DropdownMenuItem>
            <DropdownMenuItem>Author A</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <ArrowUpDown className="w-3 h-3 mr-1" />
              Recent on top
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>Recent on top</DropdownMenuItem>
            <DropdownMenuItem>Oldest first</DropdownMenuItem>
            <DropdownMenuItem>A to Z</DropdownMenuItem>
            <DropdownMenuItem>Z to A</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
