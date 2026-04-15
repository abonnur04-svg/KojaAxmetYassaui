import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { ArrowLeft, Navigation, Volume2, Loader2, MapPin, RotateCcw, Compass, X } from "lucide-react";
import L from "leaflet";
import { useTextToSpeech } from "../hooks/useSpeech";

// Fix leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Fix leaflet default CSS issue with bundlers
import "leaflet/dist/leaflet.css";

const MAUSOLEUM_CENTER = [43.2984, 68.2737];

const POINTS = [
  { id: "entrance", label: "Бас кіреберіс", labelShort: "Кіреберіс", lat: 43.2978, lng: 68.2737, color: "#4ade80", desc: "Кесене аумағына кіретін бас есік. Экскурсиялық маршрут осы жерден басталады." },
  { id: "dome",     label: "Бас күмбез",    labelShort: "Күмбез",    lat: 43.2984, lng: 68.2740, color: "#38bdf8", desc: "Кесененің бас күмбезі — Орталық Азиядағы ең ірілерінің бірі, диаметрі 18,5 метр." },
  { id: "tomb",     label: "Яссауи зираты", labelShort: "Зират",     lat: 43.2986, lng: 68.2735, color: "#f59e0b", desc: "Қожа Ахмет Яссауидің зираты — қасиетті қажылық орны." },
  { id: "museum",   label: "Мұражай",       labelShort: "Мұражай",   lat: 43.2981, lng: 68.2730, color: "#c084fc", desc: "XIV–XIX ғасырлардағы тарихи артефактілер жинағы бар кесене мұражайы." },
  { id: "kazanlyk", label: "Қазандық залы", labelShort: "Қазандық",  lat: 43.2984, lng: 68.2737, color: "#fb923c", desc: "Салмағы шамамен 2 тонна болатын алып қола қазан орналасқан орталық зал." },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getBearing(lat1, lng1, lat2, lng2) {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function bearingToKz(deg) {
  if (deg < 22.5 || deg >= 337.5) return "солтүстікке";
  if (deg < 67.5) return "солтүстік-шығысқа";
  if (deg < 112.5) return "шығысқа";
  if (deg < 157.5) return "оңтүстік-шығысқа";
  if (deg < 202.5) return "оңтүстікке";
  if (deg < 247.5) return "оңтүстік-батысқа";
  if (deg < 292.5) return "батысқа";
  return "солтүстік-батысқа";
}

function relativeDirection(targetBearing, heading) {
  if (heading === null) return bearingToKz(targetBearing);
  let diff = targetBearing - heading;
  if (diff < -180) diff += 360;
  if (diff > 180) diff -= 360;
  if (diff > -30 && diff < 30) return "тікелей алға";
  if (diff >= 30 && diff < 90) return "оңға бұрылыңыз";
  if (diff >= 90 && diff < 150) return "оңға, кейін артқа";
  if (diff >= 150 || diff <= -150) return "артқа бұрылыңыз";
  if (diff <= -30 && diff > -90) return "солға бұрылыңыз";
  return "солға, кейін артқа";
}

function computeNearest(latlng, heading) {
  let minDist = Infinity;
  let nearest = null;
  for (const p of POINTS) {
    const d = getDistance(latlng[0], latlng[1], p.lat, p.lng);
    if (d < minDist) { minDist = d; nearest = p; }
  }
  if (!nearest) return null;
  const bearing = getBearing(latlng[0], latlng[1], nearest.lat, nearest.lng);
  const dir = relativeDirection(bearing, heading);
  return { point: nearest, dist: Math.round(minDist), dir, bearing };
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function createColoredIcon(color, size = 14) {
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const userIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 6px rgba(59,130,246,0.25);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// ─── Sub-components ─────────────────────────────────────────────────────────

function MapCenterOnce() {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (!done.current) {
      done.current = true;
      map.setView(MAUSOLEUM_CENTER, 18);
    }
  }, [map]);
  return null;
}

function GeoLayer({ onLocationRef }) {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      onLocationRef.current?.(null);
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const latlng = [position.coords.latitude, position.coords.longitude];
        setPos(latlng);
        onLocationRef.current?.(latlng);
      },
      (err) => {
        console.warn("Geo error:", err.message);
        onLocationRef.current?.(null);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!pos) return null;
  return (
    <>
      <Marker position={pos} icon={userIcon} />
      <Circle center={pos} radius={12} color="#3b82f6" fillColor="#3b82f6" fillOpacity={0.2} weight={1} />
    </>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function MapPage() {
  const navigate = useNavigate();
  const { speakStream, stop } = useTextToSpeech();

  const urlParams = new URLSearchParams(window.location.search);
  const isBlindMode = urlParams.get("blind") === "1";
  const isAssisted = isBlindMode;

  const [userLocation, setUserLocation] = useState(null);
  const [nearestInfo, setNearestInfo] = useState(null);
  const [locating, setLocating] = useState(true);
  const [geoError, setGeoError] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [heading, setHeading] = useState(null);
  const [compassAvailable, setCompassAvailable] = useState(false);

  const headingRef = useRef(null);
  const userLocationRef = useRef(null);
  const announcedRef = useRef(false);
  const locatingRef = useRef(true);
  const onLocationRef = useRef(null);
  // Keep speakStream in a ref so stable callbacks can access latest version
  const speakStreamRef = useRef(speakStream);
  useEffect(() => { speakStreamRef.current = speakStream; }, [speakStream]);
  const stopRef = useRef(stop);
  useEffect(() => { stopRef.current = stop; }, [stop]);

  useEffect(() => { userLocationRef.current = userLocation; }, [userLocation]);

  // ── Compass ──────────────────────────────────────────────────────────────
  useEffect(() => {
    function handleOrientation(e) {
      const h = e.webkitCompassHeading ?? (e.alpha != null ? (360 - e.alpha) : null);
      if (h !== null) {
        headingRef.current = h;
        setHeading(Math.round(h));
        setCompassAvailable(true);
      }
    }
    if (typeof DeviceOrientationEvent === "undefined") return;
    if (typeof DeviceOrientationEvent.requestPermission !== "function") {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }
    return () => window.removeEventListener("deviceorientation", handleOrientation, true);
  }, []);

  // ── Stable location callback ──────────────────────────────────────────────
  onLocationRef.current = (latlng) => {
    if (!latlng) {
      if (locatingRef.current) {
        locatingRef.current = false;
        setLocating(false);
        setGeoError(true);
      }
      return;
    }
    locatingRef.current = false;
    setLocating(false);
    setGeoError(false);
    setUserLocation(latlng);

    const info = computeNearest(latlng, headingRef.current);
    setNearestInfo(info);

    if (isAssisted && !announcedRef.current && info) {
      announcedRef.current = true;
      stopRef.current();
      speakStreamRef.current(
        `Ең жақын нысан — ${info.point.label}. Қашықтығы ${info.dist} метр. ${info.dir}. ${info.point.desc}`
      );
    }
  };

  // ── Fallback timeout ──────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      if (locatingRef.current) {
        locatingRef.current = false;
        setLocating(false);
        setGeoError(true);
      }
    }, 10000);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Recompute direction when compass heading changes ──────────────────────
  useEffect(() => {
    if (!isAssisted || !userLocation) return;
    const info = computeNearest(userLocation, heading);
    setNearestInfo(info);
  }, [heading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Initial TTS ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (isBlindMode) speakStream("Кесене картасы ашылды. Орналасқан жеріңізді анықтауда.");
    return () => stop();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ───────────────────────────────────────────────────────────────
  const announceNearest = useCallback(() => {
    stopRef.current();
    const loc = userLocationRef.current;
    if (!loc) { speakStreamRef.current("Орналасқан жеріңіз анықталған жоқ."); return; }
    const info = computeNearest(loc, headingRef.current);
    if (!info) return;
    speakStreamRef.current(`${info.point.label}. Қашықтық: ${info.dist} метр. Бағыт: ${info.dir}. ${info.point.desc}`);
  }, []);

  const announceAll = useCallback(() => {
    stopRef.current();
    const loc = userLocationRef.current;
    if (!loc) {
      const names = POINTS.map(p => p.label).join(", ");
      speakStreamRef.current("Кесене нысандары: " + names + ". Қашықтықты анықтау үшін геолокацияны қосыңыз.");
      return;
    }
    const parts = POINTS.map((p) => {
      const d = Math.round(getDistance(loc[0], loc[1], p.lat, p.lng));
      const bear = getBearing(loc[0], loc[1], p.lat, p.lng);
      const dir = relativeDirection(bear, headingRef.current);
      return `${p.label}: ${d} метр, ${dir}`;
    });
    speakStreamRef.current("Кесене нысандары. " + parts.join(". "));
  }, []);

  const refreshNearest = useCallback(() => {
    stopRef.current();
    const loc = userLocationRef.current;
    if (!loc) return;
    const info = computeNearest(loc, headingRef.current);
    setNearestInfo(info);
    if (info) speakStreamRef.current(`${info.point.label}. ${info.dist} метр. ${info.dir}.`);
  }, []);

  const requestCompassPermission = useCallback(async () => {
    if (typeof DeviceOrientationEvent?.requestPermission === "function") {
      try {
        const result = await DeviceOrientationEvent.requestPermission();
        if (result === "granted") {
          window.addEventListener("deviceorientation", (e) => {
            const h = e.webkitCompassHeading ?? (e.alpha != null ? (360 - e.alpha) : null);
            if (h !== null) { headingRef.current = h; setHeading(Math.round(h)); setCompassAvailable(true); }
          }, true);
        }
      } catch (e) {
        console.warn("Compass permission denied", e);
      }
    }
  }, []);

  const handlePointClick = useCallback((p) => {
    setSelectedPoint(p);
    if (isAssisted) {
      stopRef.current();
      const loc = userLocationRef.current;
      const distText = loc ? `. Қашықтық: ${Math.round(getDistance(loc[0], loc[1], p.lat, p.lng))} метр` : "";
      speakStreamRef.current(`${p.label}${distText}. ${p.desc}`);
    }
  }, [isAssisted]);

  const handleBack = useCallback(() => {
    stop();
    navigate(-1);
  }, [navigate, stop]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: "#0B1120" }}>
      {/* Header — dark navy */}
      <div
        className="flex items-center gap-3 px-5 py-4 z-[1000] flex-shrink-0"
        style={{ background: "#0F172A", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={handleBack}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl active:scale-95 transition-all"
          style={{ background: "#1E293B", boxShadow: "0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)" }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "#F8FAFC" }} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[17px] font-bold font-heading truncate" style={{ color: "#F8FAFC" }}>Кесене картасы</h1>
          <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
            {isBlindMode ? "Аудио-навигация қосулы" : "Интерактивті карта"}
            {compassAvailable && " · 🧭 компас"}
          </p>
        </div>

        {typeof DeviceOrientationEvent?.requestPermission === "function" && !compassAvailable && (
          <button
            onClick={requestCompassPermission}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl active:scale-95 transition-all"
            style={{ background: "#1E293B", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
            title="Компасты қосу"
          >
            <Compass className="w-5 h-5" style={{ color: "#94A3B8" }} />
          </button>
        )}

        {isAssisted && (
          <button
            onClick={announceNearest}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl active:scale-95 transition-all"
            style={{ background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.25)", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
          >
            <Volume2 className="w-5 h-5" style={{ color: "#38BDF8" }} />
          </button>
        )}
      </div>

      {/* Map container */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        <MapContainer
          center={MAUSOLEUM_CENTER}
          zoom={18}
          style={{ width: "100%", height: "100%" }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <MapCenterOnce />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>'
            subdomains="abcd"
            maxZoom={20}
          />
          {POINTS.map((p) => (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={createColoredIcon(p.color, selectedPoint?.id === p.id ? 22 : 14)}
              eventHandlers={{ click: () => handlePointClick(p) }}
            >
              <Popup>
                <div style={{ minWidth: 180, padding: 2, fontFamily: "inherit" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: "#1E293B" }}>{p.label}</div>
                  <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.5 }}>{p.desc}</div>
                  {userLocation && (
                    <div style={{ fontSize: 11, color: "#38BDF8", marginTop: 6, fontWeight: 500 }}>
                      📍 {Math.round(getDistance(userLocation[0], userLocation[1], p.lat, p.lng))} м
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
          <GeoLayer onLocationRef={onLocationRef} />
        </MapContainer>

        {/* Loading overlay */}
        {locating && (
          <div className="absolute inset-0 flex items-center justify-center z-[500] pointer-events-none" style={{ background: "rgba(11,17,32,0.85)", backdropFilter: "blur(6px)" }}>
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" style={{ color: "#38BDF8" }} />
              <p className="text-base font-medium" style={{ color: "#F8FAFC" }}>Орналасқан жер анықталуда...</p>
              <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>Картаны пайдалануға болады</p>
            </div>
          </div>
        )}

        {/* Legend */}
        <div
          className="absolute top-3 right-3 z-[400]"
          style={{
            background: "#0F172A",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: "14px 16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            minWidth: 130,
            maxWidth: 160,
          }}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider mb-2.5" style={{ color: "#94A3B8", letterSpacing: "0.08em" }}>Нысандар</p>
          <div className="space-y-0.5">
            {POINTS.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePointClick(p)}
                className="flex items-center gap-2.5 w-full text-left transition-all"
                style={{
                  padding: "6px 8px",
                  borderRadius: 10,
                  background: selectedPoint?.id === p.id ? "rgba(255,255,255,0.08)" : "transparent",
                }}
              >
                <div className="flex-shrink-0" style={{ width: 10, height: 10, borderRadius: "50%", background: p.color, boxShadow: `0 0 6px ${p.color}44` }} />
                <span className="text-[13px] font-medium" style={{ color: selectedPoint?.id === p.id ? "#F8FAFC" : "#CBD5E1" }}>{p.labelShort}</span>
              </button>
            ))}
            <div
              className="flex items-center gap-2.5"
              style={{ padding: "6px 8px", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 4, paddingTop: 10 }}
            >
              <div className="flex-shrink-0" style={{ width: 10, height: 10, borderRadius: "50%", background: "#3B82F6", boxShadow: "0 0 0 3px rgba(59,130,246,0.25)" }} />
              <span className="text-[13px] font-medium" style={{ color: "#CBD5E1" }}>Сіз</span>
            </div>
          </div>
        </div>

        {/* Geo error banner */}
        {geoError && !locating && !isAssisted && (
          <div
            className="absolute bottom-4 left-4 right-4 z-[400] flex items-start gap-3"
            style={{
              background: "#0F172A",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: "14px 16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#94A3B8" }} />
            <p className="text-sm leading-snug" style={{ color: "#94A3B8" }}>
              Геолокация анықталмады. Картаны қолмен шарлауға болады.
            </p>
          </div>
        )}
      </div>

      {/* Bottom panel */}
      {isAssisted ? (
        <div
          className="flex-shrink-0 space-y-2.5"
          style={{
            background: "#0F172A",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "16px 20px 20px",
            borderRadius: "20px 20px 0 0",
          }}
        >
          {selectedPoint ? (
            <div
              className="flex items-start gap-3"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${selectedPoint.color}33`,
                borderRadius: 14,
                padding: "14px 16px",
              }}
            >
              <div className="flex-shrink-0 mt-1" style={{ width: 12, height: 12, borderRadius: "50%", background: selectedPoint.color, boxShadow: `0 0 8px ${selectedPoint.color}66` }} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base leading-tight" style={{ color: "#F8FAFC" }}>{selectedPoint.label}</p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: "#94A3B8" }}>{selectedPoint.desc}</p>
                {userLocation && (
                  <p className="text-xs mt-1.5 font-medium" style={{ color: "#22D3EE" }}>
                    📍 {Math.round(getDistance(userLocation[0], userLocation[1], selectedPoint.lat, selectedPoint.lng))} м
                    {nearestInfo?.point.id === selectedPoint.id && " — ең жақын"}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedPoint(null)}
                className="p-1.5 flex-shrink-0 active:scale-95 transition-all"
                style={{ background: "#1E293B", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <X className="w-3.5 h-3.5" style={{ color: "#94A3B8" }} />
              </button>
            </div>
          ) : nearestInfo ? (
            <div
              className="flex items-center gap-3"
              style={{
                background: "rgba(56,189,248,0.08)",
                border: "1px solid rgba(56,189,248,0.15)",
                borderRadius: 14,
                padding: "14px 16px",
              }}
            >
              <Navigation className="w-5 h-5 flex-shrink-0" style={{ color: "#38BDF8" }} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base leading-tight truncate" style={{ color: "#F8FAFC" }}>{nearestInfo.point.label}</p>
                <p className="text-sm font-medium" style={{ color: "#38BDF8" }}>{nearestInfo.dir}</p>
                <p className="text-xs" style={{ color: "#94A3B8" }}>{nearestInfo.dist} метр</p>
              </div>
              <button
                onClick={refreshNearest}
                className="p-2 flex-shrink-0 active:scale-95 transition-all"
                style={{ background: "#1E293B", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <RotateCcw className="w-4 h-4" style={{ color: "#94A3B8" }} />
              </button>
            </div>
          ) : (
            <div style={{ background: "#1E293B", borderRadius: 14, padding: "14px 16px", textAlign: "center" }}>
              <p className="text-sm" style={{ color: "#94A3B8" }}>
                {geoError ? "Геолокация анықталмады" : "Орналасқан жер анықталуда..."}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={announceNearest}
              className="font-semibold text-sm active:scale-[0.97] transition-all"
              style={{
                background: "rgba(56,189,248,0.12)",
                border: "1px solid rgba(56,189,248,0.2)",
                borderRadius: 14,
                padding: "14px 0",
                color: "#38BDF8",
              }}
            >
              🔊 Ең жақыны
            </button>
            <button
              onClick={announceAll}
              className="font-semibold text-sm active:scale-[0.97] transition-all"
              style={{
                background: "#1E293B",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14,
                padding: "14px 0",
                color: "#F8FAFC",
              }}
            >
              📋 Барлық нысандар
            </button>
          </div>
        </div>
      ) : selectedPoint ? (
        <div
          className="flex-shrink-0"
          style={{
            background: "#0F172A",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "18px 20px 22px",
            borderRadius: "20px 20px 0 0",
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1.5" style={{ width: 12, height: 12, borderRadius: "50%", background: selectedPoint.color, boxShadow: `0 0 8px ${selectedPoint.color}66` }} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg leading-tight" style={{ color: "#F8FAFC" }}>{selectedPoint.label}</p>
              <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "#94A3B8" }}>{selectedPoint.desc}</p>
              {userLocation && (
                <p className="text-sm mt-2 font-medium" style={{ color: "#22D3EE" }}>
                  📍 {Math.round(getDistance(userLocation[0], userLocation[1], selectedPoint.lat, selectedPoint.lng))} м
                  {nearestInfo?.point.id === selectedPoint.id && ` — ${nearestInfo.dir}`}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedPoint(null)}
              className="flex-shrink-0 flex items-center justify-center active:scale-95 transition-all"
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "#1E293B",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <X className="w-4 h-4" style={{ color: "#94A3B8" }} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
