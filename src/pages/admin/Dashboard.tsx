
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  BusFront, 
  CheckCircle, 
  Clock, 
  Users 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

// Mock data for buses
const mockBuses = [
  { 
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
    student_count: 42
  },
  { 
    rfid_id: '83B25D11', 
    bus_number: 'TN07KL3344', 
    driver_name: 'Jane Smith', 
    driver_phone: '555-987-6543', 
    bus_capacity: 48, 
    start_point: 'Ambattur Estate', 
    in_campus: false, 
    in_time: null, 
    out_time: '2023-05-12T16:45:00Z', 
    last_updated: '2023-05-12T16:45:00Z',
    student_count: 36
  },
  { 
    rfid_id: '54C93E22', 
    bus_number: 'TN05RZ9988', 
    driver_name: 'Mike Johnson', 
    driver_phone: '555-456-7890', 
    bus_capacity: 52, 
    start_point: 'Tambaram', 
    in_campus: true, 
    in_time: '2023-05-12T09:15:00Z', 
    out_time: null, 
    last_updated: '2023-05-12T09:15:00Z',
    student_count: 48
  },
  { 
    rfid_id: '21D84F33', 
    bus_number: 'TN09YX7722', 
    driver_name: 'Sarah Williams', 
    driver_phone: '555-789-0123', 
    bus_capacity: 48, 
    start_point: 'Porur', 
    in_campus: false, 
    in_time: null, 
    out_time: '2023-05-12T17:00:00Z', 
    last_updated: '2023-05-12T17:00:00Z',
    student_count: 40
  },
  { 
    rfid_id: '78E15A44', 
    bus_number: 'TN03CT5566', 
    driver_name: 'Robert Brown', 
    driver_phone: '555-234-5678', 
    bus_capacity: 52, 
    start_point: 'Madipakkam', 
    in_campus: true, 
    in_time: '2023-05-12T08:45:00Z', 
    out_time: null, 
    last_updated: '2023-05-12T08:45:00Z',
    student_count: 45
  }
];

// Mock data for monthly student counts
const mockMonthlyData = [
  { month: 'Jan', count: 3200 },
  { month: 'Feb', count: 3400 },
  { month: 'Mar', count: 3600 },
  { month: 'Apr', count: 3500 },
  { month: 'May', count: 3700 },
  { month: 'Jun', count: 3600 },
  { month: 'Jul', count: 3400 },
  { month: 'Aug', count: 3800 },
  { month: 'Sep', count: 4000 },
  { month: 'Oct', count: 3900 },
  { month: 'Nov', count: 3700 },
  { month: 'Dec', count: 3500 }
];

// Mock data for daily counts
const mockDailyData = Array.from({ length: 14 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  return {
    date: `${date.getMonth() + 1}/${date.getDate()}`,
    count: Math.floor(Math.random() * 200) + 180
  };
});

// Stat Card Component
const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  trend,
  iconColor
}: { 
  icon: React.ComponentType<any>; 
  title: string; 
  value: string | number;
  trend?: string;
  iconColor?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={cn("p-2 rounded-full", iconColor || "bg-primary/10")}>
        <Icon className={cn("h-4 w-4", iconColor ? "text-white" : "text-primary")} />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
    </CardContent>
  </Card>
);

// Helper function
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  
  // Calculate stats from mock data
  const busesInside = mockBuses.filter(bus => bus.in_campus).length;
  const busesOutside = mockBuses.filter(bus => !bus.in_campus).length;
  const totalBuses = mockBuses.length;
  const totalCapacity = mockBuses.reduce((acc, bus) => acc + bus.bus_capacity, 0);
  const totalStudents = mockBuses.reduce((acc, bus) => acc + bus.student_count, 0);
  const averageOccupancy = Math.round((totalStudents / totalCapacity) * 100);
  
  useEffect(() => {
    // Check if user is logged in and is admin
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
    if (parsedUser.role !== 'admin') {
      toast({
        title: "Access denied",
        description: "You do not have permission to access this page.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    setUser(parsedUser);
  }, [navigate, toast]);

  if (!user) {
    return null; // Or a loading indicator
  }

  // Format date for display
  const formatDateForDisplay = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout title="Admin Dashboard" role="admin" currentPath="/admin/dashboard">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon={BusFront} 
          title="Buses Inside Campus" 
          value={busesInside} 
          trend={`${Math.round((busesInside / totalBuses) * 100)}% of total fleet`}
          iconColor="bg-green-500"
        />
        <StatCard 
          icon={BusFront} 
          title="Buses Outside Campus" 
          value={busesOutside} 
          trend={`${Math.round((busesOutside / totalBuses) * 100)}% of total fleet`}
          iconColor="bg-orange-500"
        />
        <StatCard 
          icon={Users} 
          title="Student Occupancy" 
          value={`${averageOccupancy}%`} 
          trend={`${totalStudents} students out of ${totalCapacity} capacity`}
          iconColor="bg-blue-500"
        />
        <StatCard 
          icon={Clock} 
          title="Last Update" 
          value={formatDateForDisplay(new Date().toISOString())} 
          trend="Real-time data"
          iconColor="bg-purple-500"
        />
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Statistics</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Count - Last 14 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={mockDailyData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#0284c7" 
                      fillOpacity={1} 
                      fill="url(#colorCount)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Count - Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockMonthlyData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Student Count" fill="#0284c7" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Live Bus Status Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Live Bus Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Bus #</th>
                  <th className="text-left py-3 px-4">Driver</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Entry/Exit Time</th>
                  <th className="text-left py-3 px-4">Student Count</th>
                </tr>
              </thead>
              <tbody>
                {mockBuses.map((bus) => (
                  <tr key={bus.rfid_id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{bus.bus_number}</td>
                    <td className="py-3 px-4">{bus.driver_name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {bus.in_campus ? (
                          <>
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse-soft"></span>
                            <span className="text-green-600">Inside Campus</span>
                          </>
                        ) : (
                          <>
                            <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse-soft"></span>
                            <span className="text-orange-600">Outside Campus</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {bus.in_campus 
                        ? `Entered at ${formatDateForDisplay(bus.in_time)}` 
                        : `Left at ${formatDateForDisplay(bus.out_time)}`}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{bus.student_count}/{bus.bus_capacity}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Dashboard;
