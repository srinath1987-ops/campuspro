
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
  DialogTrigger,
} from "@/components/ui/dialog";
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

// Mock bus data for the driver (in a real app, this would come from an API)
const mockDriverBus = {
  rfid_id: '126A7C00', 
  bus_number: 'TN06GF2021', 
  driver_name: 'John Doe', 
  driver_phone: '555-123-4567', 
  bus_capacity: 52, 
  start_point: 'Nesapakkam', 
  in_campus: true, 
  in_time: '2023-05-12T08:30:00Z', 
  out_time: null, 
  last_updated: '2023-05-12T08:30:00Z',
  student_count: 42,
  route_no: '01',
  stops: [
    { time: '6:15am', location: 'Ambattur Estate' },
    { time: '6:30am', location: 'Padi' },
    { time: '6:45am', location: 'Anna Nagar' },
    { time: '7:00am', location: 'Koyambedu' },
    { time: '7:15am', location: 'Vadapalani' },
    { time: '7:30am', location: 'Nesapakkam' }
  ],
  via: 'Tambaram Bypass Road'
};

// Mock past student count data
const mockPastCounts = [
  { date: '2023-05-12', count: 42, time: '8:00am' },
  { date: '2023-05-11', count: 45, time: '8:05am' },
  { date: '2023-05-10', count: 40, time: '7:55am' },
  { date: '2023-05-09', count: 44, time: '8:10am' },
  { date: '2023-05-08', count: 46, time: '8:03am' }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [studentCount, setStudentCount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedToday, setSubmittedToday] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in and is a driver
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to access this page.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'driver') {
      toast({
        title: "Access denied",
        description: "You do not have permission to access this page.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    setUser(parsedUser);
    
    // Check if a submission was made today (in a real app, this would be checked via API)
    const today = new Date().toISOString().split('T')[0];
    const mostRecentSubmission = mockPastCounts[0].date;
    setSubmittedToday(today === mostRecentSubmission);
  }, [navigate, toast]);

  if (!user) {
    return null; // Or a loading indicator
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentCount) {
      toast({
        title: "Input required",
        description: "Please enter the student count",
        variant: "destructive"
      });
      return;
    }
    
    const count = parseInt(studentCount, 10);
    if (isNaN(count) || count < 0 || count > mockDriverBus.bus_capacity) {
      toast({
        title: "Invalid count",
        description: `Please enter a number between 0 and ${mockDriverBus.bus_capacity}`,
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedToday(true);
      setShowSuccessDialog(true);
      
      // In a real app, you would update the backend here
    }, 1500);
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

  return (
    <DashboardLayout title="Driver Dashboard" role="driver" currentPath="/driver/dashboard">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Bus Number</h3>
                  <p className="text-lg font-bold">{mockDriverBus.bus_number}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Route Number</h3>
                  <p className="text-lg font-bold">{mockDriverBus.route_no}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Start Point</h3>
                  <p className="text-lg font-bold">{mockDriverBus.start_point}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Via</h3>
                  <p className="text-lg font-bold">{mockDriverBus.via || "N/A"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Driver Name</h3>
                  <p className="text-lg font-bold">{mockDriverBus.driver_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                  <p className="text-lg font-bold">{mockDriverBus.driver_phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Bus Capacity</h3>
                  <p className="text-lg font-bold">{mockDriverBus.bus_capacity} seats</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Current Status</h3>
                  <div className="flex items-center gap-2">
                    {mockDriverBus.in_campus ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse-soft"></span>
                        <span className="text-green-600 font-bold">Inside Campus</span>
                      </>
                    ) : (
                      <>
                        <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse-soft"></span>
                        <span className="text-orange-600 font-bold">Outside Campus</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
            {submittedToday ? (
              <Alert className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">Submission Complete</AlertTitle>
                <AlertDescription className="text-green-700">
                  You have already submitted the student count for today ({mockPastCounts[0].count} students).
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
                      max={mockDriverBus.bus_capacity}
                      placeholder={`Enter count (max: ${mockDriverBus.bus_capacity})`}
                      value={studentCount}
                      onChange={(e) => setStudentCount(e.target.value)}
                      className="max-w-xs"
                      required
                    />
                    <span className="text-gray-500">/ {mockDriverBus.bus_capacity}</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="text"
                    value={new Date().toLocaleDateString()}
                    disabled
                    className="max-w-xs bg-gray-50"
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
              Your last 5 student count submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  {mockPastCounts.map((entry, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{formatDate(entry.date)}</td>
                      <td className="py-3 px-4">{entry.time}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>{entry.count} students</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <ul className="space-y-4">
                {mockDriverBus.stops.map((stop, index) => (
                  <li key={index} className="relative pl-8">
                    <div className="absolute left-2 top-2 w-4 h-4 -translate-x-1/2 bg-bus-primary rounded-full"></div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                      <div className="font-bold">{stop.location}</div>
                      <div className="text-gray-600 text-sm">{stop.time}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      
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
