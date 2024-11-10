"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MapPin } from "lucide-react";
import mapboxgl from 'mapbox-gl';

interface LocationSearchProps {
  value: string;
  onChange: (value: string, coordinates?: [number, number]) => void;
  placeholder: string;
}

export function LocationSearch({ value, onChange, placeholder }: LocationSearchProps) {
  const [searchTerm, setSearchTerm] = React.useState(value);
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchTerm)}.json?access_token=${mapboxgl.accessToken}&types=place,address,poi`
        );
        const data = await response.json();
        setSuggestions(data.features || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close suggestions when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        className="w-full"
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-muted/50"
              onClick={() => {
                onChange(suggestion.place_name, suggestion.center);
                setSearchTerm(suggestion.place_name);
                setShowSuggestions(false);
              }}
            >
              <MapPin className="h-4 w-4 shrink-0 opacity-50" />
              <span className="truncate">{suggestion.place_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}