
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BusFront, Info, MapPin, Layers, LogIn, LogOut, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/AuthContext';

const NavItem = ({ 
  to, 
  children, 
  icon: Icon,
  className
}: { 
  to: string; 
  children: React.ReactNode; 
  icon: React.ComponentType<any>;
  className?: string;
}) => (
  <Link to={to}>
    <Button variant="ghost" className={cn("rounded-full gap-2", className)}>
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Button>
  </Link>
);

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border py-3">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="bus-gradient-bg rounded-full p-2">
            <BusFront className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl">Campus Bus Beacon</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-1">
          <NavItem to="/" icon={BusFront}>Home</NavItem>
          <NavItem to="/about" icon={Info}>About</NavItem>
          <NavItem to="/bus-points" icon={MapPin}>Bus Points</NavItem>
          
          {user ? (
            <>
              {profile?.role === 'admin' && (
                <NavItem to="/admin/dashboard" icon={Layers}>Dashboard</NavItem>
              )}
              {profile?.role === 'driver' && (
                <NavItem to="/driver/dashboard" icon={Layers}>Dashboard</NavItem>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full ml-2">
                    <User className="h-4 w-4 mr-2" />
                    {profile?.username || 'Account'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem disabled>
                    {profile?.role === 'admin' ? 'Admin' : 'Driver'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link to={profile?.role === 'admin' ? '/admin/dashboard' : '/driver/dashboard'} className="w-full">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <NavItem to="/login" icon={LogIn} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Login
              </NavItem>
              <NavItem to="/signup" icon={User} className="ml-1">
                Sign Up
              </NavItem>
            </>
          )}
        </div>
        
        <Button variant="outline" size="icon" className="md:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
            <line x1="4" x2="20" y1="12" y2="12"/>
            <line x1="4" x2="20" y1="6" y2="6"/>
            <line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
