'use client';

import { usePathname } from 'next/navigation';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { SiteHeader } from '@/components/layout/header';
import { MainSidebar } from '@/components/layout/workspace/main-sidebar';
import { workspaceSidebarData, pageManagementSidebarData } from '@/lib/data';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const pathname = usePathname();

  const isPageRoute =
    pathname.includes('/pages/') || pathname.includes('/blogs/');

  // Select the appropriate data structure based on the current route
  const sidebarSections = isPageRoute
    ? pageManagementSidebarData
    : workspaceSidebarData;

  return (
    <div className="flex h-screen flex-col">
      <SiteHeader />
      <SidebarProvider className="flex flex-1 overflow-hidden">
        <MainSidebar sections={sidebarSections} />
        <SidebarInset className="flex-1">{children}</SidebarInset>
      </SidebarProvider>
    </div>
  );
}