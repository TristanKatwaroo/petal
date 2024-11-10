import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Bus,
  Clock,
  MapPin,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface StopData {
  trip_id: string;
  arrival_time: string;
  departure_time: string;
  stop_name: string;
  route_short_name: string;
  route_long_name: string;
}

const colorClasses = [
  "from-red-500 to-red-600",
  "from-teal-500 to-teal-600",
  "from-yellow-500 to-yellow-600",
  "from-blue-500 to-blue-600",
  "from-purple-500 to-purple-600",
  "from-green-500 to-green-600",
];

function NearbyStops() {
  const [stops, setStops] = useState<StopData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleStops, setVisibleStops] = useState(3);

  useEffect(() => {
    const updateVisibleStops = () => {
      if (window.innerWidth >= 1280) setVisibleStops(4);
      else if (window.innerWidth >= 1024) setVisibleStops(3);
      else if (window.innerWidth >= 768) setVisibleStops(2);
      else setVisibleStops(1);
    };

    updateVisibleStops();
    window.addEventListener("resize", updateVisibleStops);
    return () => window.removeEventListener("resize", updateVisibleStops);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `/api/processGTFS?lat=${latitude}&lon=${longitude}`
            );
            if (!response.ok) throw new Error("Failed to fetch data");
            const data = await response.json();
            setStops(data.upcomingRoutes);
            setLoading(false);
          } catch (err) {
            setError("Failed to load stops. Please try again later.");
            setLoading(false);
          }
        },
        () => {
          setError("Unable to retrieve your location.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  }, []);

  const handleNext = () => {
    if (currentIndex + visibleStops < stops.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(":");
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return time;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg dark:bg-[hsl(20,14.3%,4.1%)]">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600 dark:text-gray-100">
            Loading nearby stops...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48 bg-red-50 rounded-lg dark:bg-[hsl(20,14.3%,4.1%)]">
        <div className="flex flex-col items-center space-y-2">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // const isAtStart = currentIndex === 0;
  // const isAtEnd = currentIndex + visibleStops >= stops.length;
  const isAtStart = currentIndex === 0;
  const lastIndex = Math.max(0, stops.length - visibleStops);
  // const lastIndex = 100;
  const isAtEnd = currentIndex >= lastIndex;

  return (
    // <div className="flex items-center justify-center h-48 rounded-lg bg-gray-50 dark:bg-[hsl(20,14.3%,4.1%)]">
    <div className="md:w-[80vw] w-[95vw] max-w-full bg-white rounded-xl shadow-lg p-6 overflow-hidden dark:bg-[hsl(20,14.3%,4.1%)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bus className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Nearby Transit
          </h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handlePrev}
            disabled={isAtStart}
            className={`p-2 rounded-full transition-all duration-200 ${
              isAtStart
                ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
            }`}
          >
            <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={handleNext}
            disabled={isAtEnd}
            className={`p-2 rounded-full transition-all duration-200 ${
              isAtEnd
                ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
            }`}
          >
            <ChevronRight className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleStops)}%)`,
            // width: `${stops.length * (100 / visibleStops)}%`,
            width: `120rem`,
          }}
        >
          {stops.map((stop, index) => (
            <div
              key={index}
              className="flex-shrink-0 px-2"
              // style={{ width: `calc(100% / ${visibleStops})` }}
              style={{ width: "25rem" }}
            >
              <div
                className={`rounded-xl shadow-lg overflow-hidden bg-gradient-to-r ${
                  colorClasses[index % colorClasses.length]
                }`}
              >
                <div className="p-4 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-4xl font-bold">
                      {stop.route_short_name}
                    </span>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-xl font-semibold">
                          {formatTime(stop.arrival_time)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <Bus className="h-4 w-4 mt-1 flex-shrink-0" />
                      <p className="text-sm font-medium line-clamp-2">
                        {stop.route_long_name}
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                      <p className="text-sm font-medium line-clamp-2">
                        {stop.stop_name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NearbyStops;