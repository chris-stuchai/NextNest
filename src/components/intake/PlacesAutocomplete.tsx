"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Google Places autocomplete input. Falls back to a plain text input
 * if the Google Maps API key is not configured.
 */
export function PlacesAutocomplete({
  value,
  onChange,
  onKeyDown,
  placeholder = "Search for a city...",
  className,
}: PlacesAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) return;

    if (typeof window !== "undefined" && window.google?.maps?.places) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      setIsLoaded(true);
      return;
    }

    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        autocompleteService.current = new google.maps.places.AutocompleteService();
        setIsLoaded(true);
      });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      setIsLoaded(true);
    };
    document.head.appendChild(script);
  }, [apiKey]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(
    (input: string) => {
      if (!autocompleteService.current || !input.trim()) {
        setSuggestions([]);
        return;
      }

      autocompleteService.current.getPlacePredictions(
        {
          input,
          types: ["(cities)"],
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
          }
        }
      );
    },
    []
  );

  function handleInputChange(newValue: string) {
    onChange(newValue);
    if (isLoaded) {
      fetchSuggestions(newValue);
    }
  }

  function handleSelect(description: string) {
    onChange(description);
    setShowSuggestions(false);
    setSuggestions([]);
  }

  if (!apiKey) {
    return (
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={cn("h-14 rounded-xl text-lg", className)}
        autoFocus
      />
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className={cn("h-14 rounded-xl pl-12 text-lg", className)}
          autoFocus
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border bg-card shadow-lg">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSelect(suggestion.description)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-muted first:rounded-t-xl last:rounded-b-xl"
            >
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>{suggestion.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
