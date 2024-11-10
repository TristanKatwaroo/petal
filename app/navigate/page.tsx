// app/navigate/page.tsx

"use client";

import React, { useRef, useState, useEffect, Suspense } from 'react';
import mapboxgl from 'mapbox-gl';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Navigation,
  Map as MapIcon,
  LocateFixed,
  AlertCircle,
  Car,
  Bus,
  Bike
} from "lucide-react";
import Map from '@/components/Map';
import { LocationSearch } from '@/components/LocationSearch';
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster";

interface RouteInfo {
  distance: number;
  duration: number;
  steps: Array<{
    instruction: string;
    distance: number;
    duration: number;
  }>;
}

interface LocationCoords {
  text: string;
  coordinates: [number, number];
}

type TransportMode = 'driving' | 'walking' | 'cycling' | 'transit';

type TransportTip = {
  [key in TransportMode]: {
    title: string;
    description: string;
    icon: React.ReactNode;
  };
};

const TRANSPORT_TIPS: TransportTip = {
  driving: {
    title: "Driving Safety Tip",
    description: "Keep a safe distance from the car in front of you.",
    icon: <Car className="h-4 w-4" />
  },
  walking: {
    title: "Walking Safety Tip",
    description: "Look both ways before crossing the street.",
    icon: <Navigation className="h-4 w-4" />
  },
  cycling: {
    title: "Biking Safety Tip",
    description: "Wear a helmet for safety.",
    icon: <Bike className="h-4 w-4" />
  },
  transit: {
    title: "Transit Tip",
    description: "Check the schedule before starting your journey.",
    icon: <Bus className="h-4 w-4" />
  }
};

// Separate component for content to enable Suspense
function NavigateContent() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [startLocation, setStartLocation] = useState<LocationCoords>({ text: '', coordinates: [0, 0] });
  const [endLocation, setEndLocation] = useState<LocationCoords>({ text: '', coordinates: [0, 0] });
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transportMode, setTransportMode] = useState<TransportMode>('driving');
  const { toast } = useToast();
  const previousMode = useRef<TransportMode | null>(null);

  const searchParams = useSearchParams();
  const destination = searchParams.get('destination');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  // Set Mapbox access token
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

  // Initialize the map
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: userLocation || [ -79.7622, 43.6847 ], // Default center if user location not available
        zoom: 12,
      });
    }
  }, [userLocation]);

  // Update endLocation based on URL parameters
  useEffect(() => {
    if (destination && lat && lon) {
      setEndLocation({
        text: decodeURIComponent(destination),
        coordinates: [parseFloat(lon), parseFloat(lat)],
      });
    }
  }, [destination, lat, lon]);

  // Show toast when transport mode changes
  useEffect(() => {
    if (previousMode.current !== transportMode) {
      const tip = TRANSPORT_TIPS[transportMode];
      toast({
        title: tip.title,
        description: tip.description,
        duration: 5000,
        className: "bg-background border-border",
      });
      previousMode.current = transportMode;
    }
  }, [transportMode, toast]);

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    if (hours === 0) return `${remainingMinutes} mins`;
    return `${hours} hr ${remainingMinutes} mins`;
  };

  const formatDistance = (meters: number): string => {
    const kilometers = meters / 1000;
    const miles = kilometers * 0.621371;
    return `${miles.toFixed(1)} mi (${kilometers.toFixed(1)} km)`;
  };

  const getCurrentLocation = () => {
    setIsLoading(true);
    setError(null);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location: [number, number] = [position.coords.longitude, position.coords.latitude];
          setUserLocation(location);
          
          if (map.current) {
            map.current.setCenter(location);
            
            // Remove existing user location marker if any
            const existingMarker = document.querySelector('.user-location-marker');
            if (existingMarker) {
              existingMarker.remove();
            }

            // Add new marker
            new mapboxgl.Marker({ color: '#0e0e95', className: 'user-location-marker' })
              .setLngLat(location)
              .addTo(map.current);

            // Reverse geocode the location to get the address
            try {
              const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${location[0]},${location[1]}.json?access_token=${mapboxgl.accessToken}`
              );
              const data = await response.json();
              if (data.features && data.features.length > 0) {
                setStartLocation({
                  text: data.features[0].place_name,
                  coordinates: location
                });
              }
            } catch (error) {
              console.error('Error reverse geocoding:', error);
            }
          }
          setIsLoading(false);
        },
        (error) => {
          setError('Unable to retrieve your location');
          setIsLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
    }
  };

  const getDirections = async () => {
    if (!map.current) return;
    setIsLoading(true);
    setError(null);
    setRouteInfo(null);

    try {
      // Clear existing route and markers
      if (map.current.getLayer('route')) {
        map.current.removeLayer('route');
      }
      if (map.current.getSource('route')) {
        map.current.removeSource('route');
      }
      document.querySelectorAll('.mapboxgl-marker').forEach((marker) => marker.remove());

      // Get coordinates for start location
      let startCoords = userLocation || startLocation.coordinates;
      const endCoords = endLocation.coordinates;

      if (!startCoords || !endCoords) {
        throw new Error('Could not find one or both locations');
      }

      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/${transportMode}/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;
      const response = await fetch(directionsUrl);
      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = data.routes[0];

      setRouteInfo({
        distance: route.distance,
        duration: route.duration / 60,
        steps: route.legs[0].steps.map((step: any) => ({
          instruction: step.maneuver.instruction,
          distance: step.distance,
          duration: step.duration / 60,
        })),
      });

      // Add route to map
      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          }
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#0e0e95',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });

      // Add markers
      new mapboxgl.Marker({ color: '#0e0e95' })
        .setLngLat(startCoords)
        .addTo(map.current);

      new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat(endCoords)
        .addTo(map.current);

      // Fit map to show entire route
      const bounds = new mapboxgl.LngLatBounds();
      route.geometry.coordinates.forEach((coord: [number, number]) => bounds.extend(coord));
      map.current.fitBounds(bounds, { padding: 50 });

      setIsLoading(false);
    } catch (error) {
      console.error('Error getting directions:', error);
      setError(error instanceof Error ? error.message : 'Error getting directions');
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-4">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-6 w-6" />
            PETAL Navigation
          </CardTitle>
          <CardDescription>
            Plan your journey with multiple transportation options
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Map mapRef={map} mapContainer={mapContainer} />

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="location" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="location" className="flex items-center gap-2">
                <LocateFixed className="h-4 w-4" />
                Locations
              </TabsTrigger>
              <TabsTrigger value="mode" className="flex items-center gap-2">
                <MapIcon className="h-4 w-4" />
                Transport Mode
              </TabsTrigger>
            </TabsList>

            <TabsContent value="location" className="space-y-4">
              <div className="space-y-4">
                <Button
                  onClick={getCurrentLocation}
                  disabled={isLoading}
                  variant="secondary"
                  className="w-full"
                >
                  <LocateFixed className="mr-2 h-4 w-4" />
                  {isLoading ? 'Getting Location...' : 'Use Current Location'}
                </Button>

                <LocationSearch
                  value={startLocation.text}
                  onChange={(value, coords) => 
                    setStartLocation({ 
                      text: value, 
                      coordinates: coords || [0, 0] 
                    })
                  }
                  placeholder="Enter start location (or use current location)"
                />

                <LocationSearch
                  value={endLocation.text}
                  onChange={(value, coords) => 
                    setEndLocation({ 
                      text: value, 
                      coordinates: coords || [0, 0] 
                    })
                  }
                  placeholder="Enter destination"
                />
              </div>
            </TabsContent>

            <TabsContent value="mode">
              <Select 
                value={transportMode} 
                onValueChange={(value: TransportMode) => setTransportMode(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select transport mode" />
                </SelectTrigger>
                <SelectContent className="p-2">
                  <SelectItem value="driving">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      Driving
                    </div>
                  </SelectItem>
                  <SelectItem value="walking">
                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4" />
                      Walking
                    </div>
                  </SelectItem>
                  <SelectItem value="cycling">
                    <div className="flex items-center gap-2">
                      <Bike className="h-4 w-4" />
                      Cycling
                    </div>
                  </SelectItem>
                  <SelectItem value="transit">
                    <div className="flex items-center gap-2">
                      <Bus className="h-4 w-4" />
                      Transit
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </TabsContent>
          </Tabs>

          <Button
            onClick={getDirections}
            disabled={isLoading || (!startLocation.text && !userLocation) || !endLocation.text}
            className="w-full"
          >
            {isLoading ? 'Getting Directions...' : 'Get Directions'}
          </Button>

          {routeInfo && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Route Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Distance</p>
                    <p className="font-medium">{formatDistance(routeInfo.distance)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Estimated Time</p>
                    <p className="font-medium">{formatDuration(routeInfo.duration)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Turn-by-Turn Directions</h4>
                  <div className="space-y-2">
                    {routeInfo.steps.map((step, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-muted/50 space-y-1 hover:bg-muted transition-colors"
                      >
                        <p>{step.instruction}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistance(step.distance)} • {formatDuration(step.duration)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function NavigatePage() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <NavigateContent />
      </Suspense>
      <Toaster />
    </>
  );
}
