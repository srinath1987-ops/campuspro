
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BusFront, 
  Home, 
  Users, 
  List, 
  User, 
  Settings, 
  X 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import NavItem from './NavItem';
import { useAuth } from '@/contexts/AuthContext';

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentPath: string;
  role: 'admin' | 'driver';
};

const Sidebar = ({ sidebarOpen, setSidebarOpen, currentPath, role }: SidebarProps) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const userName = profile?.username || (role === 'admin' ? 'Admin User' : 'Driver User');
  const userInitials = userName.substring(0, 2).toUpperCase();
  
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

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-50 transition-transform flex flex-col",
        sidebarOpen 
          ? "translate-x-0 w-64 bg-[#111] text-white" 
          : "-translate-x-full w-64 md:translate-x-0 md:w-16 bg-[#111] text-white"
      )}
    >
      {/* Logo */}
      <div 
        className={cn(
          "flex items-center h-16 px-4 border-b border-gray-800 cursor-pointer",
          !sidebarOpen && "md:justify-center"
        )}
        onClick={handleLogoClick}
      >
        <div className="bus-gradient-bg rounded-full p-2 flex-shrink-0">
          <BusFront className="h-5 w-5 text-white" />
        </div>
        {sidebarOpen && (
          <span className="ml-2 font-bold text-lg text-white">CampusPro</span>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-auto md:hidden text-white"
          onClick={(e) => {
            e.stopPropagation();
            setSidebarOpen(false);
          }}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarOpen ? (
          <>
            <div className="mb-4">
              <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
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
                  currentPath === item.href ? "bg-primary text-white" : "text-gray-400 hover:text-white"
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
        "p-4 border-t border-gray-800",
        !sidebarOpen && "flex justify-center"
      )}>
        {sidebarOpen ? (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback className="bus-gradient-bg text-white">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">{userName}</p>
              <p className="text-xs text-gray-400 truncate capitalize">{role}</p>
            </div>
          </div>
        ) : (
          <Avatar onClick={() => navigate(`/${role}/profile`)} className="cursor-pointer">
            <AvatarImage src="" />
            <AvatarFallback className="bus-gradient-bg text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
