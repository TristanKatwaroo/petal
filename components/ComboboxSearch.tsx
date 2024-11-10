"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import mapboxgl from 'mapbox-gl';

interface Location {
  place_name: string;
  center: [number, number];
}

interface ComboboxSearchProps {
  value: string;
  onChange: (value: string, coordinates?: [number, number]) => void;
  placeholder: string;
}

export function ComboboxSearch({ value, onChange, placeholder }: ComboboxSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [locations, setLocations] = React.useState<Location[]>([]);

  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.length < 2) {
        setLocations([]);
        return;
      }

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchTerm)}.json?access_token=${mapboxgl.accessToken}&types=place,address,poi`
        );
        const data = await response.json();
        setLocations(data.features || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setLocations([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <Combobox
      open={open}
      onOpenChange={setOpen}
      value={value}
      onValueChange={(newValue) => {
        const location = locations.find(loc => loc.place_name === newValue);
        onChange(newValue, location?.center);
      }}
    >
      <ComboboxTrigger className="w-full">
        <ComboboxInput 
          placeholder={placeholder} 
          onValueChange={setSearchTerm}
        />
      </ComboboxTrigger>
      <ComboboxContent>
        {locations.length === 0 && searchTerm.length >= 2 && (
          <div className="p-4 text-sm text-muted-foreground">No locations found</div>
        )}
        {locations.map((location) => (
          <ComboboxItem 
            key={location.place_name} 
            value={location.place_name}
            className="flex items-center"
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                value === location.place_name ? "opacity-100" : "opacity-0"
              )}
            />
            {location.place_name}
          </ComboboxItem>
        ))}
      </ComboboxContent>
    </Combobox>
  );
}