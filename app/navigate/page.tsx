"use client";

import React, { useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Navigation, AlertCircle, LocateFixed, Bike, Bus, Car, MapIcon } from "lucide-react";
import Map from '@/components/Map';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RouteInfo {
  distance: number;
  duration: number;
  steps: Array<{
    instruction: string;
    distance: number;
    duration: number;
  }>;
}

type TransportMode = 'driving' | 'walking' | 'cycling' | 'transit';

export default function NavigatePage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [startLocation, setStartLocation] = useState<string>('');
  const [endLocation, setEndLocation] = useState<string>('');
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transportMode, setTransportMode] = useState<TransportMode>('driving');

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
        (position) => {
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
      let startCoords = userLocation;
      if (startLocation && !userLocation) {
        const startResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(startLocation)}.json?access_token=${mapboxgl.accessToken}`
        );
        const startData = await startResponse.json();
        if (startData.features.length > 0) {
          startCoords = startData.features[0].center;
        }
      }

      const endResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(endLocation)}.json?access_token=${mapboxgl.accessToken}`
      );
      const endData = await endResponse.json();
      
      if (!startCoords || endData.features.length === 0) {
        throw new Error('Could not find one or both locations');
      }

      const endCoords = endData.features[0].center;

      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/${transportMode}/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;      const response = await fetch(directionsUrl);
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

      // Add the route to the map
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
          'line-width': 5
        }
      });

      // Add markers
      new mapboxgl.Marker({ color: '#0e0e95' })
        .setLngLat(startCoords)
        .addTo(map.current);

      new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat(endCoords)
        .addTo(map.current);

      // Fit map to show the entire route
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
    <div className="container mx-auto p-4 space-y-4">
      <Card>
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

                <Input
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  placeholder="Enter start location (or use current location)"
                  className="w-full"
                />

                <Input
                  value={endLocation}
                  onChange={(e) => setEndLocation(e.target.value)}
                  placeholder="Enter destination"
                  className="w-full"
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
                <SelectContent>
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
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Getting Directions...' : 'Get Directions'}
          </Button>

          {routeInfo && (
            <Card>
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
                        className="p-3 rounded-lg bg-muted/50 space-y-1"
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