'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { BlogPostSort } from '@/modules/blogs/actions/blog-table-actions';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  Clock,
  Eye,
  Type,
  CheckCircle,
} from 'lucide-react';

interface BlogTableSortButtonProps {
  sortConfig: BlogPostSort;
  onSort: (field: BlogPostSort['field']) => void;
}

const sortOptions = [
  {
    field: 'createdAt' as const,
    label: 'Date Created',
    icon: Calendar,
  },
  {
    field: 'updatedAt' as const,
    label: 'Date Modified',
    icon: Clock,
  },
  {
    field: 'publishedAt' as const,
    label: 'Date Published',
    icon: Calendar,
  },
  {
    field: 'title' as const,
    label: 'Title',
    icon: Type,
  },
  {
    field: 'status' as const,
    label: 'Status',
    icon: CheckCircle,
  },
  {
    field: 'views' as const,
    label: 'Views',
    icon: Eye,
  },
];

export function BlogTableSortButton({
  sortConfig,
  onSort,
}: BlogTableSortButtonProps) {
  const currentSort = sortOptions.find(
    (option) => option.field === sortConfig.field
  );
  const DirectionIcon = sortConfig.direction === 'asc' ? ArrowUp : ArrowDown;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowUpDown className="h-4 w-4" />
          Sort
          {currentSort && (
            <>
              <span className="text-muted-foreground">by</span>
              <span className="font-medium">{currentSort.label}</span>
              <DirectionIcon className="h-3 w-3" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {sortOptions.map((option) => {
          const Icon = option.icon;
          const isActive = sortConfig.field === option.field;
          const direction = isActive ? sortConfig.direction : null;

          return (
            <DropdownMenuItem
              key={option.field}
              onClick={() => onSort(option.field)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{option.label}</span>
              </div>
              {isActive && (
                <div className="flex items-center">
                  {direction === 'asc' ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                </div>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
