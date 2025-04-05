
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BusFront, Users, Clock, Check, Info } from 'lucide-react';
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
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [busDetails, setBusDetails] = useState<any | null>(null);
  const [routeDetails, setRouteDetails] = useState<any | null>(null);
  const [pastCounts, setPastCounts] = useState<any[]>([]);
  const [studentCount, setStudentCount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedToday, setSubmittedToday] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
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
      
      const { data, error } = await supabase
        .from('bus_student_count')
        .insert([
          {
            bus_number: busDetails.bus_number,
            rfid_id: busDetails.rfid_id,
            student_count: count,
            date: todayDate,
            time: currentTime
          }
        ]);
      
      if (error) throw error;
      
      setSubmittedToday(true);
      setShowSuccessDialog(true);
      
      // Refresh past counts
      fetchData(busDetails.bus_number);
      
    } catch (error: any) {
      console.error('Error submitting count:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit student count.',
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
                      <h3 className="text-sm font-medium text-gray-500">Bus Number</h3>
                      <p className="text-lg font-bold">{busDetails.bus_number}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Route Number</h3>
                      <p className="text-lg font-bold">{routeDetails?.route_no || "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Start Point</h3>
                      <p className="text-lg font-bold">{busDetails.start_point}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Via</h3>
                      <p className="text-lg font-bold">{routeDetails?.via || "N/A"}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Driver Name</h3>
                      <p className="text-lg font-bold">{busDetails.driver_name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                      <p className="text-lg font-bold">{busDetails.driver_phone}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Bus Capacity</h3>
                      <p className="text-lg font-bold">{busDetails.bus_capacity} seats</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Current Status</h3>
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
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No bus assigned</h3>
                    <p className="mt-1 text-sm text-gray-500">
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
                  <Alert className="bg-green-50 border-green-200">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-600">Submission Complete</AlertTitle>
                    <AlertDescription className="text-green-700">
                      You have already submitted the student count for today 
                      ({pastCounts.length > 0 ? pastCounts[0].student_count : 0} students).
                    </AlertDescription>
                  </Alert>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
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
                        className="max-w-xs bg-gray-900"
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
                          <Check className="mr-2 h-4 w-4" /> Submit Count
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
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Time</th>
                        <th className="text-left py-3 px-4">Student Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastCounts.map((entry, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{formatDate(entry.date)}</td>
                          <td className="py-3 px-4">{formatTime(entry.time)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span>{entry.student_count} students</span>
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
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
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
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <ul className="space-y-4">
                    {routeDetails.stops.map((stop: any, index: number) => (
                      <li key={index} className="relative pl-8">
                        <div className="absolute left-2 top-2 w-4 h-4 -translate-x-1/2 bg-primary rounded-full"></div>
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                          <div className="font-bold">{stop.location}</div>
                          <div className="text-gray-600 text-sm">{stop.time}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Info className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No route information</h3>
                    <p className="mt-1 text-sm text-gray-500">
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
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Submission Successful
            </DialogTitle>
            <DialogDescription>
              Your student count has been recorded successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Date:</p>
                <p>{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-medium">Time:</p>
                <p>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div>
                <p className="font-medium">Students:</p>
                <p>{studentCount}</p>
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

export default Dashboard;
