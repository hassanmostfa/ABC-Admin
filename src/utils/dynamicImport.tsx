"use client";
import { lazy, Suspense, ComponentType, ReactNode } from "react";
import { Icon } from "@iconify/react";

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <Icon 
      icon="solar:loading-bold-duotone" 
      className="animate-spin text-primary" 
      height={24} 
    />
  </div>
);

// Dynamic wrapper for heavy components with proper typing
export const withDynamicImport = <P extends Record<string, any> = {}>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ReactNode
) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: P) => (
    <Suspense fallback={fallback ?? <LoadingSpinner />}>
      <LazyComponent {...(props as any)} />
    </Suspense>
  );
};

// Preload function for critical components
export const preloadComponent = (importFunc: () => Promise<any>) => {
  if (typeof window !== "undefined") {
    importFunc();
  }
};