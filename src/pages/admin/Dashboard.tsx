import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const { toast } = useToast();

  useEffect(() => {
    fetchChartData();
  }, [currentYear]);

  const fetchChartData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bus_student_count')
        .select('date, student_count')
        .gte('date', `${currentYear}-01-01`)
        .lt('date', `${currentYear + 1}-01-01`)
        .order('date', { ascending: true });

      if (error) throw error;

      // Process the data to aggregate student counts by date
      const aggregatedData = data.reduce((acc, entry) => {
        const date = entry.date;
        const existingEntry = acc.find(item => item.date === date);

        if (existingEntry) {
          existingEntry.student_count += entry.student_count;
        } else {
          acc.push({ date, student_count: entry.student_count });
        }

        return acc;
      }, []);

      setChartData(aggregatedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chart data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleYearChange = (direction: number) => {
    setCurrentYear(prevYear => prevYear + direction);
  };

  return (
    <DashboardLayout title="Admin Dashboard" role="admin" currentPath="/admin/dashboard">
      <div className="container mx-auto py-6">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">Student Count Over Time</CardTitle>
                <CardDescription>Aggregated student counts for bus routes</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="icon" onClick={() => handleYearChange(-1)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span>{currentYear}</span>
                <Button size="icon" onClick={() => handleYearChange(1)}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="student_count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
