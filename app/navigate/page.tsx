"use client";
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface RouteInfo {
  distance: number;
  duration: number;
  steps: Array<{
    instruction: string;
    distance: number;
    duration: number;
  }>;
}

type Props = {};

export default function NavigatePage({}: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [startLocation, setStartLocation] = useState<string>('');
  const [endLocation, setEndLocation] = useState<string>('');
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      mapboxgl.accessToken = 'pk.eyJ1IjoiZ2F2enp6IiwiYSI6ImNtM2F0OXZlMTFnN2oyanBzaDRud3RoeDQifQ.CRAAAxTnDjvmwDiVNMWDXw';

      if (mapContainer.current) {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [-74.006, 40.7128],
          zoom: 10,
        });

        map.current.on('click', (event) => {
          const latitude = event.lngLat.lat.toFixed(6);
          const longitude = event.lngLat.lng.toFixed(6);
          const navigationBox = document.getElementById('navigation-box');
          if (navigationBox) {
            navigationBox.innerHTML = `
              <strong>Clicked Location:</strong><br>
              Latitude: ${latitude}<br>
              Longitude: ${longitude}
            `;
          }
        });
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

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
            new mapboxgl.Marker({ color: 'blue', className: 'user-location-marker' })
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

      // Get coordinates for end location
      const endResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(endLocation)}.json?access_token=${mapboxgl.accessToken}`
      );
      const endData = await endResponse.json();
      
      if (!startCoords || endData.features.length === 0) {
        throw new Error('Could not find one or both locations');
      }

      const endCoords = endData.features[0].center;

      // Fetch directions
      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;
      const response = await fetch(directionsUrl);
      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = data.routes[0];

      // Set route info
      setRouteInfo({
        distance: route.distance,
        duration: route.duration / 60, // Convert seconds to minutes
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
          'line-color': '#4264fb',
          'line-width': 5
        }
      });

      // Add markers
      new mapboxgl.Marker({ color: 'blue' })
        .setLngLat(startCoords)
        .addTo(map.current);

      new mapboxgl.Marker({ color: 'red' })
        .setLngLat(endCoords)
        .addTo(map.current);

      // Fit map to show the entire route
      const bounds = new mapboxgl.LngLatBounds();
      route.geometry.coordinates.forEach((coord: [number, number]) => bounds.extend(coord));
      map.current.fitBounds(bounds, { padding: 50 });

      setIsLoading(false);
    } catch (error) {
      console.error('Error getting directions:', error);
      setError(error instanceof Error ? error.message : 'Error getting directions. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-5">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          PETAL NAVIGATION | Enter Your Trip Directions
        </h2>
        
        <div className="bg-[#f8f9fa] border-l-4 border-[#0e0e95] p-4 mb-5 rounded-lg">
          <p className="text-gray-700">
            Welcome to PETAL Navigation! Use your current location or enter addresses to get directions.
          </p>
        </div>

        <div 
          id="navigation-box"
          className="w-full p-5 bg-white rounded-xl mb-5 text-gray-700 shadow-sm border border-gray-200"
        >
          Click on the map to get latitude and longitude or use the location button
        </div>

        <div 
          ref={mapContainer}
          className="w-full h-[400px] rounded-xl mb-5 shadow-sm"
        />

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-5 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isLoading}
            className="w-full px-6 py-3 text-white bg-[#306a94] rounded-lg hover:bg-[#245270] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Getting Location...' : 'Use Current Location'}
          </button>

          <div className="space-y-2">
            <input
              type="text"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              placeholder="Enter start location (or use current location)"
              className="w-full px-4 py-3 text-gray-700 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0e0e95] transition-colors"
            />
          </div>
          
          <div className="space-y-2">
            <input
              type="text"
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
              placeholder="Enter destination"
              required
              className="w-full px-4 py-3 text-gray-700 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0e0e95] transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={getDirections}
              disabled={isLoading}
              className="w-full px-6 py-3 text-white bg-[#0e0e95] rounded-lg hover:bg-[#306a94] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Getting Directions...' : 'Get Directions'}
            </button>
          </div>
        </form>

        {routeInfo && (
          <div className="mt-8 space-y-4">
            <div className="bg-[#f8f9fa] p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Route Summary</h3>
              <p><strong>Total Distance:</strong> {formatDistance(routeInfo.distance)}</p>
              <p><strong>Estimated Time:</strong> {formatDuration(routeInfo.duration)}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg">
        N      <h3 className="font-semibold text-lg p-4 border-b border-gray-200">Turn-by-Turn Directions</h3>
              <div className="divide-y divide-gray-200">
                {routeInfo.steps.map((step, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50">
                    <p className="mb-1">{step.instruction}</p>
                    <p className="text-sm text-gray-600">
                      {formatDistance(step.distance)} • {formatDuration(step.duration)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
