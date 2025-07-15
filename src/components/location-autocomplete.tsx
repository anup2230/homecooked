
"use client";

import React from 'react';
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import Script from 'next/script';
import { cn } from '@/lib/utils';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (address: string, latLng?: { lat: number; lng: number }) => void;
}

export function LocationAutocomplete({ value, onChange, onSelect }: LocationAutocompleteProps) {
  const handleSelect = async (address: string) => {
    onChange(address);
    try {
      const results = await geocodeByAddress(address);
      const latLng = await getLatLng(results[0]);
      onSelect(address, latLng);
    } catch (error) {
      console.error('Error', error);
      onSelect(address); // Fallback with address only
    }
  };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
        <div className="relative">
             <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
             <Input 
                value="Enter your city to show local results" 
                className="pl-10 text-base"
            />
        </div>
    );
  }

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
        strategy="beforeInteractive"
      />
      <PlacesAutocomplete
        value={value}
        onChange={onChange}
        onSelect={handleSelect}
        searchOptions={{
            types: ['(cities)'],
            componentRestrictions: { country: 'us' } 
        }}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div className="relative w-full">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              {...getInputProps({
                placeholder: 'Enter your city to show local results',
                className: 'pl-10 text-base bg-blue-50 border-blue-200 text-blue-700 placeholder:text-blue-700',
              })}
            />
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
                {loading && <div className="p-2">Loading...</div>}
                {suggestions.map((suggestion, index) => {
                  const className = suggestion.active
                    ? 'bg-secondary'
                    : 'bg-background';
                  return (
                    <div
                      key={index}
                      {...getSuggestionItemProps(suggestion, {
                        className: cn('p-2 cursor-pointer hover:bg-secondary', className),
                      })}
                    >
                      <span>{suggestion.description}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </PlacesAutocomplete>
    </>
  );
}
