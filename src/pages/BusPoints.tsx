
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Clock, BusFront } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface BusRoute {
  id: number;
  route_no: string;
  bus_number: string;
  stops: {
    name: string;
    time: string;
  }[];
  via: string;
  rfid_id: string;
}

const BusPoints = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  const { data: busRoutes, isLoading, error } = useQuery({
    queryKey: ['busRoutes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bus_routes')
        .select('*');
        
      if (error) {
        console.error('Error fetching bus routes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load bus routes data',
          variant: 'destructive',
        });
        throw error;
      }
      
      return data as BusRoute[];
    },
  });
  
  const filteredRoutes = busRoutes?.filter(route => 
    route.route_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.bus_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.via?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bus-hero-pattern py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bus-gradient-text">
              Bus Routes & Stops
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Find detailed information about all campus bus routes and stops
            </p>
          </div>
        </div>
      </section>
      
      {/* Search Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by route number, bus number, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-0 h-full"
                onClick={() => setSearchTerm("")}
                disabled={!searchTerm}
              >
                {searchTerm ? "×" : ""}
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Bus Routes Table */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 text-lg">Failed to load bus routes data. Please try again later.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : filteredRoutes && filteredRoutes.length > 0 ? (
            <div className="overflow-x-auto rounded-lg shadow">
              <Table>
                <TableCaption>
                  {searchTerm ? `Showing ${filteredRoutes.length} routes matching "${searchTerm}"` : 'All campus bus routes and stops'}
                </TableCaption>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[100px]">Route No.</TableHead>
                    <TableHead className="w-[150px]">Bus Number</TableHead>
                    <TableHead>Stops & Timings</TableHead>
                    <TableHead className="w-[200px]">Via</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoutes.map((route) => (
                    <TableRow key={route.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <BusFront className="h-4 w-4 mr-2 text-primary" />
                          {route.route_no}
                        </div>
                      </TableCell>
                      <TableCell>{route.bus_number || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center flex-wrap gap-2">
                          {route.stops && route.stops.map((stop, index) => (
                            <div key={index} className="flex items-center bg-muted/50 rounded-full px-3 py-1 text-sm">
                              <MapPin className="h-3 w-3 mr-1 text-primary" />
                              <span>{stop.name}</span>
                              <span className="mx-1">-</span>
                              <Clock className="h-3 w-3 mr-1 text-primary" />
                              <span>{stop.time}</span>
                              {index < route.stops.length - 1 && (
                                <span className="mx-2 text-gray-400">→</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{route.via || 'Direct Route'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-16">
              {searchTerm ? (
                <p className="text-gray-500">No routes found matching "{searchTerm}".</p>
              ) : (
                <p className="text-gray-500">No bus routes data available.</p>
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* Info Section */}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Important Information</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold mb-3 bus-gradient-text">Bus Schedule Notes</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 text-primary">•</div>
                    <span>All times are approximate and subject to traffic conditions.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 text-primary">•</div>
                    <span>Buses operate Monday through Saturday, except on holidays.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 text-primary">•</div>
                    <span>Be at the stop at least 5 minutes before scheduled time.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 text-primary">•</div>
                    <span>Special schedules may apply during exam periods and events.</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold mb-3 bus-gradient-text">Contact Information</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 text-primary">•</div>
                    <span>For schedule questions: transport@snuc.edu.in</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 text-primary">•</div>
                    <span>Transport office: +91 99999 88888</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 text-primary">•</div>
                    <span>Emergency contact: +91 99999 77777</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 text-primary">•</div>
                    <span>Lost & found items: transport_lf@snuc.edu.in</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default BusPoints;
