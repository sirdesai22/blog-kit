'use client';

import * as React from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { ChevronDown, Check, Plus, Command } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  useUserWorkspaces,
  useCurrentWorkspace,
} from '@/lib/hooks/use-workspaces';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
import { WorkSpaceSwitcher } from '../workspace/workspace-switcher';

interface BreadcrumbItem {
  label: string;
  href?: string;
  dropdown?: boolean;
  dropdownItems?: Array<{
    label: string;
    href: string;
  }>;
}

export function BreadcrumbNav() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const workspaceSlug = params?.workspaceSlug as string;
  const blogId = params?.blogId as string;

  // Fetch workspace data
  const { data: userWorkspaces } = useUserWorkspaces();
  const { data: currentWorkspace } = useCurrentWorkspace(workspaceSlug);
  const { currentWorkspace: storeCurrentWorkspace } = useWorkspaceStore();

  const displayWorkspace = currentWorkspace || storeCurrentWorkspace;

  const handleWorkspaceSwitch = (slug: string) => {
    router.push(`/${slug}`);
  };

  const handleCreateWorkspace = () => {
    router.push('/onboarding');
  };

  // Generate breadcrumb items based on current path
  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [];

    // Always show workspace as first item with dropdown
    items.push({
      label: displayWorkspace?.name || 'My Workspace',
      dropdown: true,
    });

    // Check if we're in a blog context
    const isBlogContext = pathname.includes('/blogs/') && blogId;

    if (isBlogContext) {
      items.push({
        label: 'Blog',
        dropdown: true,
        dropdownItems: [
          {
            label: 'Dashboard',
            href: `/${workspaceSlug}/blogs/${blogId}`,
          },
          {
            label: 'Categories',
            href: `/${workspaceSlug}/blogs/${blogId}/categories`,
          },
          {
            label: 'Authors',
            href: `/${workspaceSlug}/blogs/${blogId}/authors`,
          },
        ],
      });
    } else if (pathname.includes('/pages/')) {
      // Handle other page types if needed
      items.push({
        label: 'Pages',
        href: '#',
      });
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <nav className="flex items-center gap-2 text-sm">
      {/* App Logo */}
      <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
        <Command className="w-5 h-5 text-yellow-800" />
      </div>

      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {/* Forward slash separator */}
          <span className="text-muted-foreground">/</span>

          {item.dropdown ? (
            item.label === 'Blog' && item.dropdownItems ? (
              // Blog dropdown
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 font-normal text-sm hover:bg-transparent"
                  >
                    <span className="text-foreground font-medium">
                      {item.label}
                    </span>
                    <ChevronDown className="h-4 w-4 ml-1 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {item.dropdownItems.map((dropdownItem) => (
                    <DropdownMenuItem
                      key={dropdownItem.label}
                      onSelect={() => router.push(dropdownItem.href)}
                    >
                      {dropdownItem.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Workspace dropdown
              //   <DropdownMenu>
              //     <DropdownMenuTrigger asChild>
              //       <Button
              //         variant="ghost"
              //         size="sm"
              //         className="h-auto p-1 font-normal text-sm hover:bg-transparent"
              //       >
              //         <span className="text-foreground font-medium">
              //           {item.label}
              //         </span>
              //         <ChevronDown className="h-4 w-4 ml-1 text-muted-foreground" />
              //       </Button>
              //     </DropdownMenuTrigger>
              //     <DropdownMenuContent align="start" className="w-64">
              //       {userWorkspaces?.map((workspace) => (
              //         <DropdownMenuItem
              //           key={workspace.id}
              //           onSelect={() => handleWorkspaceSwitch(workspace.slug)}
              //         >
              //           <div className="flex items-center gap-2 flex-1">
              //             <div className="bg-blue-100 text-blue-600 flex aspect-square size-6 items-center justify-center rounded text-xs font-medium">
              //               {workspace.name.charAt(0).toUpperCase()}
              //             </div>
              //             <div className="flex flex-col">
              //               <span className="text-sm font-medium">
              //                 {workspace.name}
              //               </span>
              //               <span className="text-xs text-muted-foreground">
              //                 {workspace.role.toLowerCase()}
              //               </span>
              //             </div>
              //           </div>
              //           {workspace.slug === workspaceSlug && (
              //             <Check className="h-4 w-4" />
              //           )}
              //         </DropdownMenuItem>
              //       ))}
              //       <DropdownMenuSeparator />
              //       <DropdownMenuItem onSelect={handleCreateWorkspace}>
              //         <Plus className="mr-2 h-4 w-4" />
              //         Create workspace
              //       </DropdownMenuItem>
              //     </DropdownMenuContent>
              //   </DropdownMenu>
              <WorkSpaceSwitcher />
            )
          ) : item.href ? (
            // Clickable breadcrumb item
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 font-normal text-sm hover:bg-transparent"
              onClick={() => router.push(item.href!)}
            >
              <span className="text-foreground font-medium">{item.label}</span>
            </Button>
          ) : (
            // Current/final breadcrumb item
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
