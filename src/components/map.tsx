
"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { icon } from 'leaflet';
import type { Dish } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import "leaflet/dist/leaflet.css"


// Define a custom icon for map markers
const MarkerIcon = icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});


interface MapProps {
  dishes: Dish[];
}

export default function Map({ dishes }: MapProps) {
  const [position, setPosition] = useState<LatLngExpression | null>(null);
  
  // Default to a central location if geolocation fails or is denied
  const defaultPosition: LatLngExpression = [40.7128, -74.0060]; // New York City

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          // User denied location, or an error occurred
          console.warn("Could not get user location. Defaulting to a central location.");
          setPosition(defaultPosition);
        }
      );
    } else {
      // Browser doesn't support geolocation
      console.warn("Geolocation is not supported by this browser. Defaulting to a central location.");
      setPosition(defaultPosition);
    }
  }, []);

  if (!position) {
    return (
        <div className="flex items-center justify-center h-full w-full bg-muted">
            <p>Loading map...</p>
        </div>
    );
  }

  // Assign random nearby locations to dishes for demonstration
  // In a real app, dishes would have their own lat/lng
  const dishesWithLocations = dishes.map(dish => ({
      ...dish,
      location: [
          position[0] + (Math.random() - 0.5) * 0.1,
          position[1] + (Math.random() - 0.5) * 0.1,
      ] as LatLngExpression
  }));

  return (
    <MapContainer center={position} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {dishesWithLocations.map(dish => (
        <Marker key={dish.id} position={dish.location} icon={MarkerIcon}>
          <Popup>
             <div className="w-48">
                <h3 className="font-bold text-lg mb-1">{dish.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">by {dish.provider.name}</p>
                <p className="font-bold text-primary mb-2">${dish.price.toFixed(2)}</p>
                <Button asChild size="sm" className="w-full">
                    <Link href={`/dishes/${dish.id}`}>View Dish</Link>
                </Button>
            </div>
          </Popup>
        </Marker>
      ))}
       <Marker position={position}>
            <Popup>You are here.</Popup>
       </Marker>
    </MapContainer>
  );
}
