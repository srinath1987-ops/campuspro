
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BusFront, UserPlus, Loader2, CheckCircle } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Define the sign-up form schema with default values for driver_name
const signUpSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  role: z.literal('driver'),
  bus_number: z.string().optional(),
});

type SignUpValues = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      phone: "",
      role: "driver",
      bus_number: "",
    },
  });

  const onSubmit = async (values: SignUpValues) => {
    setIsLoading(true);
    try {
      console.log("Submitting signup with values:", values);
      
      // Pass the username value consistently as the fullName parameter
      await signUp(
        values.email, 
        values.password, 
        values.username, // Pass username as the fullName parameter
        values.role
      );
      
      // Set success state here
      setSignupSuccess(true);
      
      // Delay navigation to login page to allow user to see success message
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Check for specific error messages that indicate the user was actually created
      if (error.message?.includes('violates row-level security') || 
          error.message?.includes('profile creation') ||
          error.message?.includes('Profile creation') ||
          error.message?.includes('already exists')) {
        
        setSignupSuccess(true);
        toast({
          title: "Account Created",
          description: "Your account was created successfully. You can now log in.",
        });
        
        // Navigate to login after a slight delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // This is a true error
        const errorMessage = error?.message || 'Failed to sign up. Please try again.';
        toast({
          title: "Sign Up Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 bus-hero-pattern flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {signupSuccess ? (
            <Card className="shadow-lg">
              <CardHeader className="space-y-1">
                <div className="flex justify-center mb-2">
                  <div className="p-2 bg-green-500 rounded-full">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center">Success!</CardTitle>
                <CardDescription className="text-center">
                  Your account has been created successfully. Redirecting to login...
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center pt-4">
                <Button
                  onClick={() => navigate('/login')}
                  className="bus-gradient-bg hover:opacity-90"
                >
                  Go to Login
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="shadow-lg">
              <CardHeader className="space-y-1">
                <div className="flex justify-center mb-2">
                  <div className="p-2 bus-gradient-bg rounded-full">
                    <BusFront className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center">Sign Up</CardTitle>
                <CardDescription className="text-center">
                  Create an account to access the bus tracking system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                            <Input placeholder="Create a password" type="password" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your phone number" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bus_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bus Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter assigned bus number" {...field} disabled={isLoading} />
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
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Creating Account...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <UserPlus className="mr-2 h-4 w-4" /> Create Account
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center">
                <div className="text-sm text-center">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary font-semibold hover:underline">
                    Login
                  </Link>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SignUp;
