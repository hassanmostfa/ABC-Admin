"use client";
import React from "react";
import { Icon } from "@iconify/react";

interface NavigationLoadingProps {
  isLoading: boolean;
}

const NavigationLoading: React.FC<NavigationLoadingProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 bg-gray-200 dark:bg-gray-700">
      <div className="h-full bg-primary animate-pulse">
        <div className="h-full bg-gradient-to-r from-primary to-secondary animate-pulse"></div>
      </div>
    </div>
  );
};

export default NavigationLoading;
