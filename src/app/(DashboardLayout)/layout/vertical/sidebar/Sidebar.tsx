"use client";
import React, { useContext, useEffect } from "react";
import { Drawer, Sidebar, SidebarItemGroup, SidebarItems } from "flowbite-react";
import { IconSidebar } from "./IconSidebar";
import SidebarContent from "./Sidebaritems";
import NavItems from "./NavItems";
import NavCollapse from "./NavCollapse";
import { CustomizerContext } from "@/app/context/CustomizerContext";
import SimpleBar from "simplebar-react";
import FullLogo from "@/app/(DashboardLayout)/layout/shared/logo/FullLogo";
import { usePathname } from "next/navigation";

const SidebarLayout = () => {
  const { selectedIconId, setSelectedIconId } =
    useContext(CustomizerContext) || {};
  const selectedContent = SidebarContent.find(
    (data) => data.id === selectedIconId
  );

  const pathname = usePathname();

  const findActiveUrl = React.useCallback((narray: any, targetUrl: any) => {
    for (const item of narray) {
      if (item.items) {
        for (const section of item.items) {
          if (section.children) {
            for (const child of section.children) {
              if (child.url === targetUrl) {
                return item.id;
              }
            }
          }
        }
      }
    }
    return null;
  }, []);

  const activeMenuId = React.useMemo(() => {
    return findActiveUrl(SidebarContent, pathname);
  }, [findActiveUrl, pathname]);

  React.useEffect(() => {
    if (activeMenuId) {
      setSelectedIconId(activeMenuId);
    }
  }, [activeMenuId, setSelectedIconId]);

  return (
    <>
      <div className="xl:block hidden overflow-y-hidden">
        <div className="minisidebar-icon border-e border-ld fixed start-0 z-1 overflow-y-hidden">
          <IconSidebar />
        </div>
        <Sidebar
          className="fixed menu-sidebar bg-white dark:bg-darkgray rtl:pe-4 rtl:ps-0 overflow-y-auto"
          aria-label="Sidebar with multi-level dropdown example"
        >
          <div className="px-6 py-4 flex items-center justify-center sidebarlogo">
            <FullLogo />
          </div>
          <SimpleBar className="h-[calc(100vh-85px)] overflow-y-auto">
            <SidebarItems className="pe-4 rtl:pe-0 rtl:ps-4 px-5 mt-2">
              <SidebarItemGroup className="sidebar-nav hide-menu">
                {selectedContent &&
                  selectedContent.items?.map((item, index) => (
                    <div className="caption" key={item.heading || `item-${index}`}>
                      <React.Fragment>
                        <h5 className="text-link dark:text-white/70 caption font-semibold leading-6 tracking-widest text-xs text-sm  pb-2 uppercase">
                          {item.heading}
                        </h5>
                        {item.children?.map((child, childIndex) => (
                          <React.Fragment key={child.id || `child-${childIndex}`}>
                            {child.children ? (
                              <NavCollapse item={child} />
                            ) : (
                              <NavItems item={child} />
                            )}
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    </div>
                  ))}
              </SidebarItemGroup>
            </SidebarItems>
          </SimpleBar>
        </Sidebar>
      </div>
    </>
  );
};

export default SidebarLayout;

