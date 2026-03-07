import { useCallback, useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: [number, number] = [-23.55, -46.63];

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationMapPickerProps {
  /** Centro inicial do mapa. */
  center?: [number, number];
  /** Posição inicial do pin (se undefined, usa center). */
  initialPosition?: [number, number] | null;
  /** Callback quando o usuário solta o pin (lat, lng). */
  onPositionChange: (lat: number, lng: number) => void;
  /** Altura do mapa em pixels. */
  height?: number;
}

function DraggableMarker({
  position,
  onPositionChange,
}: {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}) {
  const [pos, setPos] = useState<[number, number]>(position);
  useEffect(() => {
    setPos(position);
  }, [position[0], position[1]]);

  const eventHandlers = useCallback(
    (e: { target: { getLatLng: () => LatLng } }) => {
      const ll = e.target.getLatLng();
      const next: [number, number] = [ll.lat, ll.lng];
      setPos(next);
      onPositionChange(next[0], next[1]);
    },
    [onPositionChange]
  );

  return (
    <Marker
      position={pos}
      icon={markerIcon}
      eventHandlers={{ dragend: eventHandlers }}
      draggable
    />
  );
}

function MapClickHandler({
  onPositionChange,
  setMarkerPosition,
}: {
  onPositionChange: (lat: number, lng: number) => void;
  setMarkerPosition: (p: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      onPositionChange(lat, lng);
    },
  });
  return null;
}

export function LocationMapPicker({
  center = DEFAULT_CENTER,
  initialPosition = null,
  onPositionChange,
  height = 280,
}: LocationMapPickerProps) {
  const [markerPosition, setMarkerPosition] = useState<[number, number]>(
    initialPosition ?? center
  );

  useEffect(() => {
    const [lat, lng] = initialPosition ?? center;
    onPositionChange(lat, lng);
  }, []);

  useEffect(() => {
    if (initialPosition != null) {
      setMarkerPosition(initialPosition);
    }
  }, [initialPosition?.[0], initialPosition?.[1]]);

  return (
    <div className="relative z-0 isolate overflow-hidden rounded-xl border border-border" style={{ height }}>
      <MapContainer
        center={markerPosition}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onPositionChange={onPositionChange} setMarkerPosition={setMarkerPosition} />
        <DraggableMarker position={markerPosition} onPositionChange={onPositionChange} />
      </MapContainer>
    </div>
  );
}
