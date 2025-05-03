import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useAuth } from '@/contexts/AuthContext';
import { performDirectLogout } from '@/utils/logoutHelper';

export function ResizableNavbarDemo() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      name: "Home",
      link: "/",
    },
    {
      name: "About",
      link: "/about",
    },
    {
      name: "Features",
      link: "/features",
    },
    {
      name: "Bus Points",
      link: "/bus-points",
    },
    {
      name: "Feedback",
      link: "/feedback",
    },
  ];

  const handleLogout = () => {
    // Call signOut from AuthContext
    signOut();

    // As a fallback, use our direct logout method
    performDirectLogout();
  };

  const getDashboardLink = () => {
    if (!profile) return '/login';
    return profile.role === 'admin' ? '/admin/dashboard' : '/driver/dashboard';
  };

  return (
    <div className="w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <NavbarButton
                  variant="secondary"
                  onClick={() => navigate(getDashboardLink())}
                >
                  Dashboard
                </NavbarButton>
                <NavbarButton
                  variant="gradient"
                  onClick={handleLogout}
                >
                  Logout
                </NavbarButton>
              </>
            ) : (
              <>
                <NavbarButton
                  variant="secondary"
                  onClick={() => navigate('/login')}
                >
                  Login
                </NavbarButton>
                <NavbarButton
                  variant="gradient"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </NavbarButton>
              </>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <Link
                key={`mobile-link-${idx}`}
                to={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300 w-full py-2"
              >
                <span className="block">{item.name}</span>
              </Link>
            ))}
            <div className="flex w-full flex-col gap-4 mt-4">
              {user ? (
                <>
                  <NavbarButton
                    onClick={() => {
                      navigate(getDashboardLink());
                      setIsMobileMenuOpen(false);
                    }}
                    variant="primary"
                    className="w-full"
                  >
                    Dashboard
                  </NavbarButton>
                  <NavbarButton
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="gradient"
                    className="w-full"
                  >
                    Logout
                  </NavbarButton>
                </>
              ) : (
                <>
                  <NavbarButton
                    onClick={() => {
                      navigate('/login');
                      setIsMobileMenuOpen(false);
                    }}
                    variant="primary"
                    className="w-full"
                  >
                    Login
                  </NavbarButton>
                  <NavbarButton
                    onClick={() => {
                      navigate('/signup');
                      setIsMobileMenuOpen(false);
                    }}
                    variant="gradient"
                    className="w-full"
                  >
                    Sign Up
                  </NavbarButton>
                </>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
