
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import Sidebar from "./layout/Sidebar";
import Header from "./layout/Header";

type DashboardLayoutProps = {
  children: React.ReactNode;
  title: string;
  role: 'admin' | 'driver';
  currentPath: string;
};

const DashboardLayout = ({ children, title, role, currentPath }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentPath={currentPath}
        role={role}
      />

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all",
        sidebarOpen ? "md:ml-64" : "md:ml-16"
      )}>
        {/* Header */}
        <Header 
          title={title}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          role={role}
        />
        
        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
