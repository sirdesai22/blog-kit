'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Heading } from '@/components/ui/heading';
import { useRouter } from 'next/navigation';

interface BlogTableHeaderProps {
  workspaceSlug: string;
  currentPageId: string;
}

export function BlogTableHeader({
  workspaceSlug,
  currentPageId,
}: BlogTableHeaderProps) {
  const router = useRouter();

  const newPage = () => {
    router.push(`/${workspaceSlug}/blogs/${currentPageId}/new`);
  };

  return (
    <div className="border-b border-gray-200 bg-white">
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
                  Create and edit and pin posts.{' '}
                  <span className="text-blue-600 cursor-pointer hover:underline">
                    Watch tutorial (2 mins)
                  </span>
                </>
              }
            >
              Posts
            </Heading>
          </div>
          <Button
            onClick={newPage}
            className="bg-black hover:bg-gray-800 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>
    </div>
  );
}
