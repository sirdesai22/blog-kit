'use client';

import * as React from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  LogOut,
  LifeBuoy,
  Inbox,
  ArrowUpRight,
  MessageSquare,
  Menu,
} from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BreadcrumbNav } from './breadcrumb-nav';
import { ThemeToggle } from './theme-toggle';

export function SiteHeader() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const { user } = session;
  const initial = user.name?.charAt(0).toUpperCase() || '?';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background p-3">
      <div className="flex  items-center justify-between ">
        <div className="flex flex-1 items-center">
          <BreadcrumbNav />
        </div>

        <div className="hidden items-center gap-[--gap-sm] md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="#">
              View Blog
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full px-3 h-8"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Feedback
          </Button>
          <TooltipProvider>
            <div className="flex items-center gap-[--gap-xs]">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <LifeBuoy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Support</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Inbox className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Inbox</p>
                </TooltipContent>
              </Tooltip>
              <ThemeToggle />
            </div>
          </TooltipProvider>
          <Popover>
            <PopoverTrigger asChild>
              <button
                aria-label="User menu"
                className="flex items-center justify-center rounded-full"
              >
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={user.image || session.user?.image || ''} alt={user.name || ''} />
                  <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
                    {initial}
                  </AvatarFallback>
                </Avatar>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="end">
              <div className="flex items-center gap-3 p-2">
                <Avatar>
                  <AvatarImage src={user.image || ''} alt={user.name || ''} />
                  <AvatarFallback className="bg-muted font-medium text-muted-foreground">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col truncate">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              <Separator />
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </Button>
            </PopoverContent>
          </Popover>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] p-4">
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-3 pb-4">
                  <Avatar>
                    <AvatarImage
                      src={user.image || ''}
                      alt={user.name || ''}
                    />
                    <AvatarFallback className="bg-muted font-medium text-muted-foreground">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col truncate">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex flex-1 flex-col gap-1 py-4">
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="#">
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        View Blog
                      </Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button variant="ghost" className="w-full justify-start">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Feedback
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button variant="ghost" className="w-full justify-start">
                      <LifeBuoy className="mr-2 h-4 w-4" />
                      Support
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button variant="ghost" className="w-full justify-start">
                      <Inbox className="mr-2 h-4 w-4" />
                      Inbox
                    </Button>
                  </SheetClose>
                  <ThemeToggle showText={true} />
                </div>
                <Separator />
                <div className="pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}