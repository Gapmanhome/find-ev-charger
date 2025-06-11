'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Marker,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import StationPanel from './StationPanel';

L.Icon.Default.mergeOptions({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
});

type Cluster = {
  id?: number;
  properties: { cluster?: boolean; point_count?: number };
  geometry: { coordinates: [number, number] };
};

const MAP_CENTER: [number, number] = [59, -96];
const MAP_ZOOM = 4;

export default function MapView() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const mapRef = useRef<L.Map>(null);

  function fetchClusters() {
    const map = mapRef.current;
    if (!map) return;
    const b = map.getBounds();
    const sw = b.getSouthWest();
    const ne = b.getNorthEast();
    const url = `/api/clusters?sw=${sw.lat},${sw.lng}&ne=${ne.lat},${ne.lng}&z=${map.getZoom()}`;
    fetch(url)
      .then(r => r.json())
      .then(setClusters)
      .catch(console.error);
  }

  useEffect(() => {
    fetchClusters(); // initial load
  }, []);

  useMapEvents({
    moveend: fetchClusters,
    zoomend: fetchClusters,
  });

  return (
    <>
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        whenCreated={m => (mapRef.current = m)}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {clusters.map((c, i) =>
          c.properties.cluster ? (
            <CircleMarker
              key={i}
              center={[c.geometry.coordinates[1], c.geometry.coordinates[0]]}
              radius={18}
              pathOptions={{ color: '#1976d2', weight: 1, fillOpacity: 0.6 }}
              eventHandlers={{
                click: () => {
                  mapRef.current?.flyTo(
                    [c.geometry.coordinates[1], c.geometry.coordinates[0]],
                    mapRef.current.getZoom() + 2
                  );
                },
              }}
            >
              <text
                x={0}
                y={0}
                textAnchor="middle"
                dy=".3em"
                style={{ fill: 'white', fontSize: '12px' }}
              >
                {c.properties.point_count}
              </text>
            </CircleMarker>
          ) : (
            <Marker
              key={c.id}
              position={[
                c.geometry.coordinates[1],
                c.geometry.coordinates[0],
              ]}
              eventHandlers={{ click: () => setSelected(c.id ?? null) }}
            />
          )
        )}
      </MapContainer>

      <StationPanel stationId={selected} onClose={() => setSelected(null)} />
    </>
  );
}




