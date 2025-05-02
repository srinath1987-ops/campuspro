
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BusFront, UserPlus } from 'lucide-react';
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
import { useAppDispatch } from '@/redux/hooks';
import { signUp } from '@/redux/slices/authSlice';
import { sanitizeString, isValidEmail, isValidPhone } from '@/utils/inputValidation';

// Define the sign-up form schema with enhanced validation
const signUpSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters." })
    .max(50, { message: "Username cannot exceed 50 characters." })
    .refine(val => /^[a-zA-Z0-9\s._-]+$/.test(val), {
      message: "Username can only contain letters, numbers, spaces, and ._-"
    }),

  email: z.string()
    .email({ message: "Please enter a valid email address." })
    .refine(val => isValidEmail(val), {
      message: "Please enter a valid email address."
    }),

  password: z.string()
    .min(6, { message: "Password must be at least 6 characters." })
    .max(100, { message: "Password is too long." })
    .refine(val => /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter."
    })
    .refine(val => /[0-9]/.test(val), {
      message: "Password must contain at least one number."
    }),

  phone: z.string()
    .min(10, { message: "Please enter a valid phone number." })
    .refine(val => isValidPhone(val), {
      message: "Please enter a valid phone number with at least 10 digits."
    }),

  role: z.literal('driver'),

  bus_number: z.string().optional(),
});

type SignUpValues = z.infer<typeof signUpSchema>;

// Form state key for local storage
const SIGNUP_FORM_STATE_KEY = 'signup_form_state';

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
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

  // Handle form state persistence across tab switching
  React.useEffect(() => {
    // Load saved form state from local storage
    const savedState = localStorage.getItem(SIGNUP_FORM_STATE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        form.reset(parsedState);
      } catch (error) {
        console.error('Error parsing saved form state:', error);
        localStorage.removeItem(SIGNUP_FORM_STATE_KEY);
      }
    }

    // Save form state when tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const values = form.getValues();
        localStorage.setItem(SIGNUP_FORM_STATE_KEY, JSON.stringify(values));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Save form values periodically
    const saveInterval = setInterval(() => {
      const values = form.getValues();
      if (Object.values(values).some(value => value !== '')) {
        localStorage.setItem(SIGNUP_FORM_STATE_KEY, JSON.stringify(values));
      }
    }, 5000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(saveInterval);
    };
  }, [form]);

  const onSubmit = async (values: SignUpValues) => {
    setIsLoading(true);
    try {
      // Sanitize input values
      const sanitizedValues = {
        email: sanitizeString(values.email),
        password: values.password, // Don't sanitize password
        fullName: sanitizeString(values.username),
        role: values.role,
        phone: sanitizeString(values.phone)
      };

      // Additional validation
      if (!isValidEmail(sanitizedValues.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!isValidPhone(sanitizedValues.phone)) {
        throw new Error('Please enter a valid phone number');
      }

      // Use Redux action with sanitized values
      await dispatch(signUp(sanitizedValues)).unwrap();

      // Clear saved form data after successful signup
      localStorage.removeItem(SIGNUP_FORM_STATE_KEY);

      toast({
        title: "Account created",
        description: "Your account has been created successfully. You can now log in.",
        variant: "default"
      });

      // Navigate to login page
      navigate('/login');
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error?.message || 'Failed to sign up. Please try again.';
      toast({
        title: "Sign Up Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
                          <Input placeholder="Enter your username" {...field} />
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
                          <Input placeholder="Create a password" type="password" {...field} />
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
                          <Input placeholder="Enter your phone number" {...field} />
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
                          <Input placeholder="Enter assigned bus number" {...field} />
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignUp;
