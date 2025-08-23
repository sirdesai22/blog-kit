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
    <div className="px-4 py-6 sm:px-md lg:px-lg pt-0 flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium">
          {postsCount} <span className='text-muted-foreground font-medium'>Posts</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search Posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 w-64 pl-10 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Hash className="mr-1 h-3 w-3" />
              Category
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>All Categories</DropdownMenuItem>
            <DropdownMenuItem>Company</DropdownMenuItem>
            <DropdownMenuItem>Product</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Hash className="mr-1 h-3 w-3" />
              Tags
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>All Tags</DropdownMenuItem>
            <DropdownMenuItem>Tag Name</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Circle className="mr-1 h-3 w-3" />
              Status
              <ChevronDown className="ml-1 h-3 w-3" />
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <User className="mr-1 h-3 w-3" />
              Authors
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>All Authors</DropdownMenuItem>
            <DropdownMenuItem>Author A</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <ArrowUpDown className="mr-1 h-3 w-3" />
              Recent on top
              <ChevronDown className="ml-1 h-3 w-3" />
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