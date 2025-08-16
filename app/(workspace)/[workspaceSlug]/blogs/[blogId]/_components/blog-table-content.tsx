
'use client';

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BlogTableRow } from './blog-table-row';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Heading } from '@/components/ui/heading';
import { useRouter } from 'next/navigation';
import { BlogPost } from '@/lib/mock-data';

interface BlogTableContentProps {
  posts: BlogPost[];
  workspaceSlug: string;
  currentPageId: string;
}

export function BlogTableContent({
  posts,
  workspaceSlug,
  currentPageId,
}: BlogTableContentProps) {
  const router = useRouter();

  const newPage = () => {
    router.push(`/${workspaceSlug}/blogs/${currentPageId}/new`);
  };

  if (posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto max-w-md">
          <Heading
            level="h3"
            variant="default"
            subtitle="Get started by creating your first blog post."
            subtitleVariant="muted"
            className="mb-6"
          >
            No blog posts found
          </Heading>
          <Button onClick={newPage}>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="relative w-full overflow-x-auto">
        <Table className="">
         <TableHeader>
  <TableRow className="bg-muted/50 hover:bg-muted/50">
    <TableHead className="w-14"></TableHead>
    <TableHead>Posts</TableHead>
    <TableHead>Status</TableHead>
    <TableHead>Category</TableHead>
    <TableHead>Tags</TableHead>
    <TableHead>Author</TableHead>
    <TableHead>Published / Modified</TableHead>
    <TableHead>Traffic</TableHead>
    <TableHead>Leads</TableHead>
    <TableHead className="sticky right-0 w-12 bg-muted/50 text-center"></TableHead>
  </TableRow>
</TableHeader>
          <TableBody>
            {posts.map((post) => (
              <BlogTableRow
                key={post.id}
                post={post}
                workspaceSlug={workspaceSlug}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}