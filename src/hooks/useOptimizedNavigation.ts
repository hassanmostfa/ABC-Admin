"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useCallback } from "react";

export const useOptimizedNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  const navigate = useCallback(async (href: string) => {
    if (href === pathname) return; // Don't navigate to same page
    
    setIsNavigating(true);
    
    try {
      // Prefetch the route for faster loading
      router.prefetch(href);
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      router.push(href);
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      // Reset loading state after navigation
      setTimeout(() => setIsNavigating(false), 500);
    }
  }, [router, pathname]);

  return {
    navigate,
    isNavigating,
    pathname
  };
};
