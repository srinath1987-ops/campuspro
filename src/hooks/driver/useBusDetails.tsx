
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useBusDetails = (busNumber: string | null) => {
  const [busDetails, setBusDetails] = useState<any | null>(null);
  const [routeDetails, setRouteDetails] = useState<any | null>(null);
  const [pastCounts, setPastCounts] = useState<any[]>([]);
  const [submittedToday, setSubmittedToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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

  useEffect(() => {
    if (busNumber) {
      fetchData(busNumber);
    }
  }, [busNumber]);

  return {
    busDetails,
    routeDetails,
    pastCounts,
    submittedToday,
    isLoading,
    refetchData: () => busNumber && fetchData(busNumber)
  };
};
