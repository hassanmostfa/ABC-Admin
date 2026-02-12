"use client";

import React from "react";
import { usePermissions } from "@/hooks/usePermissions";
import type { PermissionAction } from "@/store/api/authApi";

interface HasPermissionProps {
  resource: string;
  action?: PermissionAction;
  /** For composite resources like roles-and-permissions */
  resources?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renders children only if user has the required permission.
 * Use for buttons (add, edit, delete) and other UI elements.
 */
const HasPermission: React.FC<HasPermissionProps> = ({
  resource,
  action = "view",
  resources,
  children,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission } = usePermissions();

  let allowed = false;
  if (resources && resources.length > 0) {
    allowed = hasAnyPermission(resources, action);
  } else {
    allowed = hasPermission(resource, action);
  }

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
};

export default HasPermission;
