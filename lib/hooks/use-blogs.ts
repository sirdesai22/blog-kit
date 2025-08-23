// lib/hooks/use-blogs.ts
'use client';

import { useQuery } from '@tanstack/react-query';

type Blog = {
  id: string;
  title: string;
  status?: string;
};

const dummyBlogs: Blog[] = [
  { id: '1', title: 'My First Blog', status: 'published' },
  { id: '2', title: 'Next.js Tips', status: 'draft' },
  { id: '3', title: 'React Query Guide', status: 'published' },
];

export function useUserBlogs(workspaceSlug: string) {
  return useQuery({
    queryKey: ['user-blogs', workspaceSlug],
    queryFn: async () => {
      // mock API delay
      await new Promise((r) => setTimeout(r, 300));
      return dummyBlogs;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCurrentBlog(blogId: string) {
  return useQuery({
    queryKey: ['current-blog', blogId],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      return dummyBlogs.find((b) => b.id === blogId) || null;
    },
    enabled: !!blogId,
    staleTime: 1000 * 60 * 5,
  });
}
