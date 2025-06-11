'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Marker,
  useMap,
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
  id?: number;           // present on single pins
  properties: {
    cluster?: boolean;
    point_count?: number;
  };
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

  function BoundsWatcher() {
    const map = useMapEvents({
      moveend: fetchClusters,
      zoomend: fetchClusters,
    });
    useEffect(fetchClusters, []); // first load
    return null;
  }

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
        <BoundsWatcher />

        {clusters.map((c, i) =>
          c.properties.cluster ? (
            <CircleMarker
              key={i}
              center={[c.geometry.coordinates[1], c.geometry.coordinates[0]]}
              radius={20}
              pathOptions={{ color: '#1976d2', fillOpacity: 0.6 }}
              eventHandlers={{
                click: () => {
                  const map = mapRef.current;
                  if (map) map.flyTo([c.geometry.coordinates[1], c.geometry.coordinates[0]], map.getZoom() + 2);
                },
              }}
            >
              <div
                style={{
                  color: 'white',
                  fontSize: '12px',
                  textAlign: 'center',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {c.properties.point_count}
              </div>
            </CircleMarker>
          ) : (
            <Marker
              key={c.id}
              position={[c.geometry.coordinates[1], c.geometry.coordinates[0]]}
              eventHandlers={{ click: () => setSelected(c.id ?? null) }}
            />
          )
        )}
      </MapContainer>

      <StationPanel
        stationId={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}











