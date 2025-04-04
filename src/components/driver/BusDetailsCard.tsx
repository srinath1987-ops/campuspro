
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BusFront, Info } from 'lucide-react';

type BusDetailsCardProps = {
  busDetails: any | null;
  routeDetails: any | null;
};

const BusDetailsCard = ({ busDetails, routeDetails }: BusDetailsCardProps) => {
  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <BusFront />
          Bus Details
        </CardTitle>
        <CardDescription className="text-blue-100">
          Information about your assigned bus
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {busDetails ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Bus Number</h3>
                <p className="text-lg font-bold">{busDetails.bus_number}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Route Number</h3>
                <p className="text-lg font-bold">{routeDetails?.route_no || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Start Point</h3>
                <p className="text-lg font-bold">{busDetails.start_point}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Via</h3>
                <p className="text-lg font-bold">{routeDetails?.via || "N/A"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Driver Name</h3>
                <p className="text-lg font-bold">{busDetails.driver_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                <p className="text-lg font-bold">{busDetails.driver_phone}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Bus Capacity</h3>
                <p className="text-lg font-bold">{busDetails.bus_capacity} seats</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Current Status</h3>
                <div className="flex items-center gap-2">
                  {busDetails.in_campus ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-green-600 font-bold">Inside Campus</span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                      <span className="text-orange-600 font-bold">Outside Campus</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <BusFront className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bus assigned</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have a bus assigned to your account yet.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BusDetailsCard;
