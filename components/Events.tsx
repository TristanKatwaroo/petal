"use client";

import { useState } from "react";
import eventsData from "../public/data/events";

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  price: string;
  image: string;
  participants: number;
}

interface PriceRange {
  id: string;
  label: string;
  condition?: (price: string) => boolean;
}

export default function OutdoorEvents() {
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("all");

  const priceRanges: PriceRange[] = [
    { id: "all", label: "All Prices" },
    {
      id: "free",
      label: "Free",
      condition: (price: string) => price === "Free",
    },
    {
      id: "under25",
      label: "Under $25",
      condition: (price: string) =>
        parseFloat(price.replace(/[^0-9.-]+/g, "") || "0") < 25,
    },
    {
      id: "25to50",
      label: "$25-$50",
      condition: (price: string) => {
        const value = parseFloat(price.replace(/[^0-9.-]+/g, "") || "0");
        return value >= 25 && value <= 50;
      },
    },
    {
      id: "over50",
      label: "Over $50",
      condition: (price: string) =>
        parseFloat(price.replace(/[^0-9.-]+/g, "") || "0") > 50,
    },
  ];

  const filterEvents = (events: Event[]): Event[] => {
    return events.filter((event) => {
      const matchesPrice =
        selectedPriceRange === "all" ||
        priceRanges
          .find((range) => range.id === selectedPriceRange)
          ?.condition?.(event.price);

      return matchesPrice;
    });
  };

  const filteredEvents = filterEvents(eventsData);

  return (
    <div className="p-6 bg-background">
      <h1 className="text-3xl font-bold mb-10 text-center">Events</h1>
      <div className="h-1 w-10 bg-blue-300 absolute top-14 left-[38.5rem]"></div>

      {/* Price Filters */}
      <div className="mb-8 space-y-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Price Range
        </h3>
        <div className="flex flex-wrap gap-2">
          {priceRanges.map((range) => (
            <button
              key={range.id}
              onClick={() => setSelectedPriceRange(range.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${
                  selectedPriceRange === range.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* No Results Message */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No events found with the selected filters.
          </p>
          <button
            onClick={() => {
              setSelectedPriceRange("all");
            }}
            className="mt-4 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="flex flex-col rounded-lg shadow-lg bg-gray-200 dark:bg-gray-800 p-4 transition-transform transform hover:scale-105"
          >
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-40 object-cover rounded-t-lg mb-4"
            />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-2">
                {event.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                {event.description}
              </p>
              <div className="text-gray-500 dark:text-gray-400 text-sm space-y-1">
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong> {event.time}
                </p>
                <p>
                  <strong>Location:</strong> {event.location}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                <strong>Price:</strong> {event.price}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <strong>Participants:</strong> {event.participants}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}