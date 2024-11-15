"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, TentTree } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

interface Place {
  name: string;
  vicinity: string;
  coordinates: [number, number];
  types: string[];
}

const colorClasses = [
  "from-red-500 to-red-600",
  "from-teal-500 to-teal-600",
  "from-yellow-500 to-yellow-600",
  "from-blue-500 to-blue-600",
  "from-purple-500 to-purple-600",
  "from-green-500 to-green-600",
];

const getRandomColorClass = () => {
  return colorClasses[Math.floor(Math.random() * colorClasses.length)];
};

const bramptonPlaces: Place[] = [
  {
    name: "Chinguacousy Park",
    vicinity: "Brampton, ON",
    coordinates: [-79.7616, 43.7034],
    types: ["park"],
  },
  {
    name: "Rose Theatre Brampton",
    vicinity: "Brampton, ON",
    coordinates: [-79.7606, 43.6867],
    types: ["theater"],
  },
  {
    name: "Gage Park",
    vicinity: "Brampton, ON",
    coordinates: [-79.7622, 43.6847],
    types: ["park"],
  },
  {
    name: "Peel Art Gallery",
    vicinity: "Brampton, ON",
    coordinates: [-79.761, 43.6835],
    types: ["museum"],
  },
  {
    name: "Professor's Lake",
    vicinity: "Brampton, ON",
    coordinates: [-79.7275, 43.7318],
    types: ["lake", "recreational area"],
  },
];

function NearbyThings() {
  const [places, setPlaces] = useState<Place[]>(bramptonPlaces);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visiblePlaces, setVisiblePlaces] = useState(3);
  const router = useRouter();

  useEffect(() => {
    const updateVisiblePlaces = () => {
      if (window.innerWidth >= 1280) setVisiblePlaces(4);
      else if (window.innerWidth >= 1024) setVisiblePlaces(3);
      else if (window.innerWidth >= 768) setVisiblePlaces(2);
      else setVisiblePlaces(1);
    };

    updateVisiblePlaces();
    window.addEventListener("resize", updateVisiblePlaces);
    return () => window.removeEventListener("resize", updateVisiblePlaces);
  }, []);

  const handleNext = () => {
    const maxIndex = places.length - visiblePlaces;
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleCardClick = (place: Place) => {
    router.push(
      `/navigate?destination=${encodeURIComponent(place.name)}&lat=${
        place.coordinates[1]
      }&lon=${place.coordinates[0]}`
    );
  };

  const isAtStart = currentIndex === 0;
  const isAtEnd = currentIndex >= places.length - visiblePlaces;

  return (
    <div className="md:w-[80vw] w-[95vw] max-w-full bg-white rounded-xl shadow-lg p-6 overflow-hidden dark:bg-[hsl(20,14.3%,4.1%)]">
      <Toaster />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TentTree className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Things To Do Nearby
          </h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handlePrev}
            disabled={isAtStart}
            className={`p-2 rounded-full transition-all duration-200 ${
              isAtStart
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={handleNext}
            disabled={isAtEnd}
            className={`p-2 rounded-full transition-all duration-200 ${
              isAtEnd
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
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
            transform: `translateX(-${currentIndex * (100 / visiblePlaces)}%)`,
            width: `${(places.length * 100) / visiblePlaces}%`,
          }}
        >
          {places.map((place, index) => (
            <div
              key={index}
              className="flex-shrink-0 px-2 cursor-pointer"
              style={{ width: `${100 / places.length}%` }}
              onClick={() => handleCardClick(place)}
            >
              <div
                className={`rounded-xl shadow-lg overflow-hidden bg-gradient-to-r ${getRandomColorClass()}`}
              >
                <div className="p-4 text-white">
                  <div className="text-lg font-bold">{place.name}</div>
                  <p className="text-sm text-gray-100">{place.vicinity}</p>
                  <p className="text-sm">Type: {place.types.join(", ")}</p>
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