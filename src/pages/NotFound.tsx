
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isLoading } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleRedirect = () => {
    if (user) {
      // Redirect based on user role
      if (profile?.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (profile?.role === 'driver') {
        navigate('/driver/dashboard');
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
        <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
        <p className="text-2xl text-gray-700 mb-6">Oops! Page not found</p>
        <p className="text-gray-500 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Button 
          onClick={handleRedirect} 
          className="bus-gradient-bg w-full"
          size="lg"
        >
          {isLoading ? "Loading..." : 
            user ? 
              (profile?.role === 'admin' ? 
                "Return to Admin Dashboard" : 
                "Return to Driver Dashboard") :
              "Return to Home"
          }
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
