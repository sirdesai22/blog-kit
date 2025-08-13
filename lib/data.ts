import { Icons } from './icons';
import {
  AudioWaveform,
  Blocks,
  Calendar,
  Command,
  Home,
  Inbox,
  MessageCircleQuestion,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  Gauge,
  FileText,
  FolderOpen,
  Users,
  ClipboardList,
  Target,
  Box,
  Palette,
  Globe,
  Puzzle,
  Settings,
} from 'lucide-react';

export const workspaceSidebarData = {
  navMain: [
    {
      title: 'My Pages',
      url: '#',
      icon: Icons.layers,
    },
    {
      title: 'Templates',
      url: '#',
      icon: Icons.layoutTemplate,
    },
    {
      title: 'Widgets',
      url: '#',
      icon: Home,
    },
  ],
  navSecondary: [
    {
      title: 'Calendar',
      url: '#',
      icon: Calendar,
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
    },
    {
      title: 'Templates',
      url: '#',
      icon: Blocks,
    },
    {
      title: 'Trash',
      url: '#',
      icon: Trash2,
    },
    {
      title: 'Help',
      url: '#',
      icon: MessageCircleQuestion,
    },
  ],
  navSupport: [
    {
      title: 'User Guide',
      url: '#',
      icon: Calendar,
    },
    {
      title: "What's New",
      url: '#',
      icon: Calendar,
    },
    {
      title: 'Feedback',
      url: '#',
      icon: Calendar,
    },
  ],
};

export const pageManagementSidebarData = {
  navMain: [
    {
      title: 'Dashboard',
      url: '#',
      icon: Gauge,
    },
    {
      title: 'Post Management',
      url: '#',
      icon: FileText,
      items: [
        {
          title: 'All Posts',
          url: '#',
        },
        {
          title: 'Published',
          url: '#',
        },
        {
          title: 'Drafts',
          url: '#',
        },
        {
          title: 'Scheduled',
          url: '#',
        },
      ],
    },
    {
      title: 'Posts',
      url: '#',
      icon: FileText,
    },
    {
      title: 'Categories',
      url: 'categories',
      icon: FolderOpen,
    },
    {
      title: 'Authors',
      url: '#',
      icon: Users,
    },
    {
      title: 'Forms',
      url: '#',
      icon: ClipboardList,
    },
    {
      title: 'Leads',
      url: '#',
      icon: Target,
    },
    {
      title: 'Widgets',
      url: '#',
      icon: Box,
    },
  ],
  navSecondary: [
    {
      title: 'Customization',
      url: '#',
      icon: Palette,
    },
    {
      title: 'Domain',
      url: '#',
      icon: Globe,
    },
    {
      title: 'Integrations',
      url: '#',
      icon: Puzzle,
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings,
    },
  ],
  navSupport: [
    {
      title: 'User Guide',
      url: '#',
      icon: Calendar,
    },
    {
      title: "What's New",
      url: '#',
      icon: Calendar,
    },
    {
      title: 'Feedback',
      url: '#',
      icon: Calendar,
    },
  ],
};

export const compayData = {
  name: 'Bowl Blog',
  logo: Command,
  plan: 'Enterprise',
};
