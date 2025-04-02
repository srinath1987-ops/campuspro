
import React from 'react';
import Navbar from '@/components/Navbar';
import { ChevronDown, ChevronUp, Clock, MapPin } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Route data
const routesData = {
  "routes": [
    {
      "route_no": "01",
      "stops": [
        {"time": "6:15am", "location": "Ambattur Estate"},
        {"time": "7:40am", "location": "College"}
      ],
      "via": "Tambaram Bypass Road"
    },
    {
      "route_no": "02",
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
      "stops": [
        {"time": "6:10am", "location": "Porur (Kumar Sweets)"},
        {"time": "6:12am", "location": "Saravana Stores (Shell PB)"},
        {"time": "7:40am", "location": "College"}
      ]
    },
    {
      "route_no": "4A",
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
      "stops": [
        {"time": "6:10am", "location": "Wavin"},
        {"time": "6:12am", "location": "Ambattur Estate"},
        {"time": "7:40am", "location": "College"}
      ],
      "via": "Tambaram Bypass Road"
    },
    {
      "route_no": "08",
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
      "stops": [
        {"time": "6:10am", "location": "Golden Flats (Mangaleri) Park"},
        {"time": "6:11am", "location": "Golden Flats BS"},
        {"time": "6:12am", "location": "TSK Nagar"},
        {"time": "6:13am", "location": "Collector Nagar"},
        {"time": "7:40am", "location": "College"}
      ],
      "via": "Tambaram Bypass Road"
    }
  ]
};

// Bus data placeholder - this would be fetched from the database in a real app
const busData = {
  "buses": [
    {
      "rfid_id": "126A7C00",
      "bus_number": "TN06GF2021",
      "bus_driver": "ganesh",
      "bus_capacity": 52,
      "bus_start_time": "6:20AM",
      "bus_start_point": "Nesapakkam (Golden Jublie Block)",
      "bus_end_time": "7:40AM",
      "bus_end_point": "college",
      "bus_between_points": [
        { "time": "6:40AM", "stop": "Block" },
        { "time": "6:43AM", "stop": "Velachery 100' Road Erikarai Signal" },
        { "time": "6:44AM", "stop": "Opp.Murugan KM" },
        { "time": "6:56AM", "stop": "Metro Water Kaivell" },
        { "time": "6:57AM", "stop": "Pallikaranai Lake" },
        { "time": "6:58AM", "stop": "Oil Mill" },
        { "time": "6:58AM", "stop": "Asan College" }
      ]
    },
    {
      "rfid_id": "EF6CD61E",
      "bus_number": "TN45UI3645",
      "bus_driver": "ram",
      "bus_capacity": 45,
      "bus_start_time": "6:40AM",
      "bus_start_point": "Aavin (opp Molar H)",
      "bus_end_time": "7:40AM",
      "bus_end_point": "college",
      "bus_between_points": [
        { "time": "6:41AM", "stop": "Avval Home" },
        { "time": "6:42AM", "stop": "Rajaji Bhavan" },
        { "time": "6:45AM", "stop": "Besant Nagar Depot" },
        { "time": "6:47AM", "stop": "Vannandura" },
        { "time": "7:04AM", "stop": "Thiruvanmiyur TMB Bank" },
        { "time": "7:06AM", "stop": "Palavakkam (Antony Church)" },
        { "time": "7:10AM", "stop": "Vettuvankani (Church)" },
        { "time": "7:12AM", "stop": "Sholinganallur Jn" },
        { "time": "7:14AM", "stop": "Akkaral" },
        { "time": "7:20AM", "stop": "Uthandi (Toll Gate) Kovalam Toll ECR" }
      ]
    }
  ]
};

// Route Item component for displaying each route
const RouteItem = ({ route }: { route: any }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen}
      className="border rounded-lg mb-4 overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 bg-white">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-lg font-bold px-3 py-1 border-2 border-primary/20 bg-primary/5">
            {route.route_no}
          </Badge>
          <div>
            <p className="font-medium">{route.stops[0].location} → {route.stops[route.stops.length - 1].location}</p>
            {route.via && (
              <p className="text-sm text-muted-foreground">via {route.via}</p>
            )}
          </div>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent>
        <div className="p-4 pt-0 bg-gray-50">
          <div className="relative mt-2 ml-2 pl-6 border-l-2 border-dashed border-primary/30">
            {route.stops.map((stop: any, index: number) => (
              <div key={index} className="mb-4 relative">
                <div className="absolute -left-[27px] bg-white p-1 rounded-full border-2 border-primary/30">
                  {index === 0 ? (
                    <MapPin className="h-4 w-4 text-primary" />
                  ) : index === route.stops.length - 1 ? (
                    <MapPin className="h-4 w-4 text-primary" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-primary/60"></div>
                  )}
                </div>
                <div className="flex items-start">
                  <div className="bg-white rounded-md p-2 shadow-sm">
                    <p className="font-medium">{stop.location}</p>
                    <p className="text-sm flex items-center text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {stop.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

const BusPoints = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Bus Routes & Stops</h1>
            <p className="text-muted-foreground">
              Find your bus route, stops, and timings for campus transportation.
            </p>
          </div>
          
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-primary">Route Information</h2>
            <p className="text-sm text-gray-600">
              All buses arrive at the college by 7:40 AM. The routes are designed to provide maximum coverage across the city.
              Tap on a route to see detailed stop information.
            </p>
          </div>
          
          <div className="space-y-4">
            {routesData.routes.map((route, index) => (
              <RouteItem key={index} route={route} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusPoints;
