import React, { useState, useEffect } from 'react';
import { MapPin, Search, BusFront, Clock, Route as RouteIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

// Define the BusRoute type
type BusRoute = {
  id: number;
  route_no: string;
  bus_number: string | null;
  stops: { time: string; location: string }[];
  via: string | null;
};

type Bus = {
  bus_number: string;
  driver_name: string;
  driver_phone: string;
};

// Helper function to safely parse JSON data
const safeParseStops = (stops: Json): { time: string; location: string }[] => {
  if (!stops) return [];
  
  // If it's already an array, return it
  if (Array.isArray(stops)) {
    return stops as { time: string; location: string }[];
  }
  
  try {
    // If it's a string, try to parse it
    if (typeof stops === 'string') {
      const parsed = JSON.parse(stops);
      return Array.isArray(parsed) ? parsed : [];
    }
    
    // If it's an object, try to convert it
    if (typeof stops === 'object') {
      return Object.values(stops);
    }
    
    return [];
  } catch (error) {
    console.error('Error parsing stops:', error);
    return [];
  }
};

const BusPoints = () => {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [buses, setBuses] = useState<Record<string, Bus>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch routes
        const { data: routesData, error: routesError } = await supabase
          .from('bus_routes')
          .select('*');

        if (routesError) throw routesError;

        // Fetch buses
        const { data: busesData, error: busesError } = await supabase
          .from('bus_details')
          .select('bus_number, driver_name, driver_phone');

        if (busesError) throw busesError;

        // Process the data
        const processedRoutes: BusRoute[] = (routesData || []).map(route => {
          console.log('Processing route:', route);
          const parsedStops = safeParseStops(route.stops);
          console.log('Parsed stops:', parsedStops);
          
          return {
            id: route.id,
            route_no: route.route_no,
            bus_number: route.bus_number,
            via: route.via,
            stops: parsedStops
          };
        });
        
        console.log('Processed routes:', processedRoutes);
        setRoutes(processedRoutes);
        
        // Create a map of bus_number to bus details
        const busesMap: Record<string, Bus> = {};
        busesData?.forEach(bus => {
          busesMap[bus.bus_number] = bus;
        });
        
        setBuses(busesMap);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use mock data if fetch fails
        setRoutes([
          {
            id: 1,
            route_no: "01",
            bus_number: "TN06GF2021",
            stops: [
              { time: "6:15 AM", location: "Ambattur Estate" },
              { time: "6:30 AM", location: "Padi" },
              { time: "6:45 AM", location: "Anna Nagar" },
              { time: "7:00 AM", location: "Koyambedu" },
              { time: "7:15 AM", location: "Vadapalani" },
              { time: "7:30 AM", location: "Nesapakkam" }
            ],
            via: "Tambaram Bypass Road"
          },
          {
            id: 2,
            route_no: "02",
            bus_number: "TN07KL3344",
            stops: [
              { time: "6:00 AM", location: "Tambaram" },
              { time: "6:20 AM", location: "Pallavaram" },
              { time: "6:40 AM", location: "St. Thomas Mount" },
              { time: "7:00 AM", location: "Guindy" },
              { time: "7:20 AM", location: "Saidapet" },
              { time: "7:40 AM", location: "T. Nagar" }
            ],
            via: "GST Road"
          },
          {
            id: 3,
            route_no: "03",
            bus_number: "TN05RZ9988",
            stops: [
              { time: "6:30 AM", location: "Porur" },
              { time: "6:45 AM", location: "Valasaravakkam" },
              { time: "7:00 AM", location: "Virugambakkam" },
              { time: "7:15 AM", location: "Saligramam" },
              { time: "7:30 AM", location: "Vadapalani" }
            ],
            via: "Mount-Poonamallee Road"
          }
        ]);

        setBuses({
          "TN06GF2021": { bus_number: "TN06GF2021", driver_name: "John Doe", driver_phone: "555-123-4567" },
          "TN07KL3344": { bus_number: "TN07KL3344", driver_name: "Jane Smith", driver_phone: "555-987-6543" },
          "TN05RZ9988": { bus_number: "TN05RZ9988", driver_name: "Mike Johnson", driver_phone: "555-456-7890" }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter routes based on search query
  const filteredRoutes = routes.filter(route => 
    route.route_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (route.bus_number && route.bus_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
    route.stops.some(stop => stop.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (route.via && route.via.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openRouteDetails = (route: BusRoute) => {
    setSelectedRoute(route);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 bus-pattern-light py-16 bg-background dark:bg-background">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-3 text-foreground">Bus Routes & Stop Points</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Find all campus bus routes, timings, and stop locations to plan your commute efficiently.
            </p>
          </div>
          
          <Card className="max-w-5xl mx-auto shadow-lg mb-10 border border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <MapPin className="mr-2 h-5 w-5 text-primary" />
                Route Information
              </CardTitle>
              <CardDescription>
                View detailed information about all campus bus routes and their stop points.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-6">
                <Search className="h-5 w-5 text-muted-foreground mr-2" />
                <Input
                  placeholder="Search by route number, bus number, location, or via..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-background"
                />
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredRoutes.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground">No routes found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? 'Try a different search term' : 'There are no routes available'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Route No.</TableHead>
                        <TableHead>Bus Number</TableHead>
                        <TableHead>Start Point</TableHead>
                        <TableHead>Via</TableHead>
                        <TableHead>Stops</TableHead>
                        <TableHead className="text-right">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoutes.map((route) => (
                        <TableRow key={route.id}>
                          <TableCell>
                            <Badge variant="outline" className="font-bold">
                              {route.route_no}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {route.bus_number || 'Not assigned'}
                          </TableCell>
                          <TableCell>
                            {route.stops && route.stops.length > 0 ? route.stops[0].location : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {route.via || 'Direct route'}
                          </TableCell>
                          <TableCell>
                            {route.stops ? `${route.stops.length} stops` : '0 stops'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openRouteDetails(route)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              All buses arrive at the campus by 8:30 AM and depart at 5:00 PM.
            </p>
          </div>
        </div>
      </main>

      {/* Route Details Dialog */}
      <Dialog open={!!selectedRoute} onOpenChange={(open) => !open && setSelectedRoute(null)}>
        <DialogContent className="sm:max-w-3xl">
          {selectedRoute && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center text-xl">
                  <RouteIcon className="mr-2 h-5 w-5 text-primary" />
                  Route {selectedRoute.route_no} Details
                </DialogTitle>
                <DialogDescription>
                  {selectedRoute.bus_number ? `Bus ${selectedRoute.bus_number}` : 'No bus assigned yet'} 
                  {selectedRoute.via ? ` via ${selectedRoute.via}` : ''}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center text-foreground">
                    <BusFront className="mr-2 h-4 w-4 text-primary" />
                    Bus Information
                  </h3>
                  {selectedRoute.bus_number && buses[selectedRoute.bus_number] ? (
                    <div className="space-y-2">
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Bus Number</span>
                        <span className="font-medium text-foreground">{selectedRoute.bus_number}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Driver</span>
                        <span className="font-medium text-foreground">{buses[selectedRoute.bus_number].driver_name}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Contact</span>
                        <span className="font-medium text-foreground">{buses[selectedRoute.bus_number].driver_phone}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No bus assigned to this route yet.</p>
                  )}

                  <div className="mt-6">
                    <h3 className="font-semibold mb-3 flex items-center text-foreground">
                      <Clock className="mr-2 h-4 w-4 text-primary" />
                      Schedule Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">First Pickup</span>
                        <span className="font-medium text-foreground">
                          {selectedRoute.stops && selectedRoute.stops.length > 0 ? selectedRoute.stops[0].time : 'N/A'} at {selectedRoute.stops && selectedRoute.stops.length > 0 ? selectedRoute.stops[0].location : 'N/A'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Last Stop</span>
                        <span className="font-medium text-foreground">
                          {selectedRoute.stops && selectedRoute.stops.length > 0 ? selectedRoute.stops[selectedRoute.stops.length - 1].time : 'N/A'} at {selectedRoute.stops && selectedRoute.stops.length > 0 ? selectedRoute.stops[selectedRoute.stops.length - 1].location : 'N/A'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Campus Arrival</span>
                        <span className="font-medium text-foreground">8:30 AM (Approx.)</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Campus Departure</span>
                        <span className="font-medium text-foreground">5:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center text-foreground">
                    <MapPin className="mr-2 h-4 w-4 text-primary" />
                    Stop Points
                  </h3>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                    <div className="space-y-4">
                      {selectedRoute.stops && selectedRoute.stops.length > 0 ? (
                        selectedRoute.stops.map((stop, idx) => (
                          <div key={idx} className="relative pl-8">
                            <div className="absolute left-2 top-2 w-4 h-4 -translate-x-1/2 bg-primary rounded-full"></div>
                            <div className="bg-card dark:bg-card p-2 rounded-lg border border-border shadow-sm">
                              <div className="font-medium text-foreground">{stop.location}</div>
                              <div className="text-muted-foreground text-sm">{stop.time}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-muted-foreground pl-8">No stop points available</div>
                      )}
                      <div className="relative pl-8">
                        <div className="absolute left-2 top-2 w-4 h-4 -translate-x-1/2 bg-green-500 rounded-full"></div>
                        <div className="bg-card dark:bg-card p-2 rounded-lg border border-border shadow-sm">
                          <div className="font-medium text-foreground">Campus (Arrival)</div>
                          <div className="text-muted-foreground text-sm">8:30 AM (Approx.)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default BusPoints;
