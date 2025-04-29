
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { fetchSession } from "./redux/slices/authSlice";
import { ThemeProvider } from "./components/theme-provider";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatAssistant from "./components/ChatAssistant";
import './App.css';

// Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Features from "./pages/Features";
import BusPoints from "./pages/BusPoints";
import Feedback from "./pages/Feedback";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProfile from "./pages/admin/Profile";
import AdminSettings from "./pages/admin/Settings";
import AdminDrivers from "./pages/admin/Drivers";
import AdminBuses from "./pages/admin/Buses";
import AdminReports from "./pages/admin/Reports";
import AddBus from "./pages/admin/AddBus";
import DriverDashboard from "./pages/driver/Dashboard";
import DriverProfile from "./pages/driver/Profile";
import DriverSettings from "./pages/driver/Settings";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

// Create a query client with optimized settings for tab switching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false, // Prevent refetching when window regains focus
      staleTime: 30000, // Data is fresh for 30 seconds
      refetchInterval: 60000, // Only refetch every minute
      refetchIntervalInBackground: false, // Don't refetch in background
    },
  },
});

const AppContent = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector(state => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [appInitialized, setAppInitialized] = useState(false);
  const sessionCheckIntervalRef = useRef<number | null>(null);
  const visibilityChangeRef = useRef<boolean>(false);
  const wasLoggedIn = useRef<boolean>(false);

  // Save the user login state for comparison after visibility change
  useEffect(() => {
    if (user) {
      wasLoggedIn.current = true;
    }
  }, [user]);

  // Initialize auth session on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await dispatch(fetchSession()).unwrap();
      } catch (error) {
        console.error("Error initializing session:", error);
      } finally {
        setAppInitialized(true);
      }
    };
    
    initializeApp();
    
    // Set up periodic session check that only runs when the document is visible
    // but use long interval to prevent unnecessary reloads
    sessionCheckIntervalRef.current = window.setInterval(() => {
      if (document.visibilityState === 'visible' && !visibilityChangeRef.current) {
        dispatch(fetchSession());
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    };
  }, [dispatch]);

  // Handle visibility change events without triggering reloads
  useEffect(() => {
    const handleVisibilityChange = () => {
      // When page becomes visible again
      if (document.visibilityState === 'visible') {
        visibilityChangeRef.current = true;
        
        // Only check the session if the user was previously logged in
        // and don't force any reloads/redirects unless absolutely necessary
        if (wasLoggedIn.current) {
          // We'll do a silent session check without forcing a reload
          dispatch(fetchSession())
            .then(() => {
              setTimeout(() => {
                visibilityChangeRef.current = false;
              }, 1000);
            })
            .catch(() => {
              visibilityChangeRef.current = false;
            });
        } else {
          visibilityChangeRef.current = false;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch]);

  // Redirect to login page if session is lost, except for public routes
  useEffect(() => {
    if (!appInitialized) return;
    
    const publicRoutes = ['/', '/about', '/features', '/bus-points', '/feedback', '/login', '/signup'];
    const isPublicRoute = publicRoutes.some(route => location.pathname === route);
    
    // Only redirect if:
    // 1. We're not in a loading state
    // 2. User is not logged in
    // 3. We're not on a public route
    // 4. We're not in a visibility change state (prevents reload on tab switch)
    if (!isLoading && !user && !isPublicRoute && !visibilityChangeRef.current) {
      navigate('/login', { replace: true });
    }
  }, [user, isLoading, navigate, location.pathname, appInitialized]);

  // Show loading indicator while app is initializing
  if (isLoading && !appInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading CampusPro...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/bus-points" element={<BusPoints />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/profile" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminSettings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/drivers" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDrivers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/buses" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminBuses />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reports" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminReports />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/buses/add" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AddBus />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={<Navigate to="/admin/dashboard" replace />} 
        />
        
        {/* Driver Routes */}
        <Route 
          path="/driver/dashboard" 
          element={
            <ProtectedRoute allowedRole="driver">
              <DriverDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/driver/profile" 
          element={
            <ProtectedRoute allowedRole="driver">
              <DriverProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/driver/settings" 
          element={
            <ProtectedRoute allowedRole="driver">
              <DriverSettings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/driver" 
          element={<Navigate to="/driver/dashboard" replace />} 
        />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  // Add useEffect to set dark mode class on document element
  useEffect(() => {
    // Remove light class and add dark class
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    // Also store the preference in localStorage
    localStorage.setItem('campus-pro-theme', 'dark');
  }, []);
  
  return (
    <BrowserRouter>
      {/* Fix provider ordering - React Redux Provider should be outside all other providers */}
      {/* ThemeProvider should be before AuthProvider and QueryClientProvider */}
      <ThemeProvider defaultTheme="dark" storageKey="campus-pro-theme">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AppContent />
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
