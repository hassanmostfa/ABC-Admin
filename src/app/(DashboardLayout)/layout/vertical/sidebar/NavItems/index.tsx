"use client";
import React, { useContext } from "react";
import { ChildItem } from "../Sidebaritems";
import { Sidebar, SidebarItem } from "flowbite-react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { CustomizerContext } from "@/app/context/CustomizerContext";

interface NavItemsProps {
  item: ChildItem;
}
const NavItems: React.FC<NavItemsProps> = React.memo(({ item }) => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { setIsMobileSidebar } = useContext(CustomizerContext);
  
  const handleMobileSidebar = React.useCallback(() => {
    setIsMobileSidebar(false);
  }, [setIsMobileSidebar]);

  const isActive = React.useMemo(() => {
    return item.url === pathname;
  }, [item.url, pathname]);

  return (
    <SidebarItem
      href={item.url}
      as={Link}
      className={`rounded-xl ${
        isActive
          ? "text-white bg-primary dark:!bg-primary hover:text-white hover:bg-primary dark:hover:text-white shadow-btnshdw active"
          : "text-link bg-transparent group/link hover:bg-transparent dark:!bg-transparent"
      }`}
    >
      <span onClick={handleMobileSidebar} className="flex gap-3 align-center items-center">
        {item.icon ? (
          <Icon icon={item.icon} className={`${item.color}`} height={18} />
        ) : (
          <span
            className={`${
              isActive
                ? "dark:bg-white rounded-full mx-1.5 group-hover/link:bg-primary bg-primary! h-[6px] w-[6px]"
                : "h-[6px] w-[6px] bg-black/40 dark:bg-white rounded-full mx-1.5 group-hover/link:bg-primary dark:group-hover/link:bg-primary"
            }`}
          ></span>
        )}
        <span className="max-w-36 overflow-hidden" suppressHydrationWarning>
          {t(`${item.name}`)}
        </span>
      </span>
    </SidebarItem>
  );
});

NavItems.displayName = 'NavItems';

export default NavItems;
