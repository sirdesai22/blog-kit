import {
  Layers,
  LayoutTemplate,
  Home,
  Calendar,
  Settings2,
  Box,
  Users,
  CreditCard,
  HelpCircle,
  RefreshCw,
  MessageSquare,
  Gauge,
  FileText,
  FolderOpen,
  ClipboardList,
  Target,
  Palette,
  Globe,
  Puzzle,
  Command,
} from 'lucide-react';

export const workspaceSidebarData = {
  navMain: [
    {
      title: 'Pages',
      url: '#',
      icon: Layers,
    },
    {
      title: 'Widgets',
      url: '#',
      icon: Home,
    },
    {
      title: 'Templates',
      url: '#',
      icon: LayoutTemplate,
    },
  ],
  navSecondary: [
    {
      title: 'Domain',
      url: '#',
      icon: Globe,
    },
    {
      title: 'Brand Settings',
      url: '#',
      icon: Settings2,
    },
    {
      title: 'Global Header',
      url: '#',
      icon: Box,
    },
    {
      title: 'Global Footer',
      url: '#',
      icon: Box,
    },
    {
      title: 'Team',
      url: '#',
      icon: Users,
    },
    {
      title: 'Billing',
      url: '#',
      icon: CreditCard,
    },
  ],
  navSupport: [
    {
      title: 'Help Center',
      url: '#',
      icon: HelpCircle,
    },
    {
      title: 'Changelog',
      url: '#',
      icon: RefreshCw,
    },
    {
      title: 'Feedback',
      url: '#',
      icon: MessageSquare,
    },
  ],
};

export const pageManagementSidebarData = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/',
      icon: Gauge,
    },
    {
      title: 'Post Management',
      url: '#',
      icon: FileText,
      items: [
        { title: 'All Posts', url: '#' },
        { title: 'Published', url: 'published' },
        { title: 'Drafts', url: 'drafts' },
        { title: 'Scheduled', url: 'scheduled' },
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
      url: 'authors',
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
      title: 'Integrations',
      url: '#',
      icon: Globe,
    },
    {
      title: 'Settings',
      url: '#',
      icon: Puzzle,
    },
  ],
};

export const compayData = {
  name: 'Bowl Blog',
  logo: Command,
  plan: 'Enterprise',
};
