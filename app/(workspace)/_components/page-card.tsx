import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Edit2, Eye } from 'lucide-react';
import Link from 'next/link';

interface PageCardProps {
  page: {
    id: string;
    title: string;
    slug: string;
    type:
      | 'BLOG'
      | 'CHANGELOG'
      | 'HELP_DOC'
      | 'HELPDESK'
      | 'KNOWLEDGE_BASE'
      | 'FAQ';
    status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
    createdAt: Date;
    updatedAt: Date;
    author: string;
    publishedAt: Date | null;
  };
  workspaceSlug: string;
}

export function PageCard({ page, workspaceSlug }: PageCardProps) {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'BLOG':
        return {
          label: 'Blog',
          variant: 'secondary' as const,
          color: 'bg-blue-100 text-blue-700',
        };
      case 'CHANGELOG':
        return {
          label: 'Changelog',
          variant: 'secondary' as const,
          color: 'bg-purple-100 text-purple-700',
        };
      case 'HELP_DOC':
        return {
          label: 'Help Doc',
          variant: 'secondary' as const,
          color: 'bg-green-100 text-green-700',
        };
      default:
        return {
          label: type,
          variant: 'secondary' as const,
          color: 'bg-gray-100 text-gray-700',
        };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return {
          label: 'Published',
          color: 'bg-green-100 text-green-700',
          dot: '●',
        };
      case 'DRAFT':
        return {
          label: 'Draft',
          color: 'bg-yellow-100 text-yellow-700',
          dot: '●',
        };
      case 'SCHEDULED':
        return {
          label: 'Scheduled',
          color: 'bg-blue-100 text-blue-700',
          dot: '●',
        };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', dot: '●' };
    }
  };

  const typeConfig = getTypeConfig(page.type);
  const statusConfig = getStatusConfig(page.status);
  const timeAgo = formatDistanceToNow(page.updatedAt, { addSuffix: true });

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-gray-200">
      <CardContent className="p-0">
        {/* Preview Image Area */}
        <div className="bg-gray-50 rounded-t-lg p-4 h-32 flex items-center justify-center border-b">
          <div className="w-full h-full bg-white rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">carbon-language</div>
              <div className="w-8 h-8 bg-black rounded-full mx-auto flex items-center justify-center">
                <span className="text-white text-xs font-bold">C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Type and Status Badges */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig.color}`}
            >
              {typeConfig.label}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
            >
              {statusConfig.dot} {statusConfig.label}
            </span>
          </div>

          {/* Title and URL */}
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
              {page.title}
            </h3>
            <p className="text-sm text-blue-600">/{page.slug}</p>
          </div>

          {/* Meta info */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span>{timeAgo}</span>
            <span>{page.author}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              asChild
            >
              <Link href={`/${workspaceSlug}/blogs/${page.id}`}>Edit</Link>
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
