"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/store/selectors/authSelectors";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

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
    }

    // If authenticated and on a public route, redirect to dashboard
    if ((token || isAuthenticated) && isPublicRoute) {
      router.push("/");
    }
  }, [isAuthenticated, pathname, router]);

  return <>{children}</>;
};

export default AuthGuard;

