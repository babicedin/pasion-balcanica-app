"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { Loader2, MapPin, Search, X } from "lucide-react";
import type mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type LocationValue = {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
};

type LocationPickerProps = {
  value: LocationValue;
  onChange: (next: LocationValue) => void;
  /** Center the map on this lng/lat when no value yet. Defaults to Sarajevo. */
  fallbackCenter?: [number, number];
  label?: string;
};

type Suggestion = {
  id: string;
  place_name: string;
  center: [number, number];
};

const SARAJEVO: [number, number] = [18.4131, 43.8563];

/**
 * Mapbox-powered location picker.
 *
 * Client-only. Loads `mapbox-gl` dynamically to avoid SSR issues. The map uses
 * the public Mapbox token from `NEXT_PUBLIC_MAPBOX_TOKEN`. Supports:
 *
 *   - Forward geocoding via the search box
 *   - Click-to-place and drag-to-refine for the marker
 *   - Reverse geocoding to fill in the address after a click/drag
 *
 * The outer shell renders a stable placeholder during SSR so hydration always
 * matches; the interactive map is mounted after the client takes over.
 */
export function LocationPicker(props: LocationPickerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-3">
        <label className="label">{props.label ?? "Location"}</label>
        <div className="h-80 rounded-xl border border-line bg-surface-muted grid place-items-center">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Loader2 size={14} className="animate-spin" />
            Preparing map…
          </div>
        </div>
      </div>
    );
  }

  return <LocationPickerInner {...props} />;
}

function LocationPickerInner({
  value,
  onChange,
  fallbackCenter = SARAJEVO,
  label = "Location",
}: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const mapboxModuleRef = useRef<typeof mapboxgl | null>(null);
  const onChangeRef = useRef(onChange);

  const [ready, setReady] = useState(false);
  const [searchInput, setSearchInput] = useState(value.address ?? "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const skipNextAutoSearchRef = useRef(false);
  const updatedFromExternalValueRef = useRef(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    updatedFromExternalValueRef.current = true;
    setSearchInput(value.address ?? "");
  }, [value.address]);

  useEffect(() => {
    return () => {
      searchAbortRef.current?.abort();
    };
  }, []);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const tokenLooksValid = useMemo(
    () => Boolean(token && token.startsWith("pk.")),
    [token]
  );

  const reverseGeocode = useCallback(
    async (lng: number, lat: number): Promise<string | null> => {
      if (!token) return null;
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?limit=1&access_token=${token}`
        );
        if (!res.ok) return null;
        const json = await res.json();
        return json.features?.[0]?.place_name ?? null;
      } catch {
        return null;
      }
    },
    [token]
  );

  // Initialise the map on mount (client-only).
  useEffect(() => {
    if (!tokenLooksValid || !containerRef.current) return;

    let cancelled = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const markReady = () => {
      if (!cancelled) setReady(true);
    };

    (async () => {
      const mod = (await import("mapbox-gl")).default;
      if (cancelled || !containerRef.current) return;
      mapboxModuleRef.current = mod;
      mod.accessToken = token!;

      const initialCenter: [number, number] =
        value.longitude != null && value.latitude != null
          ? [value.longitude, value.latitude]
          : fallbackCenter;

      const map = new mod.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: initialCenter,
        zoom: value.longitude != null ? 14 : 11,
        attributionControl: true,
        cooperativeGestures: false,
      });
      mapRef.current = map;
      map.addControl(new mod.NavigationControl({ showCompass: false }), "top-right");

      const marker = new mod.Marker({ color: "#512e88", draggable: true })
        .setLngLat(initialCenter)
        .addTo(map);
      markerRef.current = marker;

      // Hide the marker until the user actually picks a location.
      if (value.longitude == null || value.latitude == null) {
        marker.getElement().style.display = "none";
      }

      // Mapbox sometimes skips "load" if the style was already cached; belt-and-braces.
      map.on("load", markReady);
      map.once("idle", markReady);
      map.on("style.load", markReady);
      if (map.loaded()) markReady();

      // Force a resize after the container may have settled its layout.
      requestAnimationFrame(() => {
        if (!cancelled) map.resize();
      });

      // Absolute fallback so the "Loading map…" overlay never sticks indefinitely.
      fallbackTimer = setTimeout(markReady, 2500);

      map.on("click", async (event) => {
        const { lng, lat } = event.lngLat;
        marker.getElement().style.display = "";
        marker.setLngLat([lng, lat]);
        const address = await reverseGeocode(lng, lat);
        onChangeRef.current({ latitude: lat, longitude: lng, address });
      });

      marker.on("dragend", async () => {
        const { lng, lat } = marker.getLngLat();
        const address = await reverseGeocode(lng, lat);
        onChangeRef.current({ latitude: lat, longitude: lng, address });
      });
    })();

    return () => {
      cancelled = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      markerRef.current?.remove();
      mapRef.current?.remove();
      markerRef.current = null;
      mapRef.current = null;
      setReady(false);
    };
    // We intentionally only run this once per token/fallbackCenter change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenLooksValid, token, fallbackCenter[0], fallbackCenter[1]]);

  // Sync marker position when value changes externally (e.g. initial data loaded).
  useEffect(() => {
    const marker = markerRef.current;
    const map = mapRef.current;
    if (!marker || !map) return;
    if (value.longitude != null && value.latitude != null) {
      marker.getElement().style.display = "";
      marker.setLngLat([value.longitude, value.latitude]);
    } else {
      marker.getElement().style.display = "none";
    }
  }, [value.longitude, value.latitude]);

  async function runSearch(query?: string) {
    const q = (query ?? searchInput).trim();
    if (!q || !token) return;
    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;
    setSearching(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          q
        )}.json?limit=5&access_token=${token}`,
        { signal: controller.signal }
      );
      const json = await res.json();
      if (!res.ok) {
        setError(json?.message ?? `Mapbox responded with ${res.status}`);
        setSuggestions([]);
      } else {
        setSuggestions(
          (json.features ?? []).map((f: any) => ({
            id: f.id,
            place_name: f.place_name,
            center: f.center,
          }))
        );
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Search failed");
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    if (updatedFromExternalValueRef.current) {
      updatedFromExternalValueRef.current = false;
      return;
    }
    if (skipNextAutoSearchRef.current) {
      skipNextAutoSearchRef.current = false;
      return;
    }
    if (!token || !searchInput.trim()) {
      setSuggestions([]);
      return;
    }
    const q = searchInput.trim();
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      void runSearch(q);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, token]);

  function pick(suggestion: Suggestion) {
    const [lng, lat] = suggestion.center;
    const map = mapRef.current;
    const marker = markerRef.current;
    if (map && marker) {
      map.flyTo({ center: [lng, lat], zoom: 15, essential: true });
      marker.getElement().style.display = "";
      marker.setLngLat([lng, lat]);
    }
    onChange({ longitude: lng, latitude: lat, address: suggestion.place_name });
    skipNextAutoSearchRef.current = true;
    setSearchInput(suggestion.place_name);
    setSuggestions([]);
  }

  function clearLocation() {
    searchAbortRef.current?.abort();
    const marker = markerRef.current;
    if (marker) marker.getElement().style.display = "none";
    onChange({ latitude: null, longitude: null, address: null });
    setSearchInput("");
    setSuggestions([]);
  }

  if (!token || !tokenLooksValid) {
    return (
      <div className="card p-4 text-sm text-neutral-600 space-y-1">
        <p className="font-medium text-brand-ink">{label}</p>
        <p>
          Add a Mapbox <span className="font-mono">pk.*</span> token to
          <span className="font-mono"> NEXT_PUBLIC_MAPBOX_TOKEN</span> in
          <span className="font-mono"> backoffice/.env.local</span> to enable
          the map picker.
        </p>
        {token && !tokenLooksValid && (
          <p className="text-brand-red">
            The current token does not look like a public token (it should
            start with <span className="font-mono">pk.</span>). Secret tokens
            must never be exposed to the browser.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="label">{label}</label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={15}
            strokeWidth={1.75}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void runSearch();
              }
            }}
            placeholder="Search for an address, landmark or place…"
            className="input pl-9"
          />
        </div>
        <button
          type="button"
          className="btn-secondary"
          disabled={searching}
          onClick={() => void runSearch()}
        >
          {searching ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Search size={14} strokeWidth={2} />
          )}
          Search
        </button>
        {(value.latitude != null || value.longitude != null || searchInput) && (
          <button
            type="button"
            className="btn-ghost"
            onClick={clearLocation}
            title="Clear selected location"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="card p-2 space-y-1">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => pick(s)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-muted flex items-start gap-2 transition-colors"
            >
              <MapPin
                size={14}
                strokeWidth={1.75}
                className="text-brand-purple mt-0.5 flex-shrink-0"
              />
              <span className="text-sm text-brand-ink">{s.place_name}</span>
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-brand-red/20 bg-brand-red/10 px-3 py-2 text-sm text-brand-red">
          {error}
        </div>
      )}

      <div className="relative">
        <div
          ref={containerRef}
          className="h-80 rounded-xl overflow-hidden border border-line bg-surface-muted"
        />
        {!ready && (
          <div className="absolute inset-0 rounded-xl grid place-items-center text-sm text-neutral-500 pointer-events-none">
            <div className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Loading map…
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-neutral-500">
        {value.latitude != null && value.longitude != null ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-accent">
              <MapPin size={10} strokeWidth={2} />
              Pinned
            </span>
            <span className="text-brand-ink">{value.address ?? "Unnamed location"}</span>
            <span className="tabular-nums text-neutral-500">
              · {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}
            </span>
          </div>
        ) : (
          "Search above or click the map to pick a location. Drag the pin to fine-tune."
        )}
      </div>
    </div>
  );
}
