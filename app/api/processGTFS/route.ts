import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import { NextResponse } from 'next/server';

// Define the paths to the GTFS .txt files
const stopTimesPath = path.join(process.cwd(), 'public/data/stop_times.txt');
const stopsPath = path.join(process.cwd(), 'public/data/stops.txt');
const tripsPath = path.join(process.cwd(), 'public/data/trips.txt');
const routesPath = path.join(process.cwd(), 'public/data/routes.txt');

// Utility function to read and parse CSV files
const readCSV = (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv({ separator: ',' }))
      .on('data', (data: Record<string, string>) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err: Error) => reject(err));
  });
};

// Function to calculate the distance between two geographic coordinates (Haversine formula)
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

// The API route handler
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const lat = parseFloat(url.searchParams.get('lat') || '');
    const lon = parseFloat(url.searchParams.get('lon') || '');

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json({ error: 'Invalid or missing latitude/longitude parameters' }, { status: 400 });
    }

    // Read and parse the necessary GTFS files
    const [stopTimes, stops, trips, routes] = await Promise.all([
      readCSV(stopTimesPath),
      readCSV(stopsPath),
      readCSV(tripsPath),
      readCSV(routesPath),
    ]);

    // Create mappings for easier lookups
    const stopMap = stops.reduce((acc, stop) => {
      acc[stop.stop_id] = {
        name: stop.stop_name,
        lat: parseFloat(stop.stop_lat),
        lon: parseFloat(stop.stop_lon),
      };
      return acc;
    }, {} as Record<string, { name: string; lat: number; lon: number }>);

    const tripMap = trips.reduce((acc, trip) => {
      acc[trip.trip_id] = trip.route_id;
      return acc;
    }, {} as Record<string, string>);

    const routeMap = routes.reduce((acc, route) => {
      acc[route.route_id] = {
        short_name: route.route_short_name,
        long_name: route.route_long_name,
      };
      return acc;
    }, {} as Record<string, { short_name: string; long_name: string }>);

    const currentTime = new Date();
    const MAX_DISTANCE_KM = 5; // Adjust this threshold as needed

    // Array to hold filtered and enriched stops
    const filteredStops = stopTimes
      .map((stop) => {
        const stopInfo = stopMap[stop.stop_id];
        if (!stopInfo) return null;

        const [hours, minutes, seconds] = stop.arrival_time.split(':').map(Number);
        const stopTime = new Date();
        stopTime.setHours(hours, minutes, seconds);

        if (stopTime > currentTime) {
          const distance = haversineDistance(lat, lon, stopInfo.lat, stopInfo.lon);
          if (distance <= MAX_DISTANCE_KM) {
            const tripId = stop.trip_id;
            const routeId = tripMap[tripId];
            const routeInfo = routeMap[routeId] || { short_name: 'N/A', long_name: 'N/A' };

            return {
              trip_id: tripId,
              arrival_time: stop.arrival_time,
              departure_time: stop.departure_time,
              stop_name: stopInfo.name || 'Unknown Stop',
              route_short_name: routeInfo.short_name,
              route_long_name: routeInfo.long_name,
              distance,
              stop_time: stopTime,
            };
          }
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => (a as any).distance - (b as any).distance || (a as any).stop_time.getTime() - (b as any).stop_time.getTime());

    // Deduplicate by `route_short_name`, keeping only the most recent for each route
    const mostRecentRoutes: Record<string, any> = {};
    filteredStops.forEach((stop: any) => {
      if (
        !mostRecentRoutes[stop.route_short_name] ||
        new Date(stop.arrival_time).getTime() > new Date(mostRecentRoutes[stop.route_short_name].arrival_time).getTime()
      ) {
        mostRecentRoutes[stop.route_short_name] = stop;
      }
    });

    // Convert to an array and limit the results to 10 entries
    const upcomingRoutes = Object.values(mostRecentRoutes)
      .sort((a: any, b: any) => a.distance - b.distance || new Date(a.arrival_time).getTime() - new Date(b.arrival_time).getTime())
      .slice(0, 10);

    // Return the enriched data as JSON
    return NextResponse.json({ upcomingRoutes });
  } catch (error) {
    console.error('Error processing GTFS data:', error);
    return NextResponse.json({ error: 'Failed to process GTFS data' }, { status: 500 });
  }
}
