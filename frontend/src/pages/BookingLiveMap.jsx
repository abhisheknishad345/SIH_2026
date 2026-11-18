import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { ArrowLeft, LocateFixed, MapPin, Navigation, Users } from "lucide-react";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_DEV_URL;

const myIcon = L.divIcon({
  className: "booking-live-marker",
  html: '<div style="width:18px;height:18px;border:4px solid white;border-radius:50%;background:#2563eb;box-shadow:0 1px 8px #334155"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

const peerIcon = L.divIcon({
  className: "booking-live-marker",
  html: '<div style="width:18px;height:18px;border:4px solid white;border-radius:50%;background:#16a34a;box-shadow:0 1px 8px #334155"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

function DynamicRouting({ start, end }) {
  const map = useMap();
  const controlRef = useRef(null);
  const lastRouteRef = useRef(null);

  useEffect(() => {
    if (!start || !end) return;
    const startPoint = L.latLng(start.latitude, start.longitude);
    const endPoint = L.latLng(end.latitude, end.longitude);
    const shouldRefresh = !lastRouteRef.current ||
      map.distance(lastRouteRef.current.start, startPoint) > 40 ||
      map.distance(lastRouteRef.current.end, endPoint) > 40;
    if (!shouldRefresh) return;

    if (!controlRef.current) {
      controlRef.current = L.Routing.control({
        waypoints: [startPoint, endPoint],
        routeWhileDragging: false,
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        createMarker: () => null,
        lineOptions: { styles: [{ color: "#2563eb", opacity: 0.85, weight: 6 }] }
      }).addTo(map);
    } else {
      controlRef.current.setWaypoints([startPoint, endPoint]);
    }
    lastRouteRef.current = { start: startPoint, end: endPoint };
  }, [map, start, end]);

  useEffect(() => () => {
    if (controlRef.current) map.removeControl(controlRef.current);
    controlRef.current = null;
  }, [map]);

  return null;
}

function MapViewport({ me, peer, followMode }) {
  const map = useMap();
  useEffect(() => {
    if (followMode && me) map.panTo([me.latitude, me.longitude], { animate: true });
  }, [map, me, followMode]);
  useEffect(() => {
    if (me && peer) {
      map.fitBounds([
        [me.latitude, me.longitude],
        [peer.latitude, peer.longitude]
      ], { padding: [55, 55], maxZoom: 16 });
    } else if (me) {
      map.setView([me.latitude, me.longitude], 16);
    }
  }, [map, me, peer]);
  return null;
}

export default function BookingLiveMap() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const [myPosition, setMyPosition] = useState(null);
  const [peerPosition, setPeerPosition] = useState(null);
  const [followMode, setFollowMode] = useState(false);
  const [status, setStatus] = useState("Connecting...");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Your browser does not support location sharing.");
      return;
    }

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"]
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("booking-map:join", { bookingId }, response => {
        if (!response?.success) {
          setError(response?.message || "Unable to join live map.");
          setStatus("Live map unavailable");
          return;
        }
        setStatus("Connected — sharing your location");
        if (response.peerLocation) setPeerPosition(response.peerLocation);
        watchIdRef.current = navigator.geolocation.watchPosition(
          position => {
            const location = { latitude: position.coords.latitude, longitude: position.coords.longitude };
            setMyPosition(location);
            setStatus("Live location active");
            socket.emit("booking-map:location", { bookingId, ...location }, result => {
              if (result && !result.success) setError(result.message);
            });
          },
          geoError => setError(geoError.code === 1
            ? "Location permission denied. Allow location access in your browser."
            : "Unable to get your location. Check GPS and try again."),
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
        );
      });
    });
    socket.on("connect_error", err => setError(err.message || "Live map connection failed."));
    socket.on("booking-map:peer-location", location => setPeerPosition(location));

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      socket.emit("booking-map:leave");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [bookingId]);

  const center = myPosition
    ? [myPosition.latitude, myPosition.longitude]
    : [28.6139, 77.2090];

  if (error && !myPosition && status === "Live map unavailable") {
    return <div className="min-h-screen p-6 text-center"><p className="text-rose-600">{error}</p><button onClick={() => navigate(-1)} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white">Go Back</button></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between gap-3 border-b bg-white px-4 py-3">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="text-right">
          <h1 className="font-bold text-slate-900">Live Booking Map</h1>
          <p className="text-xs text-slate-500">{status}</p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-3 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-600" /> You</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-green-600" /> Other participant</span>
          </div>
          <button onClick={() => setFollowMode(value => !value)} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            <LocateFixed size={16} /> {followMode ? "Stop Following" : "Follow Me"}
          </button>
        </div>

        {error && <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{error}</div>}

        <div className="h-[68vh] min-h-[420px] overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {myPosition && <Marker position={[myPosition.latitude, myPosition.longitude]} icon={myIcon}><Popup>You are here</Popup></Marker>}
            {peerPosition && <Marker position={[peerPosition.latitude, peerPosition.longitude]} icon={peerIcon}><Popup>Other participant</Popup></Marker>}
            <MapViewport me={myPosition} peer={peerPosition} followMode={followMode} />
            {myPosition && peerPosition && <DynamicRouting start={myPosition} end={peerPosition} />}
          </MapContainer>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <Users size={16} />
          {peerPosition ? "Both participants are sharing live location." : "Waiting for the other participant to share location..."}
        </div>
      </div>
    </div>
  );
}
