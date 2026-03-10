import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import * as AdminService from "../../services/admin.service";

const DEFAULT_CENTER: [number, number] = [-23.55, -46.63];

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function AdminMap() {
  const [items, setItems] = useState<AdminService.AdminCommunityMapItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AdminService.getAdminCommunitiesMap()
      .then(setItems)
      .catch(() => setError("Falha ao carregar comunidades."));
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
        {error}
      </div>
    );
  }

  const center: [number, number] =
    items.length > 0 ? [items[0].latitude, items[0].longitude] : DEFAULT_CENTER;

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-fg">Mapa de comunidades</h1>
      <p className="mb-4 text-sm text-muted">
        {items.length} comunidade(s) com coordenadas.
      </p>
      <div className="relative z-0 isolate overflow-hidden rounded-xl border border-border" style={{ height: 500 }}>
        <MapContainer
          center={center}
          zoom={items.length === 1 ? 12 : 6}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {items.map((c) => (
            <Marker
              key={c.id}
              position={[c.latitude, c.longitude]}
              icon={markerIcon}
            >
              <Popup>
                <span className="font-medium">{c.name}</span>
                <br />
                <span className="text-sm text-muted">{c.membersCount} membro(s)</span>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
