import type { ChildItem, MenuItem } from "./Sidebaritems";
import type { RolePermissions } from "@/store/api/authApi";
import { canViewMenuItem } from "@/utils/permissions";

/**
 * Recursively filter child items by permissions
 */
function filterChildren(
  children: ChildItem[] | undefined,
  permissions: RolePermissions | null
): ChildItem[] {
  if (!children) return [];

  return children
    .map((child) => {
      if (child.children) {
        // Collapse item - filter its children first
        const filteredChildren = filterChildren(child.children, permissions);
        if (filteredChildren.length === 0) return null;
        return { ...child, children: filteredChildren };
      }
      // Leaf item - check permission
      if (!canViewMenuItem(permissions, child.permission)) return null;
      return child;
    })
    .filter((item): item is ChildItem => item !== null);
}

/**
 * Filter sidebar content by role permissions
 * Keeps all sections (Dashboard + Content Management) so mini sidebar icons always appear.
 * Content inside each section is validated - only permitted items show.
 */
export function filterSidebarByPermissions(
  sidebarContent: MenuItem[],
  permissions: RolePermissions | null
): MenuItem[] {
  return sidebarContent.map((section) => ({
    ...section,
    items: section.items?.map((item) => ({
      ...item,
      children: filterChildren(item.children, permissions),
    })),
  }));
}
