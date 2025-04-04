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
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Moon,
  Sun
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { useTheme } from '@/components/theme-provider';

type NavItemProps = {
  icon: React.ComponentType<any>;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
};

const NavItem = ({ icon: Icon, label, href, active, onClick, className }: NavItemProps) => (
  <a 
    href={href} 
    className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
      active 
        ? "bg-primary text-primary-foreground" 
        : "text-gray-400 hover:bg-primary/10 hover:text-primary",
      className
    )}
    onClick={(e) => {
      if (onClick) {
        e.preventDefault();
        onClick();
      }
    }}
  >
    <Icon className="h-5 w-5" />
    <span className="flex-1">{label}</span>
  </a>
);

type NavGroupProps = {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

const NavGroup = ({ label, children, defaultOpen = true }: NavGroupProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full"
    >
      <CollapsibleTrigger asChild>
        <button className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-400">
          {label}
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 pl-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

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
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector(state => state.auth);
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  const userName = profile?.full_name || (role === 'admin' ? 'Admin User' : 'Driver User');
  const userInitials = userName.substring(0, 2).toUpperCase();

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
      toast({
        title: 'Logged Out',
        description: 'You have been logged out successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Define navigation items based on role
  const navItems = role === 'admin' 
    ? [
        { icon: Home, label: 'Dashboard', href: '/admin/dashboard' },
        { icon: Users, label: 'Drivers', href: '/admin/drivers' },
        { icon: List, label: 'Buses', href: '/admin/buses' },
        { icon: MessageSquare, label: 'Reports', href: '/admin/reports' },
        { icon: User, label: 'Profile', href: '/admin/profile' },
        { icon: Settings, label: 'Settings', href: '/admin/settings' },
      ]
    : [
        { icon: Home, label: 'Dashboard', href: '/driver/dashboard' },
        { icon: User, label: 'Profile', href: '/driver/profile' },
        { icon: Settings, label: 'Settings', href: '/driver/settings' },
      ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform flex flex-col",
          sidebarOpen 
            ? "translate-x-0 w-64 bg-sidebar text-sidebar-foreground" 
            : "-translate-x-full w-64 md:translate-x-0 md:w-16 bg-sidebar text-sidebar-foreground",
          "bg-[hsl(var(--sidebar-background))]"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center h-16 px-4 border-b",
          "border-[hsl(var(--sidebar-border))]",
          !sidebarOpen && "md:justify-center"
        )}>
          <div className="bus-gradient-bg rounded-full p-2 flex-shrink-0">
            <BusFront className="h-5 w-5 text-white" />
          </div>
          {sidebarOpen && (
            <span className="ml-2 font-bold text-lg text-sidebar-foreground">Campus Bus</span>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto md:hidden text-sidebar-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarOpen ? (
            <>
              <div className="mb-4">
                <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                  Main
                </h3>
                <div className="mt-2 space-y-1">
                  {navItems.map((item) => (
                    <NavItem 
                      key={item.label}
                      icon={item.icon}
                      label={item.label}
                      href={item.href}
                      active={currentPath === item.href}
                      onClick={() => navigate(item.href)}
                      className={currentPath === item.href ? 
                        "bg-[hsl(var(--sidebar-primary))] text-sidebar-primary-foreground" : 
                        "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      }
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4 flex flex-col items-center pt-4">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    "p-2 rounded-md",
                    currentPath === item.href ? 
                      "bg-[hsl(var(--sidebar-primary))] text-sidebar-primary-foreground" : 
                      "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                  )}
                  title={item.label}
                >
                  <item.icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          )}
        </nav>
        
        {/* User Profile Section */}
        <div className={cn(
          "p-4 border-t border-[hsl(var(--sidebar-border))]",
          !sidebarOpen && "flex justify-center"
        )}>
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bus-gradient-bg text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-sidebar-foreground">{userName}</p>
                <p className="text-xs text-sidebar-foreground/70 truncate capitalize">{role}</p>
              </div>
            </div>
          ) : (
            <Avatar onClick={() => navigate(`/${role}/profile`)} className="cursor-pointer">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="bus-gradient-bg text-white">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all",
        sidebarOpen ? "md:ml-64" : "md:ml-16"
      )}>
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sticky top-0 z-30">
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
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={profile?.avatar_url || ""} />
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
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
