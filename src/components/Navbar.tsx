
import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BusFront, Info, MapPin, Layers, LogIn, LogOut, User, Menu, X, PanelRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/AuthContext';

const NavItem = ({ 
  to, 
  children, 
  icon: Icon,
  className,
  isMobile = false,
  onClick,
}: { 
  to: string; 
  children: React.ReactNode; 
  icon: React.ComponentType<any>;
  className?: string;
  isMobile?: boolean;
  onClick?: () => void;
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link to={to} onClick={onClick}>
      <Button 
        variant="ghost" 
        className={cn(
          isMobile ? "w-full justify-start" : "rounded-full gap-2",
          isActive && "bg-primary/10",
          className
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{children}</span>
      </Button>
    </Link>
  );
};

const Navbar = () => {
  const { user, profile, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  // Debug logs
  useEffect(() => {
    console.log("Navbar auth state:", { user: !!user, profile: profile?.role, isLoading });
  }, [user, profile, isLoading]);
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!profile) return '/login';
    return profile.role === 'admin' ? '/admin/dashboard' : '/driver/dashboard';
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
          <NavItem to="/features" icon={PanelRight}>Features</NavItem>
          <NavItem to="/bus-points" icon={MapPin}>Bus Points</NavItem>
          
          {user ? (
            <>
              <NavItem to={getDashboardLink()} icon={Layers}>Dashboard</NavItem>
              
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
                    <Link to={getDashboardLink()} className="w-full">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to={`/${profile?.role}/profile`} className="w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to={`/${profile?.role}/settings`} className="w-full">
                      Settings
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
        
        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="md:hidden w-[250px] sm:w-[300px]">
            <div className="flex flex-col gap-4 py-4">
              <NavItem to="/" icon={BusFront} isMobile onClick={() => setMobileMenuOpen(false)}>Home</NavItem>
              <NavItem to="/about" icon={Info} isMobile onClick={() => setMobileMenuOpen(false)}>About</NavItem>
              <NavItem to="/features" icon={PanelRight} isMobile onClick={() => setMobileMenuOpen(false)}>Features</NavItem>
              <NavItem to="/bus-points" icon={MapPin} isMobile onClick={() => setMobileMenuOpen(false)}>Bus Points</NavItem>
              
              {user ? (
                <>
                  <NavItem to={getDashboardLink()} icon={Layers} isMobile onClick={() => setMobileMenuOpen(false)}>Dashboard</NavItem>
                  <div className="border-t border-border my-2 pt-2">
                    <p className="px-4 py-2 text-sm font-medium text-muted-foreground">
                      Signed in as: {profile?.username}
                    </p>
                    <NavItem 
                      to={`/${profile?.role}/profile`} 
                      icon={User} 
                      isMobile 
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </NavItem>
                    <NavItem 
                      to={`/${profile?.role}/settings`} 
                      icon={User} 
                      isMobile 
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Settings
                    </NavItem>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Logout</span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="border-t border-border my-2 pt-2">
                  <NavItem to="/login" icon={LogIn} isMobile onClick={() => setMobileMenuOpen(false)}>Login</NavItem>
                  <NavItem to="/signup" icon={User} isMobile onClick={() => setMobileMenuOpen(false)}>Sign Up</NavItem>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
