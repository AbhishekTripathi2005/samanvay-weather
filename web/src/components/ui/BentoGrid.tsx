"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function BentoGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4", className)}>
      {children}
    </div>
  );
}

export function BentoItem({
  children,
  colSpan = 1,
  rowSpan = 1,
  className,
}: {
  children: React.ReactNode;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
  className?: string;
}) {
  const colSpanClasses = {
    1: "md:col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-3",
    4: "md:col-span-4",
  };
  const rowSpanClasses = {
    1: "row-span-1",
    2: "row-span-2",
  };

  return (
    <div className={cn(colSpanClasses[colSpan], rowSpanClasses[rowSpan], className)}>
      {children}
    </div>
  );
}
