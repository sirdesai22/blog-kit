'use client';

import { SidebarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useSession, signOut } from 'next-auth/react';

import { LogOut, User } from 'lucide-react';
import { BreadcrumbNav } from './breadcrumb-nav';

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-[--header-height] justify-between w-full items-center gap-4 px-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center flex-1">
          <BreadcrumbNav />
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Avatar className="w-6 h-6">
                <AvatarImage src={session.user?.image || ''} />
                <AvatarFallback
                  className="bg-purple-100 
                text-purple-600 text-xs"
                >
                  {session.user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0">
              <div className="flex items-center gap-4 p-2">
                <Avatar>
                  <AvatarImage src={session.user?.image || ''} />
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    {session.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">
                    {session.user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">{session.user?.email}</p>
                </div>
              </div>
              <Separator />
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => signOut()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
