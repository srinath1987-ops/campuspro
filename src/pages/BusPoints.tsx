import React, { useState, useEffect } from 'react';
import { MapPin, Search, BusFront, Clock, Route as RouteIcon, Map as MapIcon } from 'lucide-react';
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
import { Timeline } from "@/components/ui/timeline";
import MapboxMap from '@/components/MapboxMap';

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

  try {
    // If it's already an array, return it
    if (Array.isArray(stops)) {
      return stops.map(stop => {
        if (typeof stop === 'object' && stop !== null && 'time' in stop && 'location' in stop) {
          return {
            time: String(stop.time || ''),
            location: String(stop.location || '')
          };
        }
        return { time: '', location: '' };
      }).filter(stop => stop.location || stop.time); // Filter out empty stops
    }

    // If it's a string, try to parse it
    if (typeof stops === 'string') {
      try {
        const parsed = JSON.parse(stops);
        return Array.isArray(parsed) ? parsed.map(stop => ({
          time: String(stop.time || ''),
          location: String(stop.location || '')
        })).filter(stop => stop.location || stop.time) : [];
      } catch {
        // If the string is not valid JSON, return empty array
        return [];
      }
    }

    // If it's an object, try to convert it to array
    if (typeof stops === 'object' && stops !== null) {
      // Handle case where it might be an object with numeric keys
      if (Object.keys(stops).every(key => !isNaN(Number(key)))) {
        return Object.values(stops).map(stop => {
          if (typeof stop === 'object' && stop !== null && 'time' in stop && 'location' in stop) {
            return {
              time: String(stop.time || ''),
              location: String(stop.location || '')
            };
          }
          return { time: '', location: '' };
        }).filter(stop => stop.location || stop.time);
      }

      // Handle case of a single stop object
      if ('time' in stops && 'location' in stops) {
        const time = String(stops.time || '');
        const location = String(stops.location || '');
        if (time || location) {
          return [{ time, location }];
        }
      }
    }

    // console.log("Unknown stops format:", stops);
    return [];
  } catch (error) {
    // console.error('Error parsing stops:', error);
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
        // Load the specific route data provided
        const routesData = [
          {
            "route_no": "01",
            "bus_number": "TN01AB1234",
            "stops": [
              {"time": "6:15am", "location": "Ambattur Estate"},
              {"time": "7:40am", "location": "College"}
            ],
            "via": "Tambaram Bypass Road"
          },
          {
            "route_no": "02",
            "bus_number": "TN02CD5678",
            "stops": [
              {"time": "6:20am", "location": "Ratinakanaru"},
              {"time": "6:21am", "location": "Chengalpettu New BS"},
              {"time": "6:23am", "location": "Chengalpettu Old BS"},
              {"time": "6:35am", "location": "Mahindra City"},
              {"time": "6:40am", "location": "Singaperumal Koil Signal"},
              {"time": "6:43am", "location": "Ford BS"},
              {"time": "6:45am", "location": "Maraimalai Nagar BS"},
              {"time": "6:46am", "location": "HP PB"},
              {"time": "6:48am", "location": "Gurukulam"},
              {"time": "6:49am", "location": "Potheri BS"},
              {"time": "6:50am", "location": "AzZ"},
              {"time": "7:20am", "location": "Mambakkam"},
              {"time": "7:40am", "location": "College"}
            ]
          },
          {
            "route_no": "03",
            "bus_number": "TN03EF9012",
            "stops": [
              {"time": "6:05am", "location": "Peravallur BS"},
              {"time": "6:06am", "location": "Venus (Gandhi Statue)"},
              {"time": "6:10am", "location": "Perambur Rly St."},
              {"time": "6:13am", "location": "Jamalia"},
              {"time": "6:20am", "location": "Ottery"},
              {"time": "7:40am", "location": "College"}
            ]
          },
          {
            "route_no": "04",
            "bus_number": "TN04GH3456",
            "stops": [
              {"time": "6:10am", "location": "Porur (Kumar Sweets)"},
              {"time": "6:12am", "location": "Saravana Stores (Shell PB)"},
              {"time": "7:40am", "location": "College"}
            ]
          },
          {
            "route_no": "4A",
            "bus_number": "TN04AI7890",
            "stops": [
              {"time": "6:15am", "location": "Mugalaivakkam BS"},
              {"time": "6:20am", "location": "Ramapuram BS"},
              {"time": "6:43am", "location": "Sanitorium (GK Hotel)"},
              {"time": "6:50am", "location": "Perungalathur"},
              {"time": "7:40am", "location": "College"}
            ]
          },
          {
            "route_no": "05",
            "bus_number": "TN05JK2345",
            "stops": [
              {"time": "6:20am", "location": "Beach Station"},
              {"time": "6:45am", "location": "MGR Janaki College"},
              {"time": "6:48am", "location": "Adyar Depot (T. Exchange) L.B Road"},
              {"time": "6:52am", "location": "Thiruvanmiyur Post Office OMR"},
              {"time": "7:40am", "location": "College"}
            ]
          },
          {
            "route_no": "06",
            "bus_number": "TN06LM6789",
            "stops": [
              {"time": "6:20am", "location": "Beach Station"},
              {"time": "6:35am", "location": "V. House"},
              {"time": "6:40am", "location": "F. Shore Estate"},
              {"time": "6:41am", "location": "MRC Nagar"},
              {"time": "7:40am", "location": "College"}
            ],
            "via": "Panaiyur ECR"
          },
          {
            "route_no": "07",
            "bus_number": "TN07NO1234",
            "stops": [
              {"time": "6:10am", "location": "Wavin"},
              {"time": "6:12am", "location": "Ambattur Estate"},
              {"time": "7:40am", "location": "College"}
            ],
            "via": "Tambaram Bypass Road"
          },
          {
            "route_no": "08",
            "bus_number": "TN08PQ5678",
            "stops": [
              {"time": "6:10am", "location": "P1 Police Station (Pulianthope)"},
              {"time": "6:15am", "location": "Nataraja Theatre"},
              {"time": "6:18am", "location": "Choolai PO"},
              {"time": "6:23am", "location": "Chindadripet Ramada Hotel"},
              {"time": "6:35am", "location": "Royapettah BS TTK Road"},
              {"time": "6:36am", "location": "Alwarpet (Winners Bakery)"},
              {"time": "6:50am", "location": "Marutherswarar Temple"},
              {"time": "6:51am", "location": "RTO Office"},
              {"time": "6:55am", "location": "Peria Neelankarai (Vasan Eye Care)"},
              {"time": "7:40am", "location": "College"}
            ]
          },
          {
            "route_no": "09",
            "bus_number": "TN09RS9012",
            "stops": [
              {"time": "6:05am", "location": "Korattur (Millennium Aprts.)"},
              {"time": "6:08am", "location": "Korattur Signal"},
              {"time": "6:10am", "location": "TVS BS"},
              {"time": "6:11am", "location": "Annanagar W. Depot"},
              {"time": "6:27am", "location": "Nerkundram"},
              {"time": "6:30am", "location": "Ration Kadai"},
              {"time": "7:40am", "location": "College"}
            ],
            "via": "Tambaram Bypass Road"
          },
          {
            "route_no": "9A",
            "bus_number": "TN09AT3456",
            "stops": [
              {"time": "6:10am", "location": "Golden Flats (Mangaleri) Park"},
              {"time": "6:11am", "location": "Golden Flats BS"},
              {"time": "6:12am", "location": "TSK Nagar"},
              {"time": "6:13am", "location": "Collector Nagar"},
              {"time": "7:40am", "location": "College"}
            ],
            "via": "Tambaram Bypass Road"
          }
        ];

        // console.log('Provided routes data:', routesData);

        // Process routes - ensuring we keep ALL routes even if some fields are null
        const processedRoutes: BusRoute[] = [];

        if (routesData && routesData.length > 0) {
          routesData.forEach((route, index) => {
            // Only skip records where route_no is completely missing
            if (route && route.route_no) {
              processedRoutes.push({
                id: index + 1, // Generate IDs sequentially
                route_no: route.route_no,
                bus_number: route.bus_number || null, // Use bus numbers from the data
                via: route.via || null,
                stops: route.stops || []
              });
            }
          });
        }

        // console.log('Processed routes:', processedRoutes);

        // Always ensure we have some routes to display
        if (processedRoutes.length === 0) {
          console.warn('No routes found in data, using fallback data');
          setRoutes(getFallbackRoutes());
        } else {
          setRoutes(processedRoutes);
        }

        // Create bus entries for each route with a bus number
        const busesMap: Record<string, Bus> = {};
        processedRoutes.forEach(route => {
          if (route.bus_number) {
            busesMap[route.bus_number] = {
              bus_number: route.bus_number,
              driver_name: 'Bus Driver', // Generic driver name
              driver_phone: 'Contact College' // Generic contact
            };
          }
        });

        if (Object.keys(busesMap).length === 0) {
          setBuses(getFallbackBuses());
        } else {
          setBuses(busesMap);
        }
      } catch (error) {
        console.error('Error processing data:', error);
        // Use mock data if processing fails
        setRoutes(getFallbackRoutes());
        setBuses(getFallbackBuses());
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get fallback routes for when the database call fails
  const getFallbackRoutes = (): BusRoute[] => {
    return [
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
    ];
  };

  // Get fallback buses for when the database call fails
  const getFallbackBuses = (): Record<string, Bus> => {
    return {
      "TN06GF2021": { bus_number: "TN06GF2021", driver_name: "John Doe", driver_phone: "555-123-4567" },
      "TN07KL3344": { bus_number: "TN07KL3344", driver_name: "Jane Smith", driver_phone: "555-987-6543" },
      "TN05RZ9988": { bus_number: "TN05RZ9988", driver_name: "Mike Johnson", driver_phone: "555-456-7890" }
    };
  };

  // Filter routes based on search query
  const filteredRoutes = routes.filter(route =>
    route.route_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (route.bus_number && route.bus_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
    route.stops.some(stop => stop.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (route.via && route.via.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // If no routes are available after loading, show fallback data
  useEffect(() => {
    if (!isLoading && routes.length === 0) {
      console.warn('No routes found after loading, using fallback data');
      setRoutes(getFallbackRoutes());
    }
  }, [isLoading, routes.length]);

  // If we have routes but no buses, create empty bus entries to ensure data appears
  useEffect(() => {
    if (!isLoading && routes.length > 0 && Object.keys(buses).length === 0) {
      console.warn('Routes found but no buses, creating placeholder bus entries');
      const placeholderBuses: Record<string, Bus> = {};

      // Create placeholder entries for all bus_numbers in routes
      routes.forEach(route => {
        if (route.bus_number && !placeholderBuses[route.bus_number]) {
          placeholderBuses[route.bus_number] = {
            bus_number: route.bus_number,
            driver_name: 'Not assigned',
            driver_phone: 'Not available'
          };
        }
      });

      if (Object.keys(placeholderBuses).length > 0) {
        setBuses(prev => ({...prev, ...placeholderBuses}));
      } else {
        setBuses(getFallbackBuses());
      }
    }
  }, [isLoading, routes, buses]);

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
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Loading bus routes...</p>
                  </div>
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
                        <TableHead>Starting Point</TableHead>
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
                            {route.bus_number || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {route.stops && route.stops.length > 0 && route.stops[0]?.location
                              ? route.stops[0].location
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {route.via || 'Direct route'}
                          </TableCell>
                          <TableCell>
                            {route.stops && route.stops.length > 0
                              ? `${route.stops.length} stops`
                              : '0 stops'}
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
              All buses arrive at the campus by 7:50 AM and return at 4:00 PM.
            </p>
          </div>
        </div>
      </main>

      {/* Route Details Dialog */}
      <Dialog open={!!selectedRoute} onOpenChange={(open) => !open && setSelectedRoute(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          {selectedRoute && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center text-xl">
                  <RouteIcon className="mr-2 h-5 w-5 text-primary" />
                  Route {selectedRoute.route_no} Details
                </DialogTitle>
                <DialogDescription>
                  {selectedRoute.bus_number ? `Bus ${selectedRoute.bus_number}` : 'No bus assigned'}
                  {selectedRoute.via ? ` via ${selectedRoute.via}` : ''}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center text-foreground">
                    <BusFront className="mr-2 h-4 w-4 text-primary" />
                    Route Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Route Number</span>
                      <span className="font-medium text-foreground">{selectedRoute.route_no}</span>
                    </div>
                    {selectedRoute.bus_number && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Bus Number</span>
                        <span className="font-medium text-foreground">{selectedRoute.bus_number}</span>
                      </div>
                    )}
                    {selectedRoute.via && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Via</span>
                        <span className="font-medium text-foreground">{selectedRoute.via}</span>
                      </div>
                    )}
                    {selectedRoute.stops && selectedRoute.stops.length > 0 && (
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Total Stops</span>
                        <span className="font-medium text-foreground">{selectedRoute.stops.length}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <h3 className="font-semibold mb-3 flex items-center text-foreground">
                      <Clock className="mr-2 h-4 w-4 text-primary" />
                      Schedule Information
                    </h3>
                    <div className="space-y-2">
                      {selectedRoute.stops && selectedRoute.stops.length > 0 &&
                       selectedRoute.stops[0]?.time && selectedRoute.stops[0]?.location && (
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">First Pickup</span>
                          <span className="font-medium text-foreground">
                            {`${selectedRoute.stops[0].time} at ${selectedRoute.stops[0].location}`}
                          </span>
                        </div>
                      )}

                      {selectedRoute.stops && selectedRoute.stops.length > 0 &&
                       selectedRoute.stops[selectedRoute.stops.length - 1]?.time &&
                       selectedRoute.stops[selectedRoute.stops.length - 1]?.location &&
                       selectedRoute.stops[selectedRoute.stops.length - 1]?.location !== "College" && (
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Last Stop Before Campus</span>
                          <span className="font-medium text-foreground">
                            {`${selectedRoute.stops[selectedRoute.stops.length - 1].time} at ${selectedRoute.stops[selectedRoute.stops.length - 1].location}`}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Campus Arrival</span>
                        <span className="font-medium text-foreground">7:50 AM (Approx.)</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Return Time</span>
                        <span className="font-medium text-foreground">4:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center text-foreground">
                    <MapPin className="mr-2 h-4 w-4 text-primary" />
                    Stop Points
                  </h3>

                  <div className="mt-4">
                    {selectedRoute.stops && selectedRoute.stops.length > 0 ? (
                      <Timeline
                        data={[
                          ...selectedRoute.stops.map(stop => ({
                            title: stop.location,
                            subtitle: stop.time,
                            content: null
                          })),
                          {
                            title: "Campus (Arrival)",
                            subtitle: "7:50 AM (Approx.)",
                            content: null
                          }
                        ]}
                      />
                    ) : (
                      <div className="text-muted-foreground pl-8">No stop points available</div>
                    )}
                  </div>

                  {/* Map Section */}
                  <div className="mt-8">
                    <h3 className="font-semibold mb-3 flex items-center text-foreground">
                      <MapIcon className="mr-2 h-4 w-4 text-primary" />
                      Route Map
                    </h3>

                    <div className="mt-4">
                      {selectedRoute.stops && selectedRoute.stops.length > 0 ? (
                        <MapboxMap
                          stops={[
                            ...selectedRoute.stops,
                            { location: "Campus (Arrival)", time: "7:50 AM (Approx.)" }
                          ]}
                          routeNumber={selectedRoute.route_no}
                        />
                      ) : (
                        <div className="text-muted-foreground pl-8">No map data available</div>
                      )}
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
