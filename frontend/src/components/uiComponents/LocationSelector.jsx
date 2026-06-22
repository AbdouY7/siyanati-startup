import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import {
  Search,
  MapPin,
  Loader2,
  Navigation,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

// ─── Fix Leaflet default marker icons in Vite/Webpack ─────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ─── Helper: pick zoom level from Nominatim result type ───────────────────────
const getZoomForResult = (result) => {
  const type = result?.type || "";
  const cls = result?.class || "";
  if (["house", "building", "amenity"].includes(type)) return 17;
  if (["road", "street", "residential", "service"].includes(type)) return 16;
  if (["suburb", "neighbourhood", "quarter"].includes(type)) return 14;
  if (["city", "town", "village", "municipality"].includes(type)) return 13;
  if (["county", "administrative"].includes(type) && cls === "boundary")
    return 10;
  if (["state", "province"].includes(type)) return 9;
  return 13; // safe fallback
};

// ─── Reverse geocode: coordinates → human readable address ───────────────────
const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      { headers: { "Accept-Language": "fr" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.display_name || null;
  } catch {
    return null;
  }
};

// ─── Inner component: handles map click & marker drag ─────────────────────────
const LocationMarker = ({ position, onPositionChange }) => {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng);
    },
  });

  if (!position) return null;

  return (
    <Marker
      position={position}
      draggable
      eventHandlers={{
        dragend: (e) => onPositionChange(e.target.getLatLng()),
      }}
    />
  );
};

// ─── Inner component: imperatively controls map view ─────────────────────────
const MapController = ({ target }) => {
  const map = useMap();
  const prevTarget = useRef(null);

  useEffect(() => {
    if (!target) return;
    // Only fly if the target actually changed
    if (
      prevTarget.current &&
      prevTarget.current.lat === target.lat &&
      prevTarget.current.lng === target.lng &&
      prevTarget.current.zoom === target.zoom
    )
      return;
    prevTarget.current = target;
    map.flyTo([target.lat, target.lng], target.zoom, {
      animate: true,
      duration: 1.2,
    });
  }, [target, map]);

  return null;
};

// ─── Main exported component ──────────────────────────────────────────────────
const LocationSelector = ({
  value,
  onChange,
  placeholder = "Sélectionnez votre position sur la carte",
  height = 300,
}) => {
  // Parse an existing "lat, lng" string into a position object
  const parseValue = (v) => {
    if (!v || typeof v !== "string" || !v.includes(",")) return null;
    const [latStr, lngStr] = v.split(",");
    const lat = parseFloat(latStr?.trim());
    const lng = parseFloat(lngStr?.trim());
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  };

  const initialPos = parseValue(value);

  // Algiers as default map center when no value is present
  const defaultCenter = { lat: 36.7372, lng: 3.0865 };

  const [position, setPosition] = useState(initialPos);
  const [mapTarget, setMapTarget] = useState(
    initialPos ? { ...initialPos, zoom: 14 } : null
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null); // "no_results" | "network" | null

  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState(null); // "denied" | "unavailable" | "timeout" | null

  const searchWrapperRef = useRef(null);

  // ── Notify parent when position changes ──────────────────────────────────
  useEffect(() => {
    if (position) {
      onChange(`${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  // ── Close dropdown on outside click ─────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target)
      ) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Handle marker placement (click or drag) ───────────────────────────────
  const handlePositionChange = useCallback(async (latlng) => {
    setPosition(latlng);
    setGeoError(null);
    // Reverse geocode to populate search input
    const address = await reverseGeocode(latlng.lat, latlng.lng);
    if (address) setSearchQuery(address);
  }, []);

  // ── Handle search ─────────────────────────────────────────────────────────
  const handleSearch = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=dz&addressdetails=1&limit=6`,
        { headers: { "Accept-Language": "fr" } }
      );
      if (!res.ok) throw new Error("network");
      const data = await res.json();

      if (data.length === 0) {
        setSearchError("no_results");
        return;
      }

      setSearchResults(data);
      // Auto-select the first result and fly to it
      const first = data[0];
      const zoom = getZoomForResult(first);
      const pos = { lat: parseFloat(first.lat), lng: parseFloat(first.lon) };
      setPosition(pos);
      setMapTarget({ ...pos, zoom });
    } catch {
      setSearchError("network");
    } finally {
      setIsSearching(false);
    }
  };

  // ── Select a result from the dropdown ────────────────────────────────────
  const selectResult = (result) => {
    const pos = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };
    const zoom = getZoomForResult(result);
    setPosition(pos);
    setMapTarget({ ...pos, zoom });
    setSearchResults([]);
    setSearchQuery(result.display_name);
    setSearchError(null);
  };

  // ── "Use my current location" ─────────────────────────────────────────────
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("unavailable");
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (geoPos) => {
        const pos = {
          lat: geoPos.coords.latitude,
          lng: geoPos.coords.longitude,
        };
        setPosition(pos);
        setMapTarget({ ...pos, zoom: 16 });

        // Reverse geocode for the search label
        const address = await reverseGeocode(pos.lat, pos.lng);
        if (address) setSearchQuery(address);

        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) setGeoError("denied");
        else if (err.code === 2) setGeoError("unavailable");
        else setGeoError("timeout");
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  // ── Clear selected position ───────────────────────────────────────────────
  const clearPosition = () => {
    setPosition(null);
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
    setGeoError(null);
    onChange("");
  };

  // ── Inline error message for geo ────────────────────────────────────────
  const geoErrorMessage = {
    denied:
      "Permission de localisation refusée. Veuillez l'autoriser dans les paramètres de votre navigateur.",
    unavailable: "La localisation n'est pas disponible sur cet appareil.",
    timeout: "La localisation a pris trop de temps. Réessayez.",
  }[geoError];

  // ── Inline error message for search ─────────────────────────────────────
  const searchErrorMessage = {
    no_results: "Aucun résultat pour cette recherche. Essayez un autre terme.",
    network: "Erreur réseau. Vérifiez votre connexion et réessayez.",
  }[searchError];

  return (
    <div className="w-full flex flex-col gap-2">
      {/* ── Search Row ─────────────────────────────────────────── */}
      <div className="flex gap-2">
        {/* Search input + dropdown */}
        <div ref={searchWrapperRef} className="relative flex-1">
          <div className="flex gap-0">
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={15}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch(e);
                  }
                }}
                placeholder="Rechercher: Alger, Oran, Tlemcen…"
                className="w-full pl-10 pr-9 py-2.5 rounded-l-xl border border-gray-200 border-r-0 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearPosition}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Effacer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-r-xl border border-blue-600 transition-colors flex items-center gap-1.5"
            >
              {isSearching ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Search size={15} />
              )}
              <span className="hidden sm:inline">Chercher</span>
            </button>
          </div>

          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-[9999] max-h-52 overflow-y-auto">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectResult(result)}
                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm text-gray-700 border-b border-gray-50 last:border-0 flex items-start gap-2.5 transition-colors"
                >
                  <MapPin
                    size={14}
                    className="text-blue-400 mt-0.5 shrink-0"
                  />
                  <span className="line-clamp-2 leading-snug">
                    {result.display_name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Current location button */}
        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={isLocating}
          title="Utiliser ma position actuelle"
          className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-gray-600 hover:text-blue-600 transition-all flex items-center gap-1.5 shrink-0 text-sm font-medium disabled:opacity-60"
        >
          {isLocating ? (
            <Loader2 size={15} className="animate-spin text-blue-500" />
          ) : (
            <Navigation size={15} />
          )}
          <span className="hidden sm:inline">Ma position</span>
        </button>
      </div>

      {/* ── Error messages ─────────────────────────────────────── */}
      {(searchErrorMessage || geoErrorMessage) && (
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{searchErrorMessage || geoErrorMessage}</span>
        </div>
      )}

      {/* ── Map ────────────────────────────────────────────────── */}
      <div
        className="relative w-full rounded-xl overflow-hidden border border-gray-200"
        style={{ height: `${height}px` }}
      >
        <MapContainer
          center={[defaultCenter.lat, defaultCenter.lng]}
          zoom={initialPos ? 14 : 6}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={position}
            onPositionChange={handlePositionChange}
          />
          <MapController target={mapTarget} />
        </MapContainer>

        {/* Hint overlay when no position is set */}
        {!position && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-100 flex items-center gap-2 pointer-events-none z-[400]">
            <MapPin size={14} className="text-blue-500 shrink-0" />
            <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
              {placeholder}
            </span>
          </div>
        )}

        {/* Locating spinner overlay */}
        {isLocating && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-[500]">
            <div className="bg-white rounded-xl shadow-lg px-5 py-3 flex items-center gap-3 border border-blue-100">
              <Loader2 size={18} className="animate-spin text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                Localisation en cours…
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Coordinates badge ──────────────────────────────────── */}
      {position && (
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
          <CheckCircle2 size={14} className="shrink-0" />
          <span>
            Position confirmée :{" "}
            <strong>
              {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </strong>
          </span>
          <button
            type="button"
            onClick={clearPosition}
            className="ml-auto text-emerald-500 hover:text-emerald-700 transition-colors"
            title="Réinitialiser la position"
          >
            <X size={13} />
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400">
        Cliquez sur la carte ou faites glisser le marqueur pour ajuster la
        position avec précision.
      </p>
    </div>
  );
};

export default LocationSelector;
