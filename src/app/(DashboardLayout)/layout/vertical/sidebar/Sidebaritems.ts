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
            name: "لوحة التحكم",
            icon: "solar:atom-line-duotone",
            id: uniqueId(),
            url: "/",
          },
          {
            name: "ادارة المسئولين",
            id: uniqueId(),
            icon: "solar:user-line-duotone",
            children: [
              {
                name: "الادوار والصلاحيات",
                id: uniqueId(),
                url: "/roles-and-permissions",
              },
              {
                id: uniqueId(),
                name: "المسؤلين",
                url: "/admins",
              },
            ],
          },
          {
            name: "المواقع الجغرافية",
            id: uniqueId(),
            icon: "solar:map-point-line-duotone",
            children: [
              {
                name: "الدول",
                id: uniqueId(),
                url: "/countries",
              },
              {
                id: uniqueId(),
                name: "المحافظات",
                url: "/governorates",
              },
              {
                id: uniqueId(),
                name: "المناطق",
                url: "/areas",
              },
            ],
          },
          {
            name: "ادارة التصنيفات",
            id: uniqueId(),
            icon: "solar:tag-line-duotone",
            children: [
              {
                name: "التصنيفات الاساسية",
                id: uniqueId(),
                url: "/categories",
              },
              {
                id: uniqueId(),
                name: "التصنيفات الفرعية",
                url: "/subcategories",
              },
            ],
          },
          {
            name: "المستخدمين",
            icon: "solar:users-group-two-rounded-outline",
            id: uniqueId(),
            url: "/customers",
          },

          {
            name: "المنتجات",
            icon: "solar:cart-line-duotone",
            id: uniqueId(),
            url: "/products",
          },

          {
            name: "الجمعيات الخيرية",
            icon: "solar:buildings-2-line-duotone",
            id: uniqueId(),
            url: "/charities",
          },

          {
            name: "العروض",
            icon: "solar:gift-line-duotone",
            id: uniqueId(),
            url: "/offers",
          },

          {
            name: "ادارة المحتوي",
            id: uniqueId(),
            icon: "solar:document-text-line-duotone",
            children: [
              {
                name: "تواصل معنا",
                id: uniqueId(),
                url: "/contact-us",
              },
              {
                id: uniqueId(),
                name: "طلبات التوظيف",
                url: "/careers",
              },
              {
                id: uniqueId(),
                name: "وسائل التواصل",
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
