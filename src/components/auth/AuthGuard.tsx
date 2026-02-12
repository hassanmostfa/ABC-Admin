"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated, selectRolePermissions } from "@/store/selectors/authSelectors";
import { canAccessRoute } from "@/utils/permissions";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const rolePermissions = useAppSelector(selectRolePermissions);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");

    // Public routes that don't require authentication
    const publicRoutes = [
      "/auth/auth1/login",
      "/auth/auth1/register",
      "/auth/auth1/forgot-password",
      "/auth/auth1/two-steps",
      "/auth/auth2/login",
      "/auth/auth2/register",
      "/auth/auth2/forgot-password",
      "/auth/auth2/two-steps",
      "/auth/error",
      "/auth/maintenance",
    ];

    const isPublicRoute = publicRoutes.some((route) =>
      pathname?.startsWith(route)
    );

    // If not authenticated and not on a public route, redirect to login
    if (!token && !isAuthenticated && !isPublicRoute) {
      router.push("/auth/auth2/login");
      return;
    }

    // If authenticated and on a public route, redirect to dashboard
    if ((token || isAuthenticated) && isPublicRoute) {
      router.push("/");
      return;
    }

    // If authenticated, check route permissions (only for dashboard routes, not auth routes)
    if ((token || isAuthenticated) && !isPublicRoute && pathname) {
      const hasAccess = canAccessRoute(rolePermissions, pathname);
      if (!hasAccess) {
        router.push("/"); // Redirect to dashboard if no permission
      }
    }
  }, [isAuthenticated, pathname, router, rolePermissions]);

  return <>{children}</>;
};

export default AuthGuard;

