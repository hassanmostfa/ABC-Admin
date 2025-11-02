import { uniqueId } from "lodash";

// Define proper types for menu items
interface MenuChild {
  id: string;
  title: string;
  icon: string;
  href: string;
  children?: MenuChild[];
}

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  href: string;
  column?: number;
  children?: MenuChild[];
}

const Menuitems: MenuItem[] = [
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: "solar:layers-line-duotone",
    href: "",
    children: [
      {
        title: "لوحة التحكم",
        icon: "solar:atom-line-duotone",
        id: uniqueId(),
        href: "/",
      },
    ],
  },
];

export default Menuitems;

// Export types for use in other components
export type { MenuItem, MenuChild };