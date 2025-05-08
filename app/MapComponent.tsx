"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationMarker({
  setLatLng,
}: {
  setLatLng: (latlng: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      setLatLng(e.latlng);
    },
  });
  return null;
}

export default function MapComponent({
  latLng,
  setLatLng,
  currentLocation,
}: {
  latLng: { lat: number; lng: number } | null;
  setLatLng: (latlng: { lat: number; lng: number }) => void;
  currentLocation: { lat: number; lng: number } | null;
}) {
  return (
    <div className="h-64 w-full">
      <MapContainer
        center={
          currentLocation
            ? [currentLocation.lat, currentLocation.lng]
            : [20, 78]
        }
        zoom={currentLocation ? 12 : 4}
        className="h-full w-full rounded-md"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {latLng && <Marker position={[latLng.lat, latLng.lng]} />}
        <LocationMarker setLatLng={setLatLng} />
      </MapContainer>
    </div>
  );
}
