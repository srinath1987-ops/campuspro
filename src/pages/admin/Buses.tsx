
import React, { useState, useEffect } from 'react';
import { BusFront, Search, Plus, Users, Clock, MapPin, Route, Info, Pencil, X, Save } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define the Bus type
type Bus = {
  rfid_id: string;
  bus_number: string;
  driver_name: string;
  driver_phone: string;
  bus_capacity: number;
  start_point: string;
  in_campus: boolean;
  in_time: string | null;
  out_time: string | null;
  last_updated: string;
};

// Define a type for the routes/stops
type BusRoute = {
  route_no: string;
  stops: { time: string; location: string }[];
  via: string | null;
};

const Buses = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [busRoutes, setBusRoutes] = useState<Record<string, BusRoute>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBus, setExpandedBus] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch buses data
  useEffect(() => {
    const fetchBusData = async () => {
      setIsLoading(true);
      try {
        const { data: busesData, error: busesError } = await supabase
          .from('bus_details')
          .select('*');

        if (busesError) throw busesError;

        const { data: routesData, error: routesError } = await supabase
          .from('bus_routes')
          .select('*');

        if (routesError) throw routesError;

        // Process the data
        setBuses(busesData || []);
        
        // Create a map of bus_number to route info
        const routesMap: Record<string, BusRoute> = {};
        routesData?.forEach(route => {
          if (route.bus_number) {
            routesMap[route.bus_number] = {
              route_no: route.route_no,
              stops: route.stops as { time: string; location: string }[],
              via: route.via
            };
          }
        });
        
        setBusRoutes(routesMap);
      } catch (error) {
        console.error('Error fetching bus data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load bus data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusData();
  }, [toast]);

  // Filter buses based on search query
  const filteredBuses = buses.filter(bus => 
    bus.bus_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bus.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bus.start_point.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format time for display
  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'N/A';
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Toggle expanded bus row
  const toggleExpand = (busNumber: string) => {
    setExpandedBus(expandedBus === busNumber ? null : busNumber);
  };

  // Handle form submission for adding a new bus
  const handleAddBus = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Extract values
    const newBus = {
      rfid_id: formData.get('rfid_id') as string,
      bus_number: formData.get('bus_number') as string,
      driver_name: formData.get('driver_name') as string,
      driver_phone: formData.get('driver_phone') as string,
      bus_capacity: parseInt(formData.get('bus_capacity') as string, 10),
      start_point: formData.get('start_point') as string,
      in_campus: false
    };
    
    // Validate form
    if (!newBus.rfid_id || !newBus.bus_number || !newBus.driver_name || !newBus.driver_phone || 
        !newBus.bus_capacity || !newBus.start_point) {
      toast({
        title: 'Validation Error',
        description: 'All fields are required.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('bus_details')
        .insert([newBus])
        .select();
        
      if (error) throw error;
      
      // Add the new bus to the state
      if (data && data.length > 0) {
        setBuses([...buses, data[0]]);
        
        toast({
          title: 'Success',
          description: `Bus ${newBus.bus_number} has been added.`,
        });
        
        setIsAddDialogOpen(false);
      }
    } catch (error: any) {
      console.error('Error adding bus:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add bus. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout title="Bus Management" role="admin" currentPath="/admin/buses">
      <div className="container mx-auto py-6">
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Buses</CardTitle>
              <CardDescription>
                Manage all campus buses and their details
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bus-gradient-bg">
                  <Plus className="h-4 w-4 mr-2" /> Add New Bus
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Bus</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new bus. All fields are required.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddBus}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="rfid_id">RFID ID</Label>
                      <Input id="rfid_id" name="rfid_id" placeholder="e.g., 126A7C00" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bus_number">Bus Number</Label>
                      <Input id="bus_number" name="bus_number" placeholder="e.g., TN06GF2021" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driver_name">Driver Name</Label>
                      <Input id="driver_name" name="driver_name" placeholder="e.g., John Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driver_phone">Driver Phone</Label>
                      <Input id="driver_phone" name="driver_phone" placeholder="e.g., 555-123-4567" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bus_capacity">Bus Capacity</Label>
                      <Input 
                        id="bus_capacity" 
                        name="bus_capacity" 
                        type="number" 
                        min="1" 
                        placeholder="e.g., 52" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start_point">Start Point</Label>
                      <Input id="start_point" name="start_point" placeholder="e.g., Nesapakkam" required />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Bus</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-6">
              <Search className="h-5 w-5 text-muted-foreground mr-2" />
              <Input
                placeholder="Search by bus number, driver name, or location..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredBuses.length === 0 ? (
              <div className="text-center py-12">
                <BusFront className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No buses found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try a different search term' : 'There are no buses registered yet'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bus Number</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBuses.map((bus) => (
                      <React.Fragment key={bus.rfid_id}>
                        <TableRow>
                          <TableCell className="font-medium">{bus.bus_number}</TableCell>
                          <TableCell>{bus.driver_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>{bus.bus_capacity}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {bus.in_campus ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <span className="h-2 w-2 rounded-full bg-green-500 mr-1 inline-block"></span>
                                Inside Campus
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                <span className="h-2 w-2 rounded-full bg-orange-500 mr-1 inline-block"></span>
                                Outside Campus
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpand(bus.bus_number)}
                            >
                              {expandedBus === bus.bus_number ? "Hide Details" : "View Details"}
                            </Button>
                          </TableCell>
                        </TableRow>
                        {expandedBus === bus.bus_number && (
                          <TableRow>
                            <TableCell colSpan={5} className="p-0">
                              <div className="bg-muted/50 p-4 rounded-lg m-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-semibold mb-2 flex items-center">
                                      <Info className="h-4 w-4 mr-2" /> 
                                      Bus Information
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="flex items-start">
                                        <span className="font-medium w-32">RFID ID:</span>
                                        <span>{bus.rfid_id}</span>
                                      </div>
                                      <div className="flex items-start">
                                        <span className="font-medium w-32">Driver Phone:</span>
                                        <span>{bus.driver_phone}</span>
                                      </div>
                                      <div className="flex items-start">
                                        <span className="font-medium w-32">Start Point:</span>
                                        <span>{bus.start_point}</span>
                                      </div>
                                      <div className="flex items-start">
                                        <span className="font-medium w-32">Last Updated:</span>
                                        <span>{new Date(bus.last_updated).toLocaleString()}</span>
                                      </div>
                                      {bus.in_campus && bus.in_time && (
                                        <div className="flex items-start">
                                          <span className="font-medium w-32">Entry Time:</span>
                                          <span>{formatTime(bus.in_time)}</span>
                                        </div>
                                      )}
                                      {!bus.in_campus && bus.out_time && (
                                        <div className="flex items-start">
                                          <span className="font-medium w-32">Exit Time:</span>
                                          <span>{formatTime(bus.out_time)}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold mb-2 flex items-center">
                                      <Route className="h-4 w-4 mr-2" /> 
                                      Route Information
                                    </h4>
                                    {busRoutes[bus.bus_number] ? (
                                      <div className="space-y-2">
                                        <div className="flex items-start">
                                          <span className="font-medium w-32">Route Number:</span>
                                          <span>{busRoutes[bus.bus_number].route_no}</span>
                                        </div>
                                        {busRoutes[bus.bus_number].via && (
                                          <div className="flex items-start">
                                            <span className="font-medium w-32">Via:</span>
                                            <span>{busRoutes[bus.bus_number].via}</span>
                                          </div>
                                        )}
                                        <div className="mt-3">
                                          <span className="font-medium">Stops:</span>
                                          <div className="relative mt-3">
                                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                            <div className="space-y-4">
                                              {busRoutes[bus.bus_number].stops.map((stop, idx) => (
                                                <div key={idx} className="relative pl-8">
                                                  <div className="absolute left-2 top-2 w-4 h-4 -translate-x-1/2 bg-primary rounded-full"></div>
                                                  <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                                                    <div className="font-medium">{stop.location}</div>
                                                    <div className="text-gray-600 text-sm">{stop.time}</div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-muted-foreground">No route information available</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex justify-end mt-4">
                                  <Button variant="outline" size="sm" className="mr-2">
                                    <Pencil className="h-4 w-4 mr-1" /> Edit
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Buses;
