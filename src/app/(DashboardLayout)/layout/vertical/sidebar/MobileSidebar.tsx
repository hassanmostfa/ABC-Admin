"use client";
import React, { useContext, useMemo } from "react";
import { Sidebar, SidebarItemGroup, SidebarItems } from "flowbite-react";
import { IconSidebar } from "./IconSidebar";
import SidebarContent from "./Sidebaritems";
import NavItems from "./NavItems";
import NavCollapse from "./NavCollapse";
import { CustomizerContext } from "@/app/context/CustomizerContext";
import SimpleBar from "simplebar-react";
import { useAppSelector } from "@/store/hooks";
import { selectRolePermissions } from "@/store/selectors/authSelectors";
import { filterSidebarByPermissions } from "./filterSidebarByPermissions";

const MobileSidebar = () => {
  const { selectedIconId } = useContext(CustomizerContext) || {};
  const rolePermissions = useAppSelector(selectRolePermissions);
  const filteredContent = useMemo(
    () => filterSidebarByPermissions(SidebarContent, rolePermissions),
    [rolePermissions]
  );
  const selectedContent = filteredContent.find(
    (data) => data.id === selectedIconId
  );
  return (
    <>
      <div className="overflow-y-hidden">
        <div className="minisidebar-icon border-e border-ld bg-white dark:bg-darkgray fixed start-0 z-1 overflow-y-hidden">
          <IconSidebar />
        </div>
        <Sidebar
          className="fixed menu-sidebar pt-8 bg-white dark:bg-darkgray transition-all overflow-y-hidden"
          aria-label="Sidebar with multi-level dropdown example"
        >
          <SimpleBar className="h-[calc(100vh-85px)]">
            <SidebarItems className="ps-4 pe-4">
              <SidebarItemGroup className="sidebar-nav">
                {selectedContent &&
                  selectedContent.items?.map((item, index) => (
                    <React.Fragment key={item.heading || `mobile-item-${index}`}>
                      <h5 className="text-link font-semibold text-sm caption">
                        {item.heading}
                      </h5>
                      {item.children?.map((child, childIndex) => (
                        <React.Fragment key={child.id || `mobile-child-${childIndex}`}>
                          {child.children ? (
                            <NavCollapse item={child} />
                          ) : (
                            <NavItems item={child} />
                          )}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))}
              </SidebarItemGroup>
            </SidebarItems>
          </SimpleBar>
        </Sidebar>
      </div>
    </>
  );
};

export default MobileSidebar;
