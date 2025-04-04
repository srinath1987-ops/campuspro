
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User, Settings, LogOut } from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';

type HeaderProps = {
  title: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  role: 'admin' | 'driver';
};

const Header = ({ title, sidebarOpen, setSidebarOpen, role }: HeaderProps) => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  
  const userName = profile?.username || (role === 'admin' ? 'Admin User' : 'Driver User');
  const userInitials = userName.substring(0, 2).toUpperCase();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
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
          <DropdownMenuItem onClick={handleLogout} className="text-red-500">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default Header;
