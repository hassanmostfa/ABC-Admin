import { uniqueId } from "lodash";

const Menuitems = [
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