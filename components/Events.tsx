// /components/OutdoorEvents.js

import eventsData from "../public/data/events";

export default function OutdoorEvents() {
  return (
    <div className="p-6 bg-background">
      <h1 className="text-3xl font-bold mb-10 text-center">Events</h1>
      <div className="h-1 w-10 bg-blue-300 absolute top-14 left-[38rem]"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {eventsData.map((event) => (
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
                  <strong>Date:</strong> {event.date}
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
