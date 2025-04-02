
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BusFront, 
  Home, 
  Users, 
  List, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type NavItemProps = {
  icon: React.ComponentType<any>;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
};

const NavItem = ({ icon: Icon, label, href, active, onClick }: NavItemProps) => (
  <a 
    href={href} 
    className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
      active 
        ? "bg-primary text-primary-foreground" 
        : "text-gray-600 hover:bg-primary/10 hover:text-primary"
    )}
    onClick={(e) => {
      if (onClick) {
        e.preventDefault();
        onClick();
      }
    }}
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </a>
);

type DashboardLayoutProps = {
  children: React.ReactNode;
  title: string;
  role: 'admin' | 'driver';
  currentPath: string;
};

const DashboardLayout = ({ children, title, role, currentPath }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const userName = role === 'admin' ? 'Admin User' : 'Driver User';
  const userInitials = role === 'admin' ? 'AU' : 'DU';

  const handleLogout = () => {
    // Clear user from localStorage
    localStorage.removeItem('user');
    
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    
    // Redirect to login page
    navigate('/login');
  };

  // Define navigation items based on role
  const navItems = role === 'admin' 
    ? [
        { icon: Home, label: 'Dashboard', href: '/admin/dashboard' },
        { icon: Users, label: 'Drivers', href: '/admin/drivers' },
        { icon: List, label: 'Buses', href: '/admin/buses' },
        { icon: User, label: 'Profile', href: '/admin/profile' },
        { icon: Settings, label: 'Settings', href: '/admin/settings' },
      ]
    : [
        { icon: Home, label: 'Dashboard', href: '/driver/dashboard' },
        { icon: User, label: 'Profile', href: '/driver/profile' },
        { icon: Settings, label: 'Settings', href: '/driver/settings' },
      ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform bg-white border-r border-border flex flex-col",
          sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 md:translate-x-0 md:w-20"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-border",
          !sidebarOpen && "md:justify-center"
        )}>
          <div className="bus-gradient-bg rounded-full p-2 flex-shrink-0">
            <BusFront className="h-5 w-5 text-white" />
          </div>
          {sidebarOpen && (
            <span className="ml-2 font-bold text-lg">Campus Bus</span>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem 
              key={item.label}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={currentPath === item.href}
              onClick={() => navigate(item.href)}
            />
          ))}
        </nav>
        
        {/* Logout */}
        <div className="p-4 border-t border-border">
          <NavItem 
            icon={LogOut} 
            label="Logout" 
            href="/logout"
            onClick={handleLogout}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all",
        sidebarOpen ? "md:ml-64" : "md:ml-20"
      )}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback className="bus-gradient-bg text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/${role}/profile`)}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/${role}/settings`)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        
        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
