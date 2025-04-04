import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Bus, ArrowRight, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Features', path: '/features' },
    { name: 'Feedback', path: '/feedback', highlight: true },
    { name: 'Bus Points', path: '/bus-points' },
    
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <Bus className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl hidden sm:inline-block">Campus Pro</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "transition-colors",
                  link.highlight 
                    ? "text-primary hover:text-primary/80 font-medium" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="mr-2">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button asChild>
              <Link to="/login">
                Log In <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex items-center md:hidden gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-3/4 sm:w-64 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <Link to="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                        <Bus className="h-6 w-6 text-primary" />
                        <span className="font-bold text-xl">Campus Pro</span>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <nav className="flex-1 p-4">
                    <ul className="space-y-3">
                      {navLinks.map((link) => (
                        <li key={link.path}>
                          <Link
                            to={link.path}
                            className={cn(
                              "block py-2 transition-colors",
                              link.highlight
                                ? "text-primary hover:text-primary/80 font-medium"
                                : "hover:text-primary"
                            )}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {link.name} {link.highlight && <span className="ml-1">✉️</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                  <div className="p-4 border-t">
                    <Button asChild className="w-full">
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        Log In <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bus className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Campus Pro &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/features" className="hover:text-foreground transition-colors">
              Features
            </Link>
              <Link to="/feedback" className="hover:text-foreground transition-colors">
                Feedback
              </Link>
              <Link to="/bus-points" className="hover:text-foreground transition-colors">
                Bus Points
              </Link>
            <Link to="/login" className="hover:text-foreground transition-colors">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 