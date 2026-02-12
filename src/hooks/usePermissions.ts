"use client";

import { useAppSelector } from '@/store/hooks';
import { selectRolePermissions } from '@/store/selectors/authSelectors';
import type { PermissionAction } from '@/store/api/authApi';
import {
  hasPermission,
  canViewResource,
  hasAnyPermission,
  canAccessRoute,
} from '@/utils/permissions';

/**
 * Hook to check user permissions
 */
export function usePermissions() {
  const rolePermissions = useAppSelector(selectRolePermissions);

  return {
    /** Check if user has specific permission */
    hasPermission: (resource: string, action: PermissionAction) =>
      hasPermission(rolePermissions, resource, action),

    /** Check if user can view a resource */
    canView: (resource: string) => canViewResource(rolePermissions, resource),

    /** Check if user can add to a resource */
    canAdd: (resource: string) => hasPermission(rolePermissions, resource, 'add'),

    /** Check if user can edit a resource */
    canEdit: (resource: string) => hasPermission(rolePermissions, resource, 'edit'),

    /** Check if user can delete a resource */
    canDelete: (resource: string) => hasPermission(rolePermissions, resource, 'delete'),

    /** Check if user has any of the given permissions */
    hasAnyPermission: (resources: string[], action: PermissionAction = 'view') =>
      hasAnyPermission(rolePermissions, resources, action),

    /** Check if user can access a route */
    canAccessRoute: (pathname: string) => canAccessRoute(rolePermissions, pathname),

    /** Raw permissions for advanced use */
    rolePermissions,
  };
}
