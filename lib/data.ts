import {
  Layers,
  LayoutTemplate,
  Home,
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

// New structure for workspace sidebar
export const workspaceSidebarData = [
  {
    id: 'main',
    items: [
      { title: 'Pages', url: '#', icon: Layers },
      { title: 'Widgets', url: '#', icon: Home },
      { title: 'Templates', url: '#', icon: LayoutTemplate },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    items: [
      { title: 'Domain', url: '#', icon: Globe },
      { title: 'Brand Settings', url: '#', icon: Settings2 },
      { title: 'Global Header', url: '#', icon: Box },
      { title: 'Global Footer', url: '#', icon: Box },
      { title: 'Team', url: '#', icon: Users },
      { title: 'Billing', url: '#', icon: CreditCard },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    items: [
      { title: 'Help Center', url: '#', icon: HelpCircle },
      { title: 'Changelog', url: '#', icon: RefreshCw },
      { title: 'Feedback', url: '#', icon: MessageSquare },
    ],
  },
];

export const pageManagementSidebarData = [
  {
    id: 'main',
    items: [
      { title: 'Dashboard', url: '/', icon: Gauge },
    ],
  },
  {
    id: 'post-management',
    label: 'Post Management',
    items: [
      { title: 'Posts', url: '#', icon: FileText },
      { title: 'Categories', url: 'categories', icon: FolderOpen },
      { title: 'Authors', url: 'authors', icon: Users },
      { title: 'Forms', url: 'forms', icon: ClipboardList },
      { title: 'Leads', url: 'leads', icon: Target },
      { title: 'Widgets', url: 'widgets', icon: Box },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    items: [
      { title: 'Customization', url: '#', icon: Palette },
      { title: 'Integrations', url: '#', icon: Globe },
      { title: 'Settings', url: '#', icon: Settings2 },
    ],
  },
];


export const compayData = {
  name: 'Bowl Blog',
  logo: Command,
  plan: 'Enterprise',
};