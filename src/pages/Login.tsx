
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { BusFront, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { useAppSelector } from '@/redux/hooks';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

type LoginValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [loginAttempt, setLoginAttempt] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Redux state
  const { user, profile, isLoading } = useAppSelector(state => state.auth);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Effect to redirect authenticated users
  useEffect(() => {
    if (user && profile && !loginAttempt) {
      // Try to get return URL from location state first (more reliable)
      const returnUrl = location.state?.returnUrl;
      
      // Then fall back to query params
      const params = new URLSearchParams(location.search);
      const redirectPath = returnUrl || params.get('redirect');
      
      if (redirectPath) {
        // Check if the redirect URL is appropriate for the user role
        const isAdminRoute = redirectPath.startsWith('/admin');
        const isDriverRoute = redirectPath.startsWith('/driver');
        
        if ((isAdminRoute && profile.role === 'admin') || 
            (isDriverRoute && profile.role === 'driver') ||
            (!isAdminRoute && !isDriverRoute)) {
          navigate(redirectPath, { replace: true });
          return;
        }
      }
      
      // If no redirect URL or inappropriate role, use default redirection
      redirectBasedOnRole(profile.role);
    }
  }, [user, profile, location.search, location.state, navigate, loginAttempt]);

  const redirectBasedOnRole = (role: string) => {
    if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (role === 'driver') {
      navigate('/driver/dashboard', { replace: true });
    }
  };

  const onSubmit = async (values: LoginValues) => {
    setLoginAttempt(true);
    try {
      await signIn(values.email, values.password);
      // Navigation is handled in the useEffect above when user/profile is updated
    } catch (error: any) {
      // Error handling is done through the auth context
      console.error('Login error:', error);
    } finally {
      // Reset login attempt flag after a delay to allow redirects to happen
      setTimeout(() => {
        setLoginAttempt(false);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 bus-hero-pattern flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-2">
                <div className="p-2 bus-gradient-bg rounded-full">
                  <BusFront className="h-6 w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Login</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" type="email" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your password" type="password" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bus-gradient-bg hover:opacity-90" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Signing In...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <LogIn className="mr-2 h-4 w-4" /> Sign In
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col">
              <div className="text-sm text-center mb-4">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary font-semibold hover:underline">
                  Sign Up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
