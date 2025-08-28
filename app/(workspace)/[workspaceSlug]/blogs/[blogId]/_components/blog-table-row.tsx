"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit2,
  Pin,
  Copy,
  Trash2,
  Eye,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { BlogPost } from "@/types/blog";
import { useBlogTable } from "@/modules/blogs/contexts/BlogTableContext";
import { cn } from "@/lib/utils";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { formatDate } from "@/utils/date";

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
      case "PUBLISHED":
        return "bg-green-100 text-green-700 border border-green-200";
      case "DRAFT":
        return "bg-gray-100 text-gray-700 border border-gray-200";
      case "SCHEDULED":
        return "bg-orange-100 text-orange-700 border border-orange-200";
      case "ARCHIVED":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      case "DELETED":
        return "bg-red-100 text-red-700 border border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "Published";
      case "DRAFT":
        return "Draft";
      case "SCHEDULED":
        return "Scheduled";
      case "ARCHIVED":
        return "Archived";
      case "DELETED":
        return "Deleted";
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
        "group hover:bg-muted/50",
        isSelected && "bg-blue-50 hover:bg-blue-50"
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
          {isPinned && (
            <Pin className="h-4 w-4 fill-current text-muted-foreground" />
          )}
          <Link
            href={`/${workspaceSlug}/blogs/${post.pageId}/${post.id}/edit`}
            className="cursor-pointer group inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary"
          >
            {post.title}
            <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </TableCell>

      <TableCell>
        <span
          className={`inline-flex items-center rounded-xl px-2 py-1 text-xs font-medium ${getStatusColor(
            post.status
          )}`}
        >
          <span className="text-[8px] mr-1 leading-none">●</span>
          {getStatusLabel(post.status)}
        </span>
      </TableCell>

      <TableCell>
        {post.categories && post.categories.length > 0 ? (
          <div className="flex items-center gap-1">
            {post.categories.length > 1 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <span className="inline-flex rounded-xl border border-border bg-muted/50 px-2 py-1 text-small font-medium">
                      {post.categories[0].name}
                    </span>
                    {post.categories.length > 1 && (
                      <span className="text-small">
                        +{post.categories.length - 1}
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  sideOffset={5}
                  className="flex flex-col gap-1 p-2 bg-popover border border-border rounded-md shadow-lg"
                >
                  {post.categories.map((category, index) => (
                    <span key={index} className=" text-normal">
                      {category.name}
                    </span>
                  ))}
                </TooltipContent>
              </Tooltip>
            ) : (
              <span className="inline-flex rounded-xl border border-border bg-muted/50 px-2 py-1 text-xs font-medium text-muted-foreground">
                {post.categories[0].name}
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
            {post.tags.length > 1 ? (
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent
                  sideOffset={5}
                  className="flex flex-col gap-1 p-2 bg-popover border border-border rounded-md shadow-lg"
                >
                  {post.tags.map((tag, index) => (
                    <span key={index} className="text-normal">
                      {tag.name}
                    </span>
                  ))}
                </TooltipContent>
              </Tooltip>
            ) : (
              <span className="inline-flex rounded-xl border border-border bg-muted/50 px-2 py-1 text-xs font-medium text-muted-foreground">
                {post.tags[0].name}
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
            <div className="flex items-center gap-1">
              <Avatar className="h-6 w-6 border border-border">
                <AvatarImage src={post.author.image || ""} />
                <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                  {post.author.name ? post.author.name[0].toUpperCase() : "A"}
                </AvatarFallback>
              </Avatar>
              {totalAuthors > 1 && (
                <span className="text-xs text-muted-foreground">
                  +{totalAuthors - 1}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">No author</span>
          )}
        </div>
      </TableCell>

      <TableCell>
        <div className="text-xs text-muted-foreground">
          {post.publishedAt ? formatDate(post.publishedAt) : "Not published"}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-xs text-muted-foreground">
          {formatDate(post.updatedAt)}
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
              {isPinned ? "Unpin" : "Pin"}
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
