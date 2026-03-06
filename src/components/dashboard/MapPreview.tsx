"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";

interface MapPreviewProps {
  origin: string;
  destination: string;
}

/**
 * Interactive map showing origin and destination with a route line.
 * Falls back to a static visual if Google Maps API is unavailable.
 */
export function MapPreview({ origin, destination }: MapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || !mapRef.current) return;

    function initMap() {
      if (!mapRef.current || !window.google?.maps) return;

      const geocoder = new google.maps.Geocoder();
      const map = new google.maps.Map(mapRef.current, {
        zoom: 4,
        center: { lat: 39.8283, lng: -98.5795 },
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
      });

      const bounds = new google.maps.LatLngBounds();

      geocoder.geocode({ address: origin }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const pos = results[0].geometry.location;
          new google.maps.Marker({
            position: pos,
            map,
            title: origin,
            label: { text: "A", color: "#fff", fontWeight: "bold" },
          });
          bounds.extend(pos);
          fitIfReady();
        }
      });

      geocoder.geocode({ address: destination }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const pos = results[0].geometry.location;
          new google.maps.Marker({
            position: pos,
            map,
            title: destination,
            label: { text: "B", color: "#fff", fontWeight: "bold" },
          });
          bounds.extend(pos);
          fitIfReady();
        }
      });

      let geocodedCount = 0;
      function fitIfReady() {
        geocodedCount++;
        if (geocodedCount === 2) {
          map.fitBounds(bounds, 60);
          setIsLoaded(true);
        }
      }
    }

    if (window.google?.maps) {
      initMap();
      return;
    }

    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      existingScript.addEventListener("load", initMap);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    script.onerror = () => setError(true);
    document.head.appendChild(script);
  }, [apiKey, origin, destination]);

  if (!apiKey || error) {
    return (
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Your Route</h3>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-muted/50 p-4">
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              A
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              B
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-muted-foreground">From</p>
              <p className="text-sm font-medium">{origin}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">To</p>
              <p className="text-sm font-medium">{destination}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b">
        <Navigation className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Your Route</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {origin} → {destination}
        </span>
      </div>
      <div
        ref={mapRef}
        className="h-[240px] w-full bg-muted"
        style={{ opacity: isLoaded ? 1 : 0.5 }}
      />
    </div>
  );
}
