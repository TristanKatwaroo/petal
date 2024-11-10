"use client";

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoiZ2F2enp6IiwiYSI6ImNtM2F0OXZlMTFnN2oyanBzaDRud3RoeDQifQ.CRAAAxTnDjvmwDiVNMWDXw';

interface MapProps {
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  mapContainer: React.RefObject<HTMLDivElement>;
}

const Map = ({ mapRef, mapContainer }: MapProps) => {
  useEffect(() => {
    if (typeof window !== 'undefined' && mapContainer.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-74.006, 40.7128],
        zoom: 10,
      });

      mapRef.current.on('click', (event) => {
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

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapRef, mapContainer]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-[400px] rounded-lg overflow-hidden"
    />
  );
};

export default Map;