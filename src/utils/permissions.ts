import type { RolePermissions, PermissionAction } from '@/store/api/authApi';

/**
 * Check if user has a specific permission for a resource
 * @param permissions - role_permissions from auth state
 * @param resource - resource key (e.g. 'admins', 'products', 'customers')
 * @param action - view | add | edit | delete
 */
export function hasPermission(
  permissions: RolePermissions | null,
  resource: string,
  action: PermissionAction
): boolean {
  if (!permissions) return false;
  const resourcePerms = permissions[resource];
  if (!resourcePerms) return false;
  return resourcePerms[action] === 1;
}

/**
 * Check if user has view permission (used for route/sidebar visibility)
 */
export function canViewResource(
  permissions: RolePermissions | null,
  resource: string
): boolean {
  return hasPermission(permissions, resource, 'view');
}

/**
 * Check if user has any of the given permissions (for composite menu items like roles-and-permissions)
 */
export function hasAnyPermission(
  permissions: RolePermissions | null,
  resources: string[],
  action: PermissionAction = 'view'
): boolean {
  if (!permissions) return false;
  return resources.some((resource) => hasPermission(permissions, resource, action));
}

/**
 * Check if a sidebar/menu item should be visible based on permissions
 * - No permission key: always visible
 * - "dashboard": always visible for authenticated users
 * - permissions null (legacy): allow all for backward compatibility
 * - single resource: check view permission
 * - array of resources: show if any has view permission
 */
export function canViewMenuItem(
  permissions: RolePermissions | null,
  permission?: string | string[]
): boolean {
  if (!permission) return true;
  if (permission === 'dashboard') return true; // Dashboard always visible
  if (!permissions) return true; // Legacy: no permissions = show all
  if (Array.isArray(permission)) {
    return hasAnyPermission(permissions, permission, 'view');
  }
  return canViewResource(permissions, permission);
}

/**
 * Route to permission resource mapping
 * Used for sidebar filtering and route guards
 * Key: path pattern (exact or prefix for nested routes)
 * Value: { resource, action? } - action defaults to 'view' for list pages
 */
export const ROUTE_PERMISSION_MAP: Array<{
  pattern: RegExp | string;
  resource: string | string[];
  action?: PermissionAction;
}> = [
  { pattern: '^/$', resource: 'dashboard' },
  { pattern: '^/roles-and-permissions', resource: ['roles', 'permissions'] },
  { pattern: '^/admins/add', resource: 'admins', action: 'add' },
  { pattern: '^/admins/edit', resource: 'admins', action: 'edit' },
  { pattern: '^/admins', resource: 'admins' },
  { pattern: '^/countries', resource: 'countries' },
  { pattern: '^/governorates', resource: 'governorates' },
  { pattern: '^/areas', resource: 'areas' },
  { pattern: '^/categories/add', resource: 'categories', action: 'add' },
  { pattern: '^/categories/edit', resource: 'categories', action: 'edit' },
  { pattern: '^/categories', resource: 'categories' },
  { pattern: '^/subcategories/add', resource: 'subcategories', action: 'add' },
  { pattern: '^/subcategories/edit', resource: 'subcategories', action: 'edit' },
  { pattern: '^/subcategories', resource: 'subcategories' },
  { pattern: '^/customers', resource: 'customers' },
  { pattern: '^/products/add', resource: 'products', action: 'add' },
  { pattern: '^/products/edit', resource: 'products', action: 'edit' },
  { pattern: '^/products', resource: 'products' },
  { pattern: '^/charities', resource: 'charities' },
  { pattern: '^/offers', resource: 'offers' },
  { pattern: '^/orders/add', resource: 'orders', action: 'add' },
  { pattern: '^/orders', resource: 'orders' },
  { pattern: '^/enter-sale-order', resource: 'orders', action: 'add' },
  { pattern: '^/invoices', resource: 'invoices' },
  { pattern: '^/refund-requests', resource: 'refund_requests' },
  { pattern: '^/payments', resource: 'transactions' },
  { pattern: '^/points-transactions', resource: 'points_transactions' },
  { pattern: '^/settings', resource: 'settings' },
  { pattern: '^/activity-logs', resource: 'activity_logs' },
  { pattern: '^/sliders', resource: 'sliders' },
  { pattern: '^/contact-us', resource: 'contact_us' },
  { pattern: '^/careers/add', resource: 'careers', action: 'add' },
  { pattern: '^/careers/edit', resource: 'careers', action: 'edit' },
  { pattern: '^/careers', resource: 'careers' },
  { pattern: '^/social-media-links', resource: 'social_media_links' },
  { pattern: '^/faqs', resource: 'faqs' },
  { pattern: '^/team-members/add', resource: 'team_members', action: 'add' },
  { pattern: '^/team-members/edit', resource: 'team_members', action: 'edit' },
  { pattern: '^/team-members', resource: 'team_members' },
];

/**
 * Check if user can access a route based on permissions
 * Dashboard (/) is always allowed for authenticated users
 */
export function canAccessRoute(
  permissions: RolePermissions | null,
  pathname: string
): boolean {
  const normalizedPath = pathname.replace(/\/$/, '') || '/';

  // Dashboard - always allow authenticated users
  if (normalizedPath === '/' || normalizedPath === '') return true;

  if (!permissions) return true; // Legacy: no permissions = allow all

  for (const { pattern, resource, action = 'view' } of ROUTE_PERMISSION_MAP) {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    if (regex.test(normalizedPath)) {
      if (resource === 'dashboard') return true;
      if (Array.isArray(resource)) {
        return hasAnyPermission(permissions, resource, action);
      }
      return hasPermission(permissions, resource, action);
    }
  }

  return true; // Unknown route - allow
}
