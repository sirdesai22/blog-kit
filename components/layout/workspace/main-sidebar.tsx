'use client';

import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NavMain } from '@/components/layout/workspace/navmain';
import { NavSecondary } from '@/components/layout/workspace/navsecondary';

import { workspaceSidebarData } from '@/lib/data';

interface MainSidebarProps extends React.ComponentProps<typeof Sidebar> {
  navMainItems?: typeof workspaceSidebarData.navMain;
  navSecondaryItems?: typeof workspaceSidebarData.navSecondary;
  navSupportItems?: typeof workspaceSidebarData.navSupport;
  showSettings?: boolean;
  showSupport?: boolean;
  settingsLabel?: string;
  supportLabel?: string;
}

export function MainSidebar({
  navMainItems = workspaceSidebarData.navMain,
  navSecondaryItems = workspaceSidebarData.navSecondary,
  navSupportItems = workspaceSidebarData.navSupport,
  showSettings = true,
  showSupport = true,
  settingsLabel = 'Settings',
  supportLabel = 'Support',
  ...props
}: MainSidebarProps) {
  return (
    <Sidebar
      className="top-[calc(var(--header-height)-7px)] h-[calc(100svh-var(--header-height)+7px)]!"
      {...props}
    >
      <SidebarHeader>
        <NavMain items={navMainItems} />
      </SidebarHeader>
      <SidebarContent>
        {showSettings && (
          <NavSecondary label={settingsLabel} items={navSecondaryItems} />
        )}
        {showSupport && (
          <NavSecondary label={supportLabel} items={navSupportItems} />
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
