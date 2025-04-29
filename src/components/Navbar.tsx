
import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BusFront, Info, MapPin, Layers, LogIn, LogOut, User, Menu, X, PanelRight, MessageCircle } from 'lucide-react';
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
          isActive && "bg-yellow-400/10 text-yellow-400 dark:bg-yellow-400/20",
          "text-gray-300 hover:text-yellow-400",
          className
        )}
      >
        <Icon className={cn("h-4 w-4", isActive && "text-yellow-400")} />
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
    // console.log("Navbar auth state:", { user: !!user, profile: profile?.role, isLoading });
  }, [user, profile, isLoading]);
  
  const handleLogout = async () => {
    try {
      await signOut();
      // Navigation is now handled in signOut
    } catch (error) {
      console.error('Logout failed:', error);
      // If signOut fails, try to navigate anyway
      navigate('/login', { replace: true });
    }
  };

  const getDashboardLink = () => {
    if (!profile) return '/login';
    return profile.role === 'admin' ? '/admin/dashboard' : '/driver/dashboard';
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <BusFront className="h-5 w-5 text-yellow-400" />
          <span className="text-lg font-bold text-white">CampusPro</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-1">
          <NavItem to="/" icon={BusFront}>Home</NavItem>
          <NavItem to="/about" icon={Info}>About</NavItem>
          <NavItem to="/features" icon={PanelRight}>Features</NavItem>
          <NavItem to="/bus-points" icon={MapPin}>Bus Points</NavItem>
          <NavItem to="/feedback" icon={MessageCircle}>Feedback</NavItem>
          
          {user ? (
            <>
              <NavItem to={getDashboardLink()} icon={Layers}>Dashboard</NavItem>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full ml-2 border-gray-700 bg-gray-900">
                    <User className="h-4 w-4 mr-2 text-yellow-400" />
                    {profile?.full_name || (profile as any)?.username || 'Account'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                  <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
                  <DropdownMenuItem disabled className="text-gray-400">
                    {profile?.role === 'admin' ? 'Admin' : 'Driver'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem className="focus:bg-gray-800 focus:text-white">
                    <Link to={`/${profile?.role}/profile`} className="w-full text-gray-300">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-gray-800 focus:text-white">
                    <Link to={`/${profile?.role}/settings`} className="w-full text-gray-300">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="text-red-400 focus:bg-red-900/30 focus:text-red-300"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <NavItem to="/login" icon={LogIn} className="bg-yellow-400 text-black hover:bg-yellow-500 hover:text-black">
                Login
              </NavItem>
              <NavItem to="/signup" icon={User} className="border border-yellow-500/30 text-yellow-400 hover:bg-yellow-400/10 ml-1">
                Sign Up
              </NavItem>
            </>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden border-gray-700 bg-gray-900">
              <Menu className="h-5 w-5 text-gray-300" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="md:hidden w-[250px] sm:w-[300px] bg-gray-900 border-l border-gray-800">
            <div className="flex flex-col gap-4 py-4">
              <NavItem to="/" icon={BusFront} isMobile onClick={() => setMobileMenuOpen(false)}>Home</NavItem>
              <NavItem to="/about" icon={Info} isMobile onClick={() => setMobileMenuOpen(false)}>About</NavItem>
              <NavItem to="/features" icon={PanelRight} isMobile onClick={() => setMobileMenuOpen(false)}>Features</NavItem>
              <NavItem to="/bus-points" icon={MapPin} isMobile onClick={() => setMobileMenuOpen(false)}>Bus Points</NavItem>
              <NavItem to="/feedback" icon={MessageCircle} isMobile onClick={() => setMobileMenuOpen(false)}>Feedback</NavItem>
              
              {user ? (
                <>
                  <NavItem to={getDashboardLink()} icon={Layers} isMobile onClick={() => setMobileMenuOpen(false)}>Dashboard</NavItem>
                  <div className="border-t border-gray-800 my-2 pt-2">
                    <p className="px-4 py-2 text-sm font-medium text-gray-400">
                      Signed in as: {profile?.full_name || (profile as any)?.username || 'User'}
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
                      className="w-full justify-start text-red-400 hover:text-red-300 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-950/30"
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
                <div className="border-t border-gray-800 my-2 pt-2">
                  <Button
                    className="w-full mb-2 bg-yellow-400 hover:bg-yellow-500 text-black"
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    <span>Login</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-400/10"
                    onClick={() => {
                      navigate('/signup');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span>Sign Up</span>
                  </Button>
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
