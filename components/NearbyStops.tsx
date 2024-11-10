import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface StopData {
  trip_id: string;
  arrival_time: string;
  departure_time: string;
  stop_name: string;
  route_short_name: string;
  route_long_name: string;
}

function NearbyStops() {
  const [stops, setStops] = useState<StopData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const response = await fetch(`/api/processGTFS?lat=${latitude}&lon=${longitude}`);
            if (!response.ok) {
              throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            setStops(data.upcomingRoutes);
            setLoading(false);
          } catch (err) {
            setError('Failed to load stops. Please try again later.');
            setLoading(false);
          }
        },
        () => {
          setError('Unable to retrieve your location.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nearest Upcoming Bus Stops</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Route Short Name</TableHead>
            <TableHead>Route Long Name</TableHead>
            <TableHead>Stop Name</TableHead>
            <TableHead>Arrival Time</TableHead>
            <TableHead>Departure Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stops.map((stop, index) => (
            <TableRow key={index}>
              <TableCell>{stop.route_short_name}</TableCell>
              <TableCell>{stop.route_long_name}</TableCell>
              <TableCell>{stop.stop_name}</TableCell>
              <TableCell>{stop.arrival_time}</TableCell>
              <TableCell>{stop.departure_time}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default NearbyStops;
