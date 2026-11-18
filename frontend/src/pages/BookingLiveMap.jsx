import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { ArrowLeft, LocateFixed, MapPin, Users } from "lucide-react";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_DEV_URL;

const workerIcon = L.divIcon({
  className: "booking-live-marker",
  html: '<div style="width:20px;height:20px;border:4px solid white;border-radius:50%;background:#2563eb;box-shadow:0 1px 8px #334155"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const homeIcon = L.divIcon({
  className: "booking-home-marker",
  html: '<div style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;border:3px solid white;border-radius:50%;background:#16a34a;color:white;font-size:17px;box-shadow:0 1px 8px #334155">⌂</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

function DynamicRouting({ worker, customer }) {
  const map = useMap();
  const controlRef = useRef(null);
  const lastWorkerRef = useRef(null);

  useEffect(() => {
    if (!worker || !customer) return;
    const start = L.latLng(worker.latitude, worker.longitude);
    const end = L.latLng(customer.latitude, customer.longitude);
    const shouldUpdate = !lastWorkerRef.current ||
      map.distance(lastWorkerRef.current, start) > 35;
    if (!shouldUpdate) return;

    if (!controlRef.current) {
      controlRef.current = L.Routing.control({
        waypoints: [start, end],
        routeWhileDragging: false,
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        createMarker: () => null,
        lineOptions: { styles: [{ color: "#2563eb", opacity: 0.9, weight: 6 }] }
      }).addTo(map);
    } else {
      controlRef.current.setWaypoints([start, end]);
    }
    lastWorkerRef.current = start;
  }, [map, worker, customer]);

  useEffect(() => () => {
    if (controlRef.current) map.removeControl(controlRef.current);
    controlRef.current = null;
  }, [map]);

  return null;
}

function MapViewport({ worker, customer, followMode, isWorker }) {
  const map = useMap();
  const initialViewSetRef = useRef(false);
  useEffect(() => {
    if (followMode && isWorker && worker) {
      map.panTo([worker.latitude, worker.longitude], { animate: true });
    }
  }, [map, worker, followMode, isWorker]);

  useEffect(() => {
    if (initialViewSetRef.current) return;
    if (worker && customer) {
      map.fitBounds([
        [worker.latitude, worker.longitude],
        [customer.latitude, customer.longitude]
      ], { padding: [55, 55], maxZoom: 16 });
      initialViewSetRef.current = true;
    } else if (worker) {
      map.setView([worker.latitude, worker.longitude], 15);
      initialViewSetRef.current = true;
    } else if (customer) {
      map.setView([customer.latitude, customer.longitude], 15);
      initialViewSetRef.current = true;
    }
  }, [map, worker, customer]);

  return null;
}

export default function BookingLiveMap() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const watchIdRef = useRef(null);
  const socketRef = useRef(null);
  const [role, setRole] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [workerInitialLocation, setWorkerInitialLocation] = useState(null);
  const [workerLiveLocation, setWorkerLiveLocation] = useState(null);
  const [followMode, setFollowMode] = useState(false);
  const [status, setStatus] = useState("Connecting to booking...");
  const [error, setError] = useState("");

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"]
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("booking-map:join", { bookingId }, response => {
        if (!response?.success) {
          setStatus("Live map unavailable");
          setError(response?.message || "Unable to access this booking map.");
          return;
        }

        setRole(response.role);
        setCustomerLocation(response.customerLocation || null);
        setWorkerInitialLocation(response.workerInitialLocation || null);
        setWorkerLiveLocation(response.workerLiveLocation || null);
        setStatus(response.role === "worker"
          ? "Your live location will be shared with the customer"
          : "Waiting for the worker's live location");

        // Only the assigned worker shares device GPS. The customer uses
        // the saved booking address as a fixed destination.
        if (response.role === "worker") {
          if (!navigator.geolocation) {
            setError("Your browser does not support GPS location.");
            return;
          }

          watchIdRef.current = navigator.geolocation.watchPosition(
            position => {
              const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              };
              setWorkerLiveLocation(location);
              setStatus("Your live location is being shared");
              socket.emit("booking-map:location", { bookingId, ...location }, result => {
                if (result && !result.success) setError(result.message);
              });
            },
            geoError => setError(geoError.code === 1
              ? "Allow location permission so the customer can track your arrival."
              : "Unable to get GPS location. Check your device location settings."),
            { enableHighAccuracy: true, maximumAge: 4000, timeout: 20000 }
          );
        }
      });
    });

    socket.on("connect_error", err => {
      setStatus("Connection failed");
      setError(err.message || "Live map connection failed.");
    });
    socket.on("booking-map:worker-location", location => {
      setWorkerLiveLocation(location);
      setStatus("Worker location is updating live");
    });

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      socket.emit("booking-map:leave");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [bookingId]);

  const workerLocation = workerLiveLocation || workerInitialLocation;
  const isWorker = role === "worker";
  const center = workerLocation
    ? [workerLocation.latitude, workerLocation.longitude]
    : customerLocation
      ? [customerLocation.latitude, customerLocation.longitude]
      : [28.6139, 77.2090];

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

      <main className="mx-auto max-w-7xl p-3 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-3">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-2 text-black"><span className="h-3 w-3 rounded-full bg-blue-600" /> Worker location</span>
            <span className="flex items-center gap-2 text-black"><span className="h-3 w-3 rounded-full bg-green-600" /> Customer home</span>
          </div>
          {isWorker && (
            <button onClick={() => setFollowMode(value => !value)} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              <LocateFixed size={16} /> {followMode ? "Stop Following" : "Follow Me"}
            </button>
          )}
        </div>

        {error && <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{error}</div>}

        <div className="h-[72vh] min-h-105 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {workerLocation && (
              <Marker position={[workerLocation.latitude, workerLocation.longitude]} icon={workerIcon}>
                <Popup>{workerLiveLocation ? "Worker's current location" : "Worker's saved starting location"}</Popup>
              </Marker>
            )}
            {customerLocation && (
              <Marker position={[customerLocation.latitude, customerLocation.longitude]} icon={homeIcon}>
                <Popup>Customer's saved service location</Popup>
              </Marker>
            )}
            <MapViewport worker={workerLocation} customer={customerLocation} followMode={followMode} isWorker={isWorker} />
            {workerLocation && customerLocation && (
              <DynamicRouting worker={workerLocation} customer={customerLocation} />
            )}
          </MapContainer>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <Users size={16} />
          {workerLiveLocation
            ? "Worker's live location is available on both maps."
            : "Showing the worker's saved location until live GPS starts."}
        </div>
        {!customerLocation && (
          <p className="mt-2 text-sm text-rose-600">
            Customer saved location is missing for this booking. A route cannot be shown.
          </p>
        )}
      </main>
    </div>
  );
}
