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

  // Check if we're on a page ID route (contains /pages/)
  const isPageRoute =
    pathname.includes('/pages/') || pathname.includes('/blogs/');

  // Use different sidebar data based on the route
  const sidebarData = isPageRoute
    ? pageManagementSidebarData
    : workspaceSidebarData;

  return (
    <div className="[--header-height:calc(--spacing(12))]">
      <SidebarProvider className="flex flex-col max-w-screen overflow-x-hidden">
        <SiteHeader />
        <div className="flex flex-1 ">
          <MainSidebar
            navMainItems={sidebarData.navMain}
            navSecondaryItems={sidebarData.navSecondary}
            navSupportItems={sidebarData.navSupport}
            showSupport={!isPageRoute} // Hide support section on page routes
          />
          <SidebarInset>{children}</SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
