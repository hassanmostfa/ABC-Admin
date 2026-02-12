export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: any;
  children?: ChildItem[];
  item?: any;
  url?: any;
  color?: string;
  /** Permission resource(s) - single string or array for composite (show if any match) */
  permission?: string | string[];
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
            permission: "dashboard",
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
                permission: ["roles", "permissions"],
              },
              {
                id: uniqueId(),
                name: "sidebar.admins",
                url: "/admins",
                permission: "admins",
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
                permission: "countries",
              },
              {
                id: uniqueId(),
                name: "sidebar.governorates",
                url: "/governorates",
                permission: "governorates",
              },
              {
                id: uniqueId(),
                name: "sidebar.areas",
                url: "/areas",
                permission: "areas",
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
                permission: "categories",
              },
              {
                id: uniqueId(),
                name: "sidebar.subCategories",
                url: "/subcategories",
                permission: "subcategories",
              },
            ],
          },
          {
            name: "sidebar.users",
            icon: "solar:users-group-two-rounded-outline",
            id: uniqueId(),
            url: "/customers",
            permission: "customers",
          },

          {
            name: "sidebar.products",
            icon: "solar:cart-line-duotone",
            id: uniqueId(),
            url: "/products",
            permission: "products",
          },

          {
            name: "sidebar.charities",
            icon: "solar:buildings-2-line-duotone",
            id: uniqueId(),
            url: "/charities",
            permission: "charities",
          },

          {
            name: "sidebar.offers",
            icon: "solar:gift-line-duotone",
            id: uniqueId(),
            url: "/offers",
            permission: "offers",
          },

          {
            name: "sidebar.ordersInquiries",
            icon: "solar:clipboard-list-line-duotone",
            id: uniqueId(),
            url: "/orders",
            permission: "orders",
          },

          {
            name: "sidebar.enterSaleOrder",
            icon: "solar:cart-large-4-line-duotone",
            id: uniqueId(),
            url: "/enter-sale-order",
            permission: "orders",
          },

          {
            name: "sidebar.invoices",
            icon: "solar:document-text-line-duotone",
            id: uniqueId(),
            url: "/invoices",
            permission: "invoices",
          },
          {
            name: "sidebar.refundRequests",
            icon: "solar:refresh-line-duotone",
            id: uniqueId(),
            url: "/refund-requests",
            permission: "refund_requests",
          },
          {
            name: "sidebar.payments",
            icon: "solar:wallet-money-line-duotone",
            id: uniqueId(),
            url: "/payments",
            permission: "transactions",
          },
          {
            name: "sidebar.pointsTransactions",
            icon: "solar:star-bold-duotone",
            id: uniqueId(),
            url: "/points-transactions",
            permission: "points_transactions",
          },

          {
            name: "sidebar.settings",
            icon: "solar:settings-line-duotone",
            id: uniqueId(),
            url: "/settings",
            permission: "settings",
          },
          {
            name: "sidebar.activityLogs",
            icon: "solar:history-line-duotone",
            id: uniqueId(),
            url: "/activity-logs",
            permission: "activity_logs",
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
            permission: "sliders",
          },
          {
            name: "sidebar.contactUs",
            id: uniqueId(),
            icon: "solar:phone-calling-line-duotone",
            url: "/contact-us",
            permission: "contact_us",
          },
          {
            id: uniqueId(),
            name: "sidebar.jobApplications",
            icon: "solar:bag-line-duotone",
            url: "/careers",
            permission: "careers",
          },
          {
            id: uniqueId(),
            name: "sidebar.socialMediaLinks",
            icon: "solar:share-circle-line-duotone",
            url: "/social-media-links",
            permission: "social_media_links",
          },
          {
            id: uniqueId(),
            name: "sidebar.faqs",
            icon: "solar:question-circle-line-duotone",
            url: "/faqs",
            permission: "faqs",
          },
          {
            id: uniqueId(),
            name: "sidebar.teamMembers",
            icon: "solar:users-group-rounded-line-duotone",
            url: "/team-members",
            permission: "team_members",
          },
        ],
      },
    ],
  },
];

export default SidebarContent;
