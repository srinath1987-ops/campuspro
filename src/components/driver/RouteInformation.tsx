
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Info } from 'lucide-react';

type RouteInformationProps = {
  routeDetails: any | null;
};

const RouteInformation = ({ routeDetails }: RouteInformationProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info />
          Route Information
        </CardTitle>
        <CardDescription>
          Bus stops and schedule for your route
        </CardDescription>
      </CardHeader>
      <CardContent>
        {routeDetails && routeDetails.stops && routeDetails.stops.length > 0 ? (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <ul className="space-y-4">
              {routeDetails.stops.map((stop: any, index: number) => (
                <li key={index} className="relative pl-8">
                  <div className="absolute left-2 top-2 w-4 h-4 -translate-x-1/2 bg-primary rounded-full"></div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <div className="font-bold">{stop.location}</div>
                    <div className="text-gray-600 text-sm">{stop.time}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Info className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No route information</h3>
              <p className="mt-1 text-sm text-gray-500">
                Route information is not available for your bus.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteInformation;
