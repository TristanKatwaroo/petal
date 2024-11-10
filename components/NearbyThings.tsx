import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TentTree, Loader2, AlertCircle, MapPin } from 'lucide-react';

interface Place {
  name: string;
  vicinity: string;
  types: string[];
}

const dummyData: Place[] = [
  { name: 'Central Park', vicinity: 'New York, NY', types: ['park'] },
  { name: 'Statue of Liberty', vicinity: 'New York, NY', types: ['tourist_attraction'] },
  { name: 'Times Square', vicinity: 'New York, NY', types: ['point_of_interest'] },
  { name: 'The Metropolitan Museum of Art', vicinity: 'New York, NY', types: ['museum'] },
  { name: 'Broadway Theatre', vicinity: 'New York, NY', types: ['theater'] },
];

const colorClasses = [
  'from-red-500 to-red-600',
  'from-teal-500 to-teal-600',
  'from-yellow-500 to-yellow-600',
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-green-500 to-green-600',
];

// Utility function to randomly pick a color class
const getRandomColorClass = () => {
  return colorClasses[Math.floor(Math.random() * colorClasses.length)];
};

function NearbyThings() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visiblePlaces, setVisiblePlaces] = useState(3);

  useEffect(() => {
    const updateVisiblePlaces = () => {
      if (window.innerWidth >= 1280) setVisiblePlaces(4);
      else if (window.innerWidth >= 1024) setVisiblePlaces(3);
      else if (window.innerWidth >= 768) setVisiblePlaces(2);
      else setVisiblePlaces(1);
    };

    updateVisiblePlaces();
    window.addEventListener('resize', updateVisiblePlaces);
    return () => window.removeEventListener('resize', updateVisiblePlaces);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(`/api/nearbyThings?lat=${latitude}&lon=${longitude}`);
            if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();
            if (data.length === 0) throw new Error('No nearby places found');
            setPlaces(data);
          } catch (err) {
            console.error('Fetch failed, using dummy data:', err);
            setPlaces(dummyData); // Set places to dummyData on failure
            setError('Failed to load live data. Displaying sample data.');
          } finally {
            setLoading(false);
          }
        },
        () => {
          console.error('Geolocation failed, using dummy data');
          setPlaces(dummyData); // Set places to dummyData if geolocation fails
          setError('Unable to retrieve your location. Displaying sample data.');
          setLoading(false);
        }
      );
    } else {
      console.error('Geolocation not supported, using dummy data');
      setPlaces(dummyData); // Set places to dummyData if geolocation is not supported
      setError('Geolocation is not supported by your browser. Displaying sample data.');
      setLoading(false);
    }
  }, []);

  const handleNext = () => {
    if (currentIndex + visiblePlaces < places.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const isAtStart = currentIndex === 0;
  const lastIndex = Math.max(0, places.length - visiblePlaces);
  const isAtEnd = currentIndex >= lastIndex;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg dark:bg-[hsl(20,14.3%,4.1%)]">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600 dark:text-gray-100">Loading nearby places...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[80vw] max-w-full bg-white rounded-xl shadow-lg p-6 overflow-hidden dark:bg-[hsl(20,14.3%,4.1%)]">
      {error && (
        <div className="flex items-center mb-4 text-red-600">
          <AlertCircle className="h-6 w-6 mr-2" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TentTree className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Things To Do Nearby</h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handlePrev}
            disabled={isAtStart}
            className={`p-2 rounded-full transition-all duration-200 ${
              isAtStart ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={handleNext}
            disabled={isAtEnd}
            className={`p-2 rounded-full transition-all duration-200 ${
              isAtEnd ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <ChevronRight className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / visiblePlaces)}%)`, width: `${places.length * 25}rem` }}
        >
          {places.map((place, index) => (
            <div key={index} className="flex-shrink-0 px-2" style={{ width: '25rem' }}>
              <div className={`rounded-xl shadow-lg overflow-hidden bg-gradient-to-r ${getRandomColorClass()}`}>
                <div className="p-4 text-white">
                  <div className="text-lg font-bold">{place.name}</div>
                  <p className="text-sm text-gray-100">{place.vicinity}</p>
                  <p className="text-sm">Type: {place.types.join(', ')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NearbyThings;
