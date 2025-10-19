"use client";
import { lazy, Suspense } from "react";
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

// Dynamic wrapper for heavy components
export const withDynamicImport = <P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: P) => (
    <Suspense fallback={fallback ? <fallback /> : <LoadingSpinner />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Preload function for critical components
export const preloadComponent = (importFunc: () => Promise<any>) => {
  if (typeof window !== 'undefined') {
    importFunc();
  }
};
