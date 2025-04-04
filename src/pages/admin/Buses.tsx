import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Clock, Truck, User, Phone, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// Define Bus and Route types
type Bus = {
  rfid_id: string;
  bus_number: string;
  driver_name: string;
  driver_phone: string;
  bus_capacity: number;
  in_campus: boolean;
  start_point: string;
};

type BusRoute = {
  id: number;
  route_no: string;
  bus_number: string | null;
  stops: { time: string; location: string }[];
  via: string | null;
  rfid_id: string | null;
};

const Buses = () => {
  const navigate = useNavigate();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Record<string, BusRoute>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchBusesAndRoutes = async () => {
      setIsLoading(true);
      try {
        // Fetch buses
        const { data: busesData, error: busesError } = await supabase
          .from('bus_details')
          .select('*');
          
        if (busesError) throw busesError;
        
        // Fetch routes
        const { data: routesData, error: routesError } = await supabase
          .from('bus_routes')
          .select('*');
          
        if (routesError) throw routesError;
        
        // Process the data
        setBuses(busesData || []);
        
        // Create a map of bus_number to route details
        const routesMap: Record<string, BusRoute> = {};
        routesData?.forEach(route => {
          if (route.bus_number) {
            // Convert the stops data to the correct format using our helper function
            const parsedStops = safeParseStops(route.stops);
            routesMap[route.bus_number] = {
              id: route.id,
              route_no: route.route_no,
              bus_number: route.bus_number,
              stops: parsedStops,
              via: route.via,
              rfid_id: route.rfid_id
            };
          }
        });
        
        setRoutes(routesMap);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load buses. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBusesAndRoutes();
  }, [toast]);
  
  const handleAddBus = () => {
    navigate('/admin/buses/add');
  };

  const handleViewBus = (bus: Bus) => {
    setSelectedBus(bus);
    setSelectedRoute(routes[bus.bus_number] || null);
    setIsDialogOpen(true);
  };

  // Helper function to safely parse stops
  const safeParseStops = (stops: any): { time: string; location: string }[] => {
    if (Array.isArray(stops)) {
      return stops;
    }
    try {
      if (typeof stops === 'string') {
        const parsed = JSON.parse(stops);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (error) {
      console.error('Error parsing stops:', error);
      return [];
    }
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
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => handleViewBus(bus)}
                        >
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

      {/* Bus Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          {selectedBus && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Bus {selectedBus.bus_number} Details</DialogTitle>
                <DialogDescription>
                  Complete information about the bus and its route
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Truck className="mr-2 h-4 w-4 text-primary" />
                    Bus Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Bus Number</span>
                      <span className="font-medium">{selectedBus.bus_number}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">RFID ID</span>
                      <span className="font-medium">{selectedBus.rfid_id}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Capacity</span>
                      <span className="font-medium">{selectedBus.bus_capacity} seats</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Current Status</span>
                      <Badge className={selectedBus.in_campus ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {selectedBus.in_campus ? 'In Campus' : 'Out of Campus'}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="font-semibold mt-6 mb-3 flex items-center">
                    <User className="mr-2 h-4 w-4 text-primary" />
                    Driver Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Driver Name</span>
                      <span className="font-medium">{selectedBus.driver_name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Contact</span>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="font-medium">{selectedBus.driver_phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-primary" />
                    Route Information
                  </h3>
                  
                  {selectedRoute ? (
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Route Number</span>
                        <span className="font-medium">{selectedRoute.route_no}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Start Point</span>
                        <span className="font-medium">{selectedBus.start_point}</span>
                      </div>
                      {selectedRoute.via && (
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Via</span>
                          <span className="font-medium">{selectedRoute.via}</span>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <span className="text-sm text-muted-foreground">Stops</span>
                        <div className="relative mt-2">
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                          <div className="space-y-4">
                            {safeParseStops(selectedRoute.stops).map((stop, idx) => (
                              <div key={idx} className="relative pl-8">
                                <div className="absolute left-2 top-2 w-4 h-4 -translate-x-1/2 bg-primary rounded-full"></div>
                                <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                                  <div className="font-medium">{stop.location}</div>
                                  <div className="text-gray-600 text-sm">
                                    <Clock className="h-3 w-3 inline mr-1" /> {stop.time}
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div className="relative pl-8">
                              <div className="absolute left-2 top-2 w-4 h-4 -translate-x-1/2 bg-green-500 rounded-full"></div>
                              <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                                <div className="font-medium">Campus (Arrival)</div>
                                <div className="text-gray-600 text-sm">
                                  <Clock className="h-3 w-3 inline mr-1" /> 8:30 AM (Approx.)
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-muted-foreground">No route information available for this bus.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Buses;
