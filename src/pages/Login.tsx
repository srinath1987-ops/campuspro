
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BusFront, LogIn, UserPlus, Database } from 'lucide-react';
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
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { setupDemoData } from '@/utils/setupDemoData';
import { useToast } from '@/hooks/use-toast';
import { checkUserExists } from '@/utils/checkUserExists';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingUpDemo, setIsSettingUpDemo] = useState(false);
  const { signIn, session, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (session && profile) {
      redirectBasedOnRole(profile.role);
    }
  }, [session, profile, navigate]);

  const redirectBasedOnRole = (role: string) => {
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'driver') {
      navigate('/driver/dashboard');
    }
  };

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginValues) => {
    setIsLoading(true);
    try {
      await signIn(values.email, values.password);
      // Navigation is handled in the useEffect above
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupDemo = async () => {
    setIsSettingUpDemo(true);
    try {
      // Check if admin user already exists
      const adminExists = await checkUserExists('admin03.snuc@gmail.com');
      
      if (adminExists) {
        toast({
          title: "Demo Data Already Exists",
          description: "The demo accounts are already set up. You can use them to log in.",
        });
        return;
      }
      
      // Setup demo data
      const result = await setupDemoData();
      
      if (result.success) {
        toast({
          title: "Demo Setup Successful",
          description: "Demo accounts have been created. You can now log in with the provided credentials.",
        });
      } else {
        toast({
          title: "Demo Setup Failed",
          description: "There was an error setting up the demo accounts. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error setting up demo:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while setting up demo data.",
        variant: "destructive",
      });
    } finally {
      setIsSettingUpDemo(false);
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
                          <Input placeholder="Enter your email" type="email" {...field} />
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
                          <Input placeholder="Enter your password" type="password" {...field} />
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
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
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
              <div className="text-sm text-center text-gray-500 mt-2">
                <div className="mb-2">
                  For demo purposes:
                </div>
                <Button 
                  onClick={handleSetupDemo} 
                  variant="outline" 
                  className="mb-3 w-full"
                  disabled={isSettingUpDemo}
                >
                  {isSettingUpDemo ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Setting Up...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Database className="mr-2 h-4 w-4" /> Setup Demo Data
                    </span>
                  )}
                </Button>
                <div className="grid grid-cols-2 gap-2 text-left text-xs bg-muted p-2 rounded">
                  <div>
                    <div className="font-semibold">Admin Access:</div>
                    <div>Email: admin03.snuc@gmail.com</div>
                    <div>Password: admin123</div>
                  </div>
                  <div>
                    <div className="font-semibold">Driver Access:</div>
                    <div>Email: ganesh06snuc@gmail.com</div>
                    <div>Password: driver1</div>
                  </div>
                </div>
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
