import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BusFront, Users, Clock, Check, Info, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from '@supabase/supabase-js';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Define types
type StudentCountRecord = {
  id: number;
  bus_number: string;
  rfid_id: string | null;
  student_count: number;
  date: string;
  time: string;
};

type BusStop = {
  location: string;
  time: string;
  description?: string;
};

type BusRouteDetails = {
  id?: number;
  bus_number: string;
  route_no: string;
  via: string;
  stops: BusStop[];
};

type BusDetails = {
  id: string;
  bus_number: string;
  rfid_id: string;
  driver_name: string;
  driver_phone: string;
  bus_capacity: number;
  in_campus: boolean;
  start_point: string;
  in_time?: string | null;
  out_time?: string | null;
  created_at: string;
};

// Extended Profile type specifically for this component
type DriverProfile = {
  id: string;
  full_name: string;
  role: 'admin' | 'driver' | 'user';
  avatar_url?: string;
  phone_number?: string;
  bus_number?: string; // Added to fix the linter error
};

// Define error type for catch blocks
type SupabaseError = {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth() as { user: User | null; profile: DriverProfile | null };
  const [busDetails, setBusDetails] = useState<BusDetails | null>(null);
  const [routeDetails, setRouteDetails] = useState<BusRouteDetails | null>(null);
  const [pastCounts, setPastCounts] = useState<StudentCountRecord[]>([]);
  const [studentCount, setStudentCount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedToday, setSubmittedToday] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<StudentCountRecord | null>(null);
  
  useEffect(() => {
    // Check if user is logged in and is a driver
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to access this page.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    if (profile?.role !== 'driver') {
      toast({
        title: "Access denied",
        description: "You do not have permission to access this page.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    if (profile?.bus_number) {
      fetchData(profile.bus_number);
    }
  }, [user, profile, navigate, toast]);

  const fetchData = async (busNumber: string) => {
    setIsLoading(true);
    try {
      // Fetch bus details
      const { data: busData, error: busError } = await supabase
        .from('bus_details')
        .select('*')
        .eq('bus_number', busNumber)
        .single();
      
      if (busError) throw busError;
      
      setBusDetails(busData);
      
      // Fetch route details
      const { data: routeData, error: routeError } = await supabase
        .from('bus_routes')
        .select('*')
        .eq('bus_number', busNumber)
        .single();
      
      if (!routeError && routeData) {
        // Parse stops if they're stored as JSON string
        if (typeof routeData.stops === 'string') {
          try {
            routeData.stops = JSON.parse(routeData.stops);
          } catch (e) {
            console.error("Error parsing stops JSON:", e);
            routeData.stops = [];
          }
        }
        setRouteDetails(routeData);
      }
      
      // Fetch past student counts
      const today = new Date().toISOString().split('T')[0];
      
      const { data: countData, error: countError } = await supabase
        .from('bus_student_count')
        .select('*')
        .eq('bus_number', busNumber)
        .order('date', { ascending: false })
        .limit(5);
      
      if (countError) throw countError;
      
      setPastCounts(countData || []);
      
      // Check if a submission was made today
      const submittedTodayCount = (countData || []).find(entry => 
        entry.date === today
      );
      
      setSubmittedToday(!!submittedTodayCount);
      setCurrentSubmission(submittedTodayCount || null);
      setIsUpdating(!!submittedTodayCount);
      
      if (submittedTodayCount) {
        setStudentCount(submittedTodayCount.student_count.toString());
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch bus data.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentCount) {
      toast({
        title: "Input required",
        description: "Please enter the student count",
        variant: "destructive"
      });
      return;
    }
    
    if (!busDetails) {
      toast({
        title: "No bus assigned",
        description: "You don't have a bus assigned to your account.",
        variant: "destructive"
      });
      return;
    }
    
    const count = parseInt(studentCount, 10);
    if (isNaN(count) || count < 0 || count > busDetails.bus_capacity) {
      toast({
        title: "Invalid count",
        description: `Please enter a number between 0 and ${busDetails.bus_capacity}`,
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const now = new Date();
      const todayDate = now.toISOString().split('T')[0];
      const currentTime = now.toISOString();
      
      // console.log('Submitting student count:', {
      //   bus_number: busDetails.bus_number,
      //   date: todayDate,
      //   student_count: count
      // });
      
      // Try approach 1: Check and delete existing records, then insert
      try {
        // Check if we already have a submission for today
        const { data: existingData, error: checkError } = await supabase
          .from('bus_student_count')
          .select('*')
          .eq('bus_number', busDetails.bus_number)
          .eq('date', todayDate);
        
        if (checkError) {
          console.error('Error checking for existing records:', checkError);
          throw checkError;
        }
        
        // console.log('Existing data:', existingData);
        setIsUpdating(existingData && existingData.length > 0);
        
        // First delete any existing records for today for this bus to avoid conflicts
        if (existingData && existingData.length > 0) {
          // console.log('Deleting existing records for today');
          
          // Delete one by one to avoid potential issues
          for (const record of existingData) {
            const { error: deleteError } = await supabase
              .from('bus_student_count')
              .delete()
              .eq('id', record.id);
              
            if (deleteError) {
              console.error('Error deleting record:', deleteError);
              throw deleteError;
            }
          }
        }
        
        // Wait a moment to ensure deletion is processed
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // console.log('Inserting new record');
        // Then insert a new record
        const { data: insertData, error: insertError } = await supabase
          .from('bus_student_count')
          .insert({
            bus_number: busDetails.bus_number,
            rfid_id: busDetails.rfid_id,
            student_count: count,
            date: todayDate,
            time: currentTime
          })
          .select();
        
        if (insertError) {
          console.error('Error inserting new record:', insertError);
          throw insertError;
        }
        
        // console.log('Insert success:', insertData);
      } catch (innerError: SupabaseError) {
        // If the first approach fails, try approach 2: Insert with specific ID
        // console.log('First approach failed, trying alternate approach', innerError);
        
        // Create a deterministic ID based on bus number and date to avoid duplicates
        const deterministicId = `${busDetails.bus_number}-${todayDate}`.hashCode();
        
        // console.log('Using deterministic ID:', deterministicId);
        
        const { error: upsertError } = await supabase
          .from('bus_student_count')
          .upsert(
            {
              // Use a known ID if possible (hashed from bus_number + date)
              id: Math.abs(deterministicId) % 1000000, // Keep it within reasonable range
              bus_number: busDetails.bus_number,
              rfid_id: busDetails.rfid_id,
              student_count: count,
              date: todayDate,
              time: currentTime
            },
            { 
              onConflict: 'id',
              ignoreDuplicates: false
            }
          );
        
        if (upsertError) {
          console.error('Even alternate approach failed:', upsertError);
          throw upsertError;
        }
      }
      
      setSubmittedToday(true);
      setShowSuccessDialog(true);
      
      // Refresh past counts
      fetchData(busDetails.bus_number);
      
    } catch (error: SupabaseError) {
      console.error('Error submitting count:', error);
      let errorMessage = error.message || 'Failed to submit student count.';
      
      // Handle specific error cases
      if (errorMessage.includes('bus_student_count_pkey')) {
        errorMessage = 'A record for today already exists. Please try again.';
      }
      
      toast({
        title: 'Submission Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout title="Driver Dashboard" role="driver" currentPath="/driver/dashboard">
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bus Info Card */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <BusFront />
                Bus Details
              </CardTitle>
              <CardDescription className="text-blue-100">
                Information about your assigned bus
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {busDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bus Number</h3>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{busDetails.bus_number}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Route Number</h3>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{routeDetails?.route_no || "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Point</h3>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{busDetails.start_point}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Via</h3>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{routeDetails?.via || "N/A"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Driver Name</h3>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{busDetails.driver_name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Number</h3>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{busDetails.driver_phone}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bus Capacity</h3>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{busDetails.bus_capacity} seats</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Status</h3>
                      <div className="flex items-center gap-2">
                        {busDetails.in_campus ? (
                          <>
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-green-600 font-bold">Inside Campus</span>
                          </>
                        ) : (
                          <>
                            <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                            <span className="text-orange-600 font-bold">Outside Campus</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <BusFront className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No bus assigned</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      You don't have a bus assigned to your account yet.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Student Count Submission */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users />
                Student Count Update
              </CardTitle>
              <CardDescription>
                Submit the number of students on your bus for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              {busDetails ? (
                submittedToday ? (
                  <div className="px-6 pb-6">
                    <Alert className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-4">
                      <Check className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-600">Submission Complete</AlertTitle>
                      <AlertDescription className="text-gray-700 dark:text-gray-300">
                        You have already submitted the student count for today 
                        ({currentSubmission ? currentSubmission.student_count : 0} students).
                      </AlertDescription>
                    </Alert>
                    {/* <Button 
                      variant="outline" 
                      onClick={() => setSubmittedToday(false)}
                      className="w-full"
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit Today's Submission
                    </Button> */}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
                    <div>
                      <Label htmlFor="studentCount">Number of Students</Label>
                      <div className="flex items-center gap-3 mt-1">
                        <Input
                          id="studentCount"
                          type="number"
                          min="0"
                          max={busDetails.bus_capacity}
                          placeholder={`Enter count (max: ${busDetails.bus_capacity})`}
                          value={studentCount}
                          onChange={(e) => setStudentCount(e.target.value)}
                          className="max-w-xs"
                          required
                        />
                        <span className="text-gray-500">/ {busDetails.bus_capacity}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="text"
                        value={new Date().toLocaleDateString()}
                        disabled
                        className="max-w-xs bg-gray-50 dark:bg-gray-800"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="mt-2 bus-gradient-bg hover:opacity-90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          {isUpdating ? (
                            <><Edit className="mr-2 h-4 w-4" /> Update Count</>
                          ) : (
                            <><Check className="mr-2 h-4 w-4" /> Submit Count</>
                          )}
                        </span>
                      )}
                    </Button>
                  </form>
                )
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>No bus assigned</AlertTitle>
                  <AlertDescription>
                    You need to have a bus assigned to submit student counts.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
          
          {/* Recent Submissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock />
                Recent Submissions
              </CardTitle>
              <CardDescription>
                Your last {pastCounts.length} student count submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pastCounts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-900 dark:text-gray-100">Date</th>
                        <th className="text-left py-3 px-4 text-gray-900 dark:text-gray-100">Time</th>
                        <th className="text-left py-3 px-4 text-gray-900 dark:text-gray-100">Student Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastCounts.map((entry, index) => (
                        <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900">
                          <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{formatDate(entry.date)}</td>
                          <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{formatTime(entry.time)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-800 dark:text-gray-200">{entry.student_count} students</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Clock className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No submissions yet</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      You haven't submitted any student counts yet.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Route Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info />
                Route Information
              </CardTitle>
              <CardDescription>
                Bus stops and schedule for your route
              </CardDescription>
            </CardHeader>
            <CardContent>
              {routeDetails && routeDetails.stops && routeDetails.stops.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800"></div>
                  <ul className="space-y-4">
                    {routeDetails.stops.map((stop: BusStop, index: number) => (
                      <li key={index} className="relative pl-8">
                        <div className="absolute left-2 top-2 w-4 h-4 -translate-x-1/2 bg-primary rounded-full"></div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                          <div className="font-bold text-gray-900 dark:text-white">{stop.location}</div>
                          <div className="text-gray-600 dark:text-gray-300 text-sm">{stop.time}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Info className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No route information</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Route information is not available for your bus.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Check className="h-5 w-5 text-green-600" />
              Submission Successful
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              {isUpdating 
                ? "Your student count has been updated successfully."
                : "Your student count has been recorded successfully."}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">Date:</p>
                <p className="text-gray-700 dark:text-gray-300">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">Time:</p>
                <p className="text-gray-700 dark:text-gray-300">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">Students:</p>
                <p className="text-gray-700 dark:text-gray-300">{studentCount}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

// Add string hash code function
String.prototype.hashCode = function() {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

// Add the string hash code type declaration
declare global {
  interface String {
    hashCode(): number;
  }
}

export default Dashboard;
