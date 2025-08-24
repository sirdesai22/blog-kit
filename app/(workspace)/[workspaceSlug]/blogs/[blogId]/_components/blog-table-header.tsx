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
    <div className="bg-background">
      <div className="px-4 py-6 sm:px-md lg:px-lg">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row ">
          <div>
            <Heading
              variant="default"
              subtitle={
                <p className=" text-small">
                  Create, edit, and pin posts.{' '} <br />
                  <span className="cursor-pointer text-small hover:underline">
                    Watch tutorial (2 mins)
                  </span>
                </p>
              }
            >
              <p className='text-header'>Posts</p>
            </Heading>
          </div>
          <Button onClick={newPage}>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>
      </div>
    </div>
  );
}