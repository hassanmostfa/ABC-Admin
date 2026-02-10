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
            name: "sidebar.ordersInquiries",
            icon: "solar:clipboard-list-line-duotone",
            id: uniqueId(),
            url: "/orders",
          },

          {
            name: "sidebar.enterSaleOrder",
            icon: "solar:cart-large-4-line-duotone",
            id: uniqueId(),
            url: "/enter-sale-order",
          },

          {
            name: "sidebar.invoices",
            icon: "solar:document-text-line-duotone",
            id: uniqueId(),
            url: "/invoices",
          },
          {
            name: "sidebar.refundRequests",
            icon: "solar:refresh-line-duotone",
            id: uniqueId(),
            url: "/refund-requests",
          },
          {
            name: "sidebar.payments",
            icon: "solar:wallet-money-line-duotone",
            id: uniqueId(),
            url: "/payments",
          },

          {
            name: "sidebar.settings",
            icon: "solar:settings-line-duotone",
            id: uniqueId(),
            url: "/settings",
          },
          {
            name: "sidebar.activityLogs",
            icon: "solar:history-line-duotone",
            id: uniqueId(),
            url: "/activity-logs",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Content Management",
    items: [
      {
        children: [
          {
            id: uniqueId(),
            name: "sidebar.sliders",
            icon: "solar:gallery-line-duotone",
            url: "/sliders",
          },
          {
            name: "sidebar.contactUs",
            id: uniqueId(),
            icon: "solar:phone-calling-line-duotone",
            url: "/contact-us",
          },
          {
            id: uniqueId(),
            name: "sidebar.jobApplications",
            icon: "solar:bag-line-duotone",
            url: "/careers",
          },
          {
            id: uniqueId(),
            name: "sidebar.socialMediaLinks",
            icon: "solar:share-circle-line-duotone",
            url: "/social-media-links",
          },
          {
            id: uniqueId(),
            name: "sidebar.faqs",
            icon: "solar:question-circle-line-duotone",
            url: "/faqs",
          },
          {
            id: uniqueId(),
            name: "sidebar.teamMembers",
            icon: "solar:users-group-rounded-line-duotone",
            url: "/team-members",
          },
        ],
      },
    ],
  },
];

export default SidebarContent;
