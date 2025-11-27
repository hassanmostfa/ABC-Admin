export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: any;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: any;
}

import { uniqueId } from "lodash";

const SidebarContent: MenuItem[] = [
  {
    id: 1,
    name: "Dashboard",
    items: [
      {
        children: [
          {
            name: "sidebar.dashboard",
            icon: "solar:atom-line-duotone",
            id: uniqueId(),
            url: "/",
          },
          {
            name: "sidebar.adminManagement",
            id: uniqueId(),
            icon: "solar:user-line-duotone",
            children: [
              {
                name: "sidebar.rolesAndPermissions",
                id: uniqueId(),
                url: "/roles-and-permissions",
              },
              {
                id: uniqueId(),
                name: "sidebar.admins",
                url: "/admins",
              },
            ],
          },
          {
            name: "sidebar.geographicLocations",
            id: uniqueId(),
            icon: "solar:map-point-line-duotone",
            children: [
              {
                name: "sidebar.countries",
                id: uniqueId(),
                url: "/countries",
              },
              {
                id: uniqueId(),
                name: "sidebar.governorates",
                url: "/governorates",
              },
              {
                id: uniqueId(),
                name: "sidebar.areas",
                url: "/areas",
              },
            ],
          },
          {
            name: "sidebar.categoriesManagement",
            id: uniqueId(),
            icon: "solar:tag-line-duotone",
            children: [
              {
                name: "sidebar.mainCategories",
                id: uniqueId(),
                url: "/categories",
              },
              {
                id: uniqueId(),
                name: "sidebar.subCategories",
                url: "/subcategories",
              },
            ],
          },
          {
            name: "sidebar.users",
            icon: "solar:users-group-two-rounded-outline",
            id: uniqueId(),
            url: "/customers",
          },

          {
            name: "sidebar.products",
            icon: "solar:cart-line-duotone",
            id: uniqueId(),
            url: "/products",
          },

          {
            name: "sidebar.charities",
            icon: "solar:buildings-2-line-duotone",
            id: uniqueId(),
            url: "/charities",
          },

          {
            name: "sidebar.offers",
            icon: "solar:gift-line-duotone",
            id: uniqueId(),
            url: "/offers",
          },

          {
            name: "sidebar.orders",
            icon: "solar:clipboard-list-line-duotone",
            id: uniqueId(),
            url: "/orders",
          },

          {
            name: "sidebar.invoices",
            icon: "solar:document-text-line-duotone",
            id: uniqueId(),
            url: "/invoices",
          },

          {
            name: "sidebar.contentManagement",
            id: uniqueId(),
            icon: "solar:document-text-line-duotone",
            children: [
              {
                name: "sidebar.contactUs",
                id: uniqueId(),
                url: "/contact-us",
              },
              {
                id: uniqueId(),
                name: "sidebar.jobApplications",
                url: "/careers",
              },
              {
                id: uniqueId(),
                name: "sidebar.socialMediaLinks",
                url: "/social-media-links",
              },
            ],
          },
        ],
      },
    ],
  },
];

export default SidebarContent;
