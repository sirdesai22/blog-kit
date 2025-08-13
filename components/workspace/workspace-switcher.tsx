'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Plus, Building2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import {
  useUserWorkspaces,
  useCurrentWorkspace,
} from '@/lib/hooks/use-workspaces';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';

export function WorkSpaceSwitcher() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params.workspaceSlug as string;

  // Fetch user's workspaces
  const { data: userWorkspaces, isLoading: workspacesLoading } =
    useUserWorkspaces();

  // Fetch current workspace details
  const { data: currentWorkspace, isLoading: currentWorkspaceLoading } =
    useCurrentWorkspace(workspaceSlug);

  // Zustand store
  const { currentWorkspace: storeCurrentWorkspace } = useWorkspaceStore();

  const handleWorkspaceSwitch = (slug: string) => {
    router.push(`/${slug}`);
  };

  const handleCreateWorkspace = () => {
    router.push('/onboarding');
  };

  // Use current workspace from query or store
  const displayWorkspace = currentWorkspace || storeCurrentWorkspace;

  if (workspacesLoading || currentWorkspaceLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="animate-pulse">
            <div className="bg-gray-200 rounded-lg size-8"></div>
            <div className="flex flex-col gap-1">
              <div className="bg-gray-200 h-4 w-20 rounded"></div>
              <div className="bg-gray-200 h-3 w-16 rounded"></div>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">
                  {displayWorkspace?.name || 'Select Workspace'}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
            align="start"
          >
            {userWorkspaces?.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onSelect={() => handleWorkspaceSwitch(workspace.slug)}
              >
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 text-blue-600 flex aspect-square size-6 items-center justify-center rounded text-xs font-medium">
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {workspace.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {workspace.role.toLowerCase()}
                    </span>
                  </div>
                </div>
                {workspace.slug === workspaceSlug && (
                  <Check className="ml-auto size-4" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleCreateWorkspace}>
              <Plus className="mr-2 size-4" />
              Create workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
