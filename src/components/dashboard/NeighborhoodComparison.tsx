"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, ArrowRight, AlertTriangle, Lightbulb } from "lucide-react";

interface LocationProfile {
  name: string;
  costOfLiving: string;
  climate: string;
  transitScore: string;
  highlights: string[];
}

interface ComparisonData {
  origin: LocationProfile;
  destination: LocationProfile;
  keyDifferences: string[];
  tips: string[];
}

/** AI-powered neighborhood/city comparison widget. */
export function NeighborhoodComparison() {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchComparison() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/neighborhood", { method: "POST" });
      const json = await response.json();
      if (json.data) {
        setData(json.data);
      } else {
        setError(json.error ?? "Failed to generate comparison");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!data) {
    return (
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Neighborhood Comparison</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          See how your new area compares to where you live now — cost of living,
          climate, transit, and local tips powered by AI.
        </p>
        {error && (
          <div className="flex items-center gap-2 mb-3 text-sm text-destructive" role="alert">
            <AlertTriangle className="h-3.5 w-3.5" />
            {error}
          </div>
        )}
        <Button onClick={fetchComparison} disabled={isLoading} size="sm">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Researching...
            </>
          ) : (
            "Compare Locations"
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Neighborhood Comparison</h3>
        </div>
      </div>

      {/* Location cards side by side */}
      <div className="grid gap-4 sm:grid-cols-2 mb-5">
        <LocationCard location={data.origin} label="Current" />
        <LocationCard location={data.destination} label="New Home" />
      </div>

      {/* Key differences */}
      <div className="mb-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Key Differences
        </h4>
        <ul className="space-y-1.5">
          {(data.keyDifferences ?? []).map((diff, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <ArrowRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
              <span>{diff}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Adjustment tips */}
      <div className="rounded-lg bg-primary/5 p-4">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-2">
          <Lightbulb className="h-3.5 w-3.5" />
          Adjustment Tips
        </h4>
        <ul className="space-y-1.5">
          {(data.tips ?? []).map((tip, i) => (
            <li key={i} className="text-sm text-muted-foreground">{tip}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4 pt-3 border-t">
        <Button variant="outline" size="sm" onClick={fetchComparison} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
          Refresh
        </Button>
      </div>
    </div>
  );
}

function LocationCard({ location, label }: { location: LocationProfile; label: string }) {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <p className="text-sm font-semibold">{location.name}</p>
      </div>
      <div className="space-y-2 text-xs">
        <div>
          <span className="text-muted-foreground">Cost of Living: </span>
          <span className="font-medium">{location.costOfLiving}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Climate: </span>
          <span className="font-medium">{location.climate}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Transit: </span>
          <span className="font-medium">{location.transitScore}</span>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Highlights</p>
        <div className="flex flex-wrap gap-1">
          {(location.highlights ?? []).map((h, i) => (
            <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-[11px]">{h}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
