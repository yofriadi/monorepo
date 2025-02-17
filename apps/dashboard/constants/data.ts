type NavItem = {
  title: string;          // The display name of the navigation item
  url: string;            // The URL or route that the item links to
  icon: string;           // The icon associated with the navigation item
  isActive: boolean;      // Indicates whether the item is currently active
  shortcut?: string[];    // Optional keyboard shortcut(s) for quick access
  items: NavItem[];       // An array of child navigation items (can be empty)
};

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [] // Empty array as there are no child items for Dashboard
  },
];
