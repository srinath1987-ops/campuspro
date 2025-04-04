import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect } from "react";
import { useAppDispatch } from "./redux/hooks";
import { fetchSession } from "./redux/slices/authSlice";
import { ThemeProvider } from "./components/theme-provider";
import ProtectedRoute from "./components/ProtectedRoute";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  const dispatch = useAppDispatch();

  // Initialize auth session on app start
  useEffect(() => {
    dispatch(fetchSession());
    
    // Set up periodic session check to prevent disconnections
    // This helps prevent the page from randomly reloading due to session issues
    const sessionCheckInterval = setInterval(() => {
      dispatch(fetchSession());
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => {
      clearInterval(sessionCheckInterval);
    };
  }, [dispatch]);

  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
};

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="campus-pro-theme">
    <QueryClientProvider client={queryClient}>
      {/* Keep AuthProvider for backward compatibility with existing code */}
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
