"use client";
import React from "react";

interface TimelineEntry {
  title: string;
  subtitle?: string;
  content?: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  return (
    <div className="relative w-full">
      {/* Vertical blue line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-500"></div>

      <div className="space-y-6">
        {data.map((item, index) => (
          <div key={index} className="relative pl-12">
            {/* Circle marker - exactly matching the design in the image */}
            <div className="absolute left-4 top-1 w-4 h-4 -translate-x-1/2 bg-black border border-blue-500 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            </div>

            {/* Content */}
            <div className="bg-card dark:bg-card p-2 rounded-lg border border-border shadow-sm">
              <div className="font-medium text-foreground">{item.title}</div>
              {item.subtitle && (
                <div className="text-sm text-muted-foreground">{item.subtitle}</div>
              )}
              {item.content && (
                <div className="mt-2">{item.content}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
