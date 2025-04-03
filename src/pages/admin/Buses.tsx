import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';

// Add this import if you're using it in your existing Buses component
import { useToast } from '@/hooks/use-toast';

const Buses = () => {
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchBuses = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('bus_details')
          .select('*');
          
        if (error) throw error;
        setBuses(data || []);
      } catch (error) {
        console.error('Error fetching buses:', error);
        toast({
          title: 'Error',
          description: 'Failed to load buses. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBuses();
  }, [toast]);
  
  const handleAddBus = () => {
    navigate('/admin/buses/add');
  };

  return (
    <DashboardLayout title="Bus Management" role="admin" currentPath="/admin/buses">
      <div className="container mx-auto py-6">
        {/* Header Section with Add Bus Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Buses</h2>
            <p className="text-gray-500">Manage all buses and their details</p>
          </div>
          <Button className="bus-gradient-bg" onClick={handleAddBus}>
            <Plus className="h-4 w-4 mr-2" /> Add New Bus
          </Button>
        </div>

        {/* Buses List */}
        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : buses.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No buses found</h3>
              <p className="text-muted-foreground">
                There are no buses registered yet. Add your first bus to get started.
              </p>
              <Button className="mt-4 bus-gradient-bg" onClick={handleAddBus}>
                <Plus className="h-4 w-4 mr-2" /> Add New Bus
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bus Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {buses.map((bus) => (
                    <tr key={bus.rfid_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{bus.bus_number}</div>
                        <div className="text-sm text-gray-500">RFID: {bus.rfid_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{bus.driver_name}</div>
                        <div className="text-sm text-gray-500">{bus.driver_phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bus.bus_capacity} seats
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          bus.in_campus 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {bus.in_campus ? 'In Campus' : 'Out of Campus'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-900">
                          View
                        </Button>
                        <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-900">
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Buses;
