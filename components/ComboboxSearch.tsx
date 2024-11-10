"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import mapboxgl from 'mapbox-gl';
import { useDebounce } from "use-debounce";

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
  const [searchTerm, setSearchTerm] = React.useState(value);
  const [debouncedSearch] = useDebounce(searchTerm, 300);
  const [locations, setLocations] = React.useState<Location[]>([]);

  React.useEffect(() => {
    const fetchLocations = async () => {
      if (debouncedSearch.length < 2) {
        setLocations([]);
        return;
      }

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(debouncedSearch)}.json?access_token=${mapboxgl.accessToken}&types=place,address,poi`
        );
        const data = await response.json();
        setLocations(data.features || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setLocations([]);
      }
    };

    fetchLocations();
  }, [debouncedSearch]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandEmpty>No location found.</CommandEmpty>
          <CommandGroup>
            {locations.map((location) => (
              <CommandItem
                key={location.place_name}
                value={location.place_name}
                onSelect={() => {
                  onChange(location.place_name, location.center);
                  setSearchTerm(location.place_name);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === location.place_name ? "opacity-100" : "opacity-0"
                  )}
                />
                {location.place_name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}