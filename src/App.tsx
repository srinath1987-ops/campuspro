
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import DriverDashboard from "./pages/driver/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Auth check component
const ProtectedRoute = ({ 
  children, 
  allowedRole 
}: { 
  children: JSX.Element; 
  allowedRole: 'admin' | 'driver';
}) => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }
  
  const user = JSON.parse(storedUser);
  if (user.role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
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
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
