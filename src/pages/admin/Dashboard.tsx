
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  BusFront, 
  CheckCircle, 
  Clock, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Users 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Stat Card Component
const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  trend,
  trend_value,
  iconColor
}: { 
  icon: React.ComponentType<any>; 
  title: string; 
  value: string | number;
  trend?: string;
  trend_value?: number;
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
      {trend && (
        <p className="text-xs flex items-center gap-1">
          {trend_value && trend_value > 0 ? (
            <ArrowUp className="h-3 w-3 text-green-500" />
          ) : trend_value && trend_value < 0 ? (
            <ArrowDown className="h-3 w-3 text-red-500" />
          ) : null}
          <span className={cn(
            "text-muted-foreground",
            trend_value && trend_value > 0 ? "text-green-500" : 
            trend_value && trend_value < 0 ? "text-red-500" : ""
          )}>
            {trend}
          </span>
        </p>
      )}
    </CardContent>
  </Card>
);

// Helper function
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

// Get month name for display
const getMonthName = (monthIndex: number) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex - 1] || '';
};

// Get current year and month
const getCurrentYearMonth = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1 // JavaScript months are 0-indexed
  };
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [buses, setBuses] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(getCurrentYearMonth().year.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentYearMonth().month.toString());
  
  // Calculate stats from data
  const busesInside = buses.filter(bus => bus.in_campus).length;
  const busesOutside = buses.filter(bus => !bus.in_campus).length;
  const totalBuses = buses.length;
  const totalCapacity = buses.reduce((acc, bus) => acc + (bus.bus_capacity || 0), 0);
  const totalStudents = buses.reduce((acc, bus) => acc + (bus.student_count || 0), 0);
  const averageOccupancy = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;
  
  useEffect(() => {
    // Check if user is logged in and is admin
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to access this page.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    if (profile?.role !== 'admin') {
      toast({
        title: "Access denied",
        description: "You do not have permission to access this page.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    // Fetch data
    fetchData();
  }, [user, profile, navigate, toast, selectedYear, selectedMonth]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch buses
      const { data: busesData, error: busesError } = await supabase
        .from('bus_details')
        .select('*');
      
      if (busesError) throw busesError;
      
      // Fetch the latest student count for each bus
      const busesWithCount = await Promise.all((busesData || []).map(async (bus) => {
        const { data: countData, error: countError } = await supabase
          .from('bus_student_count')
          .select('*')
          .eq('bus_number', bus.bus_number)
          .order('date', { ascending: false })
          .limit(1);
          
        if (countError) {
          console.error('Error fetching count:', countError);
          return { ...bus, student_count: 0 };
        }
        
        return { 
          ...bus, 
          student_count: countData && countData.length > 0 ? countData[0].student_count : 0 
        };
      }));
      
      setBuses(busesWithCount);
      
      // Fetch daily data for the selected month and year
      const startOfMonth = `${selectedYear}-${selectedMonth.padStart(2, '0')}-01`;
      const endOfMonth = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).toISOString().split('T')[0];
      
      const { data: dailyCountData, error: dailyCountError } = await supabase
        .from('bus_student_count')
        .select('date, student_count')
        .gte('date', startOfMonth)
        .lte('date', endOfMonth)
        .order('date', { ascending: true });
        
      if (dailyCountError) throw dailyCountError;
      
      // Process daily data for chart
      const dailyCounts: Record<string, number> = {};
      (dailyCountData || []).forEach(entry => {
        const day = entry.date.split('-')[2]; // Extract day from date
        dailyCounts[day] = (dailyCounts[day] || 0) + entry.student_count;
      });
      
      const processedDailyData = Object.entries(dailyCounts).map(([day, count]) => ({
        day,
        count
      })).sort((a, b) => parseInt(a.day) - parseInt(b.day));
      
      setDailyData(processedDailyData);
      
      // Fetch monthly data for the selected year
      const { data: monthlyCountData, error: monthlyCountError } = await supabase
        .from('bus_student_count')
        .select('date, student_count')
        .ilike('date', `${selectedYear}-%`)
        .order('date', { ascending: true });
        
      if (monthlyCountError) throw monthlyCountError;
      
      // Process monthly data for chart
      const monthlyCounts: Record<string, number> = {};
      (monthlyCountData || []).forEach(entry => {
        const month = entry.date.split('-')[1]; // Extract month from date
        monthlyCounts[month] = (monthlyCounts[month] || 0) + entry.student_count;
      });
      
      const processedMonthlyData = Object.entries(monthlyCounts).map(([month, count]) => ({
        month: getMonthName(parseInt(month)),
        count
      })).sort((a, b) => {
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months.indexOf(a.month) - months.indexOf(b.month);
      });
      
      setMonthlyData(processedMonthlyData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch dashboard data.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout title="Admin Dashboard" role="admin" currentPath="/admin/dashboard">
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard 
              icon={BusFront} 
              title="Buses Inside Campus" 
              value={busesInside} 
              trend={`${Math.round((busesInside / (totalBuses || 1)) * 100)}% of total fleet`}
              iconColor="bg-green-500"
            />
            <StatCard 
              icon={BusFront} 
              title="Buses Outside Campus" 
              value={busesOutside} 
              trend={`${Math.round((busesOutside / (totalBuses || 1)) * 100)}% of total fleet`}
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

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <Select
                value={selectedYear}
                onValueChange={setSelectedYear}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => getCurrentYearMonth().year - i).map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <Select
                value={selectedMonth}
                onValueChange={setSelectedMonth}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <SelectItem key={month} value={month.toString()}>
                      {getMonthName(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                  <CardTitle>Student Count - {getMonthName(parseInt(selectedMonth))} {selectedYear}</CardTitle>
                  <CardDescription>Daily student counts for the selected month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {dailyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={dailyData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
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
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            There is no student count data for {getMonthName(parseInt(selectedMonth))} {selectedYear}.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="monthly" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Student Count - {selectedYear} Monthly Trends</CardTitle>
                  <CardDescription>Monthly student count trends for the selected year</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {monthlyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={monthlyData}
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
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            There is no student count data for {selectedYear}.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Live Bus Status Table */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Live Bus Status</CardTitle>
              <CardDescription>Real-time status of all buses in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {buses.length > 0 ? (
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
                      {buses.map((bus) => (
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
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <BusFront className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No buses available</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      There are no buses in the system yet.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
