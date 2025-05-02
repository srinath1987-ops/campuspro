'use client';
import React, { useEffect, useRef, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@/mapbox.css';
import { MapPin } from 'lucide-react';
import mapboxgl from 'mapbox-gl';

// Helper function to find the best matching location
function findBestLocationMatch(location: string, locationDatabase: Record<string, [number, number]>): [number, number] | null {
  // Try exact match first
  if (locationDatabase[location]) {
    return locationDatabase[location];
  }

  // Try to find the location name in our database keys
  const keys = Object.keys(locationDatabase);

  // First try: location contains key or key contains location
  for (const key of keys) {
    if (location.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(location.toLowerCase())) {
      return locationDatabase[key];
    }
  }

  // Second try: Check for common words (e.g., "Road", "Street", "Avenue")
  const locationWords = location.toLowerCase().split(/\s+/);
  for (const key of keys) {
    const keyWords = key.toLowerCase().split(/\s+/);
    const commonWords = locationWords.filter(word =>
      keyWords.includes(word) && word.length > 2 // Only consider words longer than 2 chars
    );

    if (commonWords.length > 0) {
      return locationDatabase[key];
    }
  }

  // No match found
  return null;
}

// Define the stop point type
type StopPoint = {
  location: string;
  time: string;
  coordinates?: [number, number]; // [longitude, latitude]
};

// Chennai coordinates as fallback
const CHENNAI_COORDINATES = [80.2707, 13.0827];

// Common locations in Chennai with coordinates for better visualization
const LOCATION_COORDINATES: Record<string, [number, number]> = {
  // Main areas
  "Chennai": [80.2707, 13.0827],
  "Tambaram": [80.1170, 12.9249],
  "Ambattur": [80.1548, 13.1143],
  "Porur": [80.1557, 13.0374],
  "Anna Nagar": [80.2092, 13.0850],
  "Adyar": [80.2548, 13.0012],
  "T. Nagar": [80.2341, 13.0418],
  "Velachery": [80.2209, 12.9815],
  "Guindy": [80.2132, 13.0067],
  "Pallavaram": [80.1492, 12.9675],
  "Chromepet": [80.1443, 12.9516],
  "Perambur": [80.2399, 13.1073],
  "Vadapalani": [80.2123, 13.0520],
  "Koyambedu": [80.1943, 13.0694],
  "Saidapet": [80.2219, 13.0227],
  "Chengalpattu": [79.9777, 12.6819],
  "Maraimalai Nagar": [80.0034, 12.7924],
  "Singaperumal Koil": [80.0018, 12.7599],
  "Potheri": [80.0438, 12.8231],
  "Guduvanchery": [80.0565, 12.8457],
  "Urapakkam": [80.0701, 12.8684],
  "Vandalur": [80.0808, 12.8912],
  "Perungalathur": [80.0977, 12.9140],
  "Padi": [80.1986, 13.1073],
  "Mogappair": [80.1834, 13.0897],
  "Avadi": [80.0970, 13.1151],
  "Thiruvanmiyur": [80.2590, 12.9830],
  "Besant Nagar": [80.2707, 12.9968],
  "Nungambakkam": [80.2424, 13.0569],
  "Egmore": [80.2617, 13.0732],
  "Royapettah": [80.2617, 13.0498],
  "Mylapore": [80.2707, 13.0368],
  "Alwarpet": [80.2548, 13.0368],
  "Chetpet": [80.2424, 13.0732],
  "Kilpauk": [80.2424, 13.0897],
  "Purasawalkam": [80.2548, 13.0897],
  "Choolaimedu": [80.2209, 13.0732],
  "Kodambakkam": [80.2209, 13.0498],
  "Saligramam": [80.2002, 13.0498],
  "Virugambakkam": [80.1943, 13.0498],
  "Valasaravakkam": [80.1834, 13.0498],
  "Ramapuram": [80.1725, 13.0227],
  "Mugalivakkam": [80.1725, 13.0067],
  "Madipakkam": [80.1943, 12.9675],
  "Korattur": [80.1834, 13.1151],
  "Kolathur": [80.2209, 13.1151],
  "Villivakkam": [80.2092, 13.1073],
  "Maduravoyal": [80.1725, 13.0569],
  "Nerkundram": [80.1834, 13.0569],
  "Nesapakkam": [80.1834, 13.0227],
  "Nandanam": [80.2341, 13.0227],
  "Kotturpuram": [80.2424, 13.0067],
  "Taramani": [80.2424, 12.9815],
  "Sholinganallur": [80.2274, 12.9010],
  "Siruseri": [80.2274, 12.8684],
  "Navalur": [80.2274, 12.8457],
  "Kelambakkam": [80.2274, 12.7924],
  "Kovalam": [80.2707, 12.7924],
  "Chemmanchery": [80.2548, 12.8684],
  "Thoraipakkam": [80.2341, 12.9249],
  "Pallikaranai": [80.2132, 12.9249],
  "Medavakkam": [80.1943, 12.9249],
  "Nanganallur": [80.1943, 12.9675],
  "Chrompet": [80.1443, 12.9516],
  "Pammal": [80.1170, 12.9675],
  "Anakaputhur": [80.1170, 12.9516],
  "Mangadu": [80.1170, 13.0227],
  "Poonamallee": [80.1170, 13.0374],
  "Thirumazhisai": [80.0808, 13.0374],
  "Thiruverkadu": [80.1170, 13.0569],
  "Thirumullaivoyal": [80.1170, 13.0897],
  "Ambattur Estate": [80.1548, 13.1073],
  "Pattabiram": [80.0808, 13.1151],
  "Ayanambakkam": [80.1548, 13.0897],
  "Thirumangalam": [80.1943, 13.0897],
  "Kattupakkam": [80.1443, 13.0374],
  "Iyyappanthangal": [80.1443, 13.0227],
  "Gerugambakkam": [80.1170, 13.0067],
  "Cowl Bazaar": [80.2707, 13.0732],
  "Chintadripet": [80.2707, 13.0732],
  "Chepauk": [80.2824, 13.0732],
  "Marina Beach": [80.2824, 13.0569],
  "Fort St. George": [80.2824, 13.0897],
  "Beach Station": [80.2941, 13.0897],
  "Central Station": [80.2707, 13.0897],
  "Perungudi": [80.2341, 12.9516],
  "Madipakkam": [80.2002, 12.9516],
  "Ullagaram": [80.2002, 12.9675],
  "Puzhuthivakkam": [80.2002, 12.9815],
  "Adambakkam": [80.2002, 12.9968],
  "Alandur": [80.2002, 13.0067],
  "St. Thomas Mount": [80.2002, 12.9968],
  "Palavanthangal": [80.1834, 12.9968],
  "Meenambakkam": [80.1725, 12.9968],
  "Tirusulam": [80.1725, 12.9815],
  "Sanatorium": [80.1725, 12.9675],
  "Chromepet": [80.1443, 12.9516],
  "Pallavaram": [80.1443, 12.9675],
  "Cantonment": [80.1443, 12.9815],
  "Mambakkam": [80.1725, 12.8684],
  "Ottiyambakkam": [80.1725, 12.8457],
  "Padappai": [80.0565, 12.9249],
  "Mahindra City": [80.0018, 12.7599],
  "Chengalpettu New BS": [79.9777, 12.6819],
  "Chengalpettu Old BS": [79.9777, 12.6819],
  "Singaperumal Koil Signal": [80.0018, 12.7599],
  "Ford BS": [80.0018, 12.7599],
  "Maraimalai Nagar BS": [80.0034, 12.7924],
  "HP PB": [80.0034, 12.7924],
  "Gurukulam": [80.0438, 12.8231],
  "Potheri BS": [80.0438, 12.8231],
  "AzZ": [80.0438, 12.8231],
  "Peravallur BS": [80.2399, 13.1073],
  "Venus (Gandhi Statue)": [80.2399, 13.1073],
  "Perambur Rly St.": [80.2399, 13.1073],
  "Jamalia": [80.2399, 13.1073],
  "Ottery": [80.2399, 13.1073],
  "Porur (Kumar Sweets)": [80.1557, 13.0374],
  "Saravana Stores (Shell PB)": [80.1557, 13.0374],
  "Mugalaivakkam BS": [80.1725, 13.0067],
  "Ramapuram BS": [80.1725, 13.0227],
  "Sanitorium (GK Hotel)": [80.1725, 12.9675],
  "MGR Janaki College": [80.2548, 13.0012],
  "Adyar Depot (T. Exchange) L.B Road": [80.2548, 13.0012],
  "Thiruvanmiyur Post Office OMR": [80.2590, 12.9830],
  "V. House": [80.2824, 13.0569],
  "F. Shore Estate": [80.2824, 13.0569],
  "MRC Nagar": [80.2824, 13.0569],
  "P1 Police Station (Pulianthope)": [80.2399, 13.1073],
  "Nataraja Theatre": [80.2399, 13.1073],
  "Choolai PO": [80.2399, 13.1073],
  "Chindadripet Ramada Hotel": [80.2707, 13.0732],
  "Royapettah BS TTK Road": [80.2617, 13.0498],
  "Alwarpet (Winners Bakery)": [80.2548, 13.0368],
  "Marutherswarar Temple": [80.2548, 13.0012],
  "RTO Office": [80.2548, 13.0012],
  "Peria Neelankarai (Vasan Eye Care)": [80.2590, 12.9830],
  "Korattur (Millennium Aprts.)": [80.1834, 13.1151],
  "Korattur Signal": [80.1834, 13.1151],
  "TVS BS": [80.1834, 13.1151],
  "Annanagar W. Depot": [80.2092, 13.0850],
  "Ration Kadai": [80.1834, 13.0569],
  "Golden Flats (Mangaleri) Park": [80.1834, 13.1151],
  "Golden Flats BS": [80.1834, 13.1151],
  "TSK Nagar": [80.1834, 13.1151],
  "Collector Nagar": [80.1834, 13.1151],
  "College": [80.1443, 12.9249], // Assuming college is near Tambaram
  "Campus (Arrival)": [80.1443, 12.9249]
};

// Mapbox access token
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiYmxpdHpqYiIsImEiOiJjbTEweDAzb20wOGhiMnRwZGNqZ2NsdXF6In0.DhETe3EckUcqEAvDDQsfLA';

// Set the access token for mapbox
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

interface MapboxMapProps {
  stops: StopPoint[];
  routeNumber: string;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ stops, routeNumber }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      // Initialize the map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: CHENNAI_COORDINATES,
        zoom: 10
      });

      // Handle map load errors
      map.current.on('error', (e: any) => {
        console.error("Mapbox error:", e);
        setError("An error occurred with the map. Please try again later.");
        setIsLoading(false);
      });
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map. Please try again later.");
      setIsLoading(false);
      return;
    }

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers when the map loads
    map.current.on('load', () => {
      setIsLoading(false);

      // Generate coordinates for stops using our location database and helper function
      const stopsWithCoords = stops.map((stop, index) => {
        // Find the best matching location in our database
        const matchedCoordinates = findBestLocationMatch(stop.location, LOCATION_COORDINATES);

        // If we found a match, use it
        let coordinates: [number, number];
        if (matchedCoordinates) {
          coordinates = matchedCoordinates;
        } else {
          // If no match found, create a logical route by placing stops along a line
          // This ensures the route makes visual sense even without exact coordinates
          console.log(`No coordinates found for: ${stop.location}`);

          // Create a path from Chennai to Tambaram (common college area)
          const startPoint = LOCATION_COORDINATES["Chennai"];
          const endPoint = LOCATION_COORDINATES["Tambaram"];

          // Calculate position along the path based on index
          const progress = stops.length > 1 ? index / (stops.length - 1) : 0.5;

          coordinates = [
            startPoint[0] + (endPoint[0] - startPoint[0]) * progress,
            startPoint[1] + (endPoint[1] - startPoint[1]) * progress
          ];
        }

        return {
          ...stop,
          coordinates
        };
      });

      // Add a route line connecting all stops
      if (stopsWithCoords.length > 0 && map.current) {
        // Create a GeoJSON object for the route line
        const routeGeoJSON = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: stopsWithCoords
              .filter(stop => stop.coordinates)
              .map(stop => stop.coordinates)
          }
        };

        // Add the route line to the map
        map.current.addSource('route', {
          type: 'geojson',
          data: routeGeoJSON as any
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6', // blue-500
            'line-width': 3,
            'line-opacity': 0.8
          }
        });
      }

      // Add markers for each stop
      stopsWithCoords.forEach((stop, index) => {
        if (!stop.coordinates || !map.current) return;

        // Create a custom HTML element for the marker
        const el = document.createElement('div');
        el.className = 'flex flex-col items-center';

        // Determine marker color based on position
        let markerColor = '#3b82f6'; // blue-500 for regular stops
        if (index === 0) {
          markerColor = '#22c55e'; // green-500 for start
        } else if (index === stopsWithCoords.length - 1) {
          markerColor = '#ef4444'; // red-500 for end
        }

        const markerDiv = document.createElement('div');
        markerDiv.style.width = '30px';
        markerDiv.style.height = '30px';
        markerDiv.style.borderRadius = '50%';
        markerDiv.style.backgroundColor = 'white';
        markerDiv.style.display = 'flex';
        markerDiv.style.alignItems = 'center';
        markerDiv.style.justifyContent = 'center';
        markerDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        markerDiv.style.border = `3px solid ${markerColor}`;

        // Add number to marker
        markerDiv.innerHTML = `<span style="color: ${markerColor}; font-weight: bold;">${index + 1}</span>`;
        el.appendChild(markerDiv);

        // Add label for start/end points
        if (index === 0 || index === stopsWithCoords.length - 1) {
          const label = document.createElement('div');
          label.style.backgroundColor = markerColor;
          label.style.color = 'white';
          label.style.padding = '2px 6px';
          label.style.borderRadius = '4px';
          label.style.marginTop = '4px';
          label.style.fontSize = '10px';
          label.style.fontWeight = 'bold';
          label.textContent = index === 0 ? 'Start' : 'End';
          el.appendChild(label);
        }

        // Create a popup with more detailed information
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2 max-w-[200px]">
              <h3 class="font-medium text-sm">${stop.location}</h3>
              <p class="text-xs text-gray-600">${stop.time}</p>
              <p class="text-xs mt-1">Stop #${index + 1} on Route ${routeNumber}</p>
            </div>
          `);

        // Add marker to map
        new mapboxgl.Marker(el)
          .setLngLat(stop.coordinates)
          .setPopup(popup)
          .addTo(map.current);
      });

      // If we have stops, fit the map to show all stops
      if (stopsWithCoords.length > 0 && map.current) {
        // Calculate bounds to fit all markers
        const bounds = new mapboxgl.LngLatBounds();

        stopsWithCoords.forEach(stop => {
          if (stop.coordinates) {
            bounds.extend(stop.coordinates);
          }
        });

        // Add some padding to the bounds
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 13,
          duration: 1000
        });
      }
    });

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [stops, routeNumber]);

  // Create a simple text-based representation of the route as fallback
  const renderTextRoute = () => {
    return (
      <div className="p-4 bg-card rounded-lg border border-border">
        <h3 className="font-medium text-sm mb-2">Route {routeNumber} Stops:</h3>
        <ol className="list-decimal pl-5 space-y-2">
          {stops.map((stop, index) => (
            <li key={index} className="text-sm">
              <span className="font-medium">{stop.location}</span>
              {stop.time && <span className="text-muted-foreground ml-2">({stop.time})</span>}
            </li>
          ))}
        </ol>
      </div>
    );
  };

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden border border-border relative">
      <div ref={mapContainer} className="h-full w-full" />

      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="flex flex-col items-center space-y-2">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 p-4">
          <div className="flex flex-col items-center space-y-2 mb-4 max-w-xs text-center">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>

          {/* Show text-based route as fallback */}
          <div className="w-full max-h-[200px] overflow-y-auto">
            {renderTextRoute()}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxMap;
