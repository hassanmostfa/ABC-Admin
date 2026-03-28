"use client";

import React from "react";

/** Pulse placeholder for dashboard / statistics loading states */
export function DashboardSk({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-md bg-lightgray dark:bg-darkgray animate-pulse ${className}`}
      aria-hidden
    />
  );
}
