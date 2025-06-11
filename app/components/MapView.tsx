'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
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
  const mapRef = useRef<L.Map | null>(null);

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

  /* initial fetch once map is ready */
  useEffect(() => {
    fetchClusters();
  }, []);

  /* refetch on pan / zoom */
  useMapEvents({ moveend: fetchClusters, zoomend: fetchClusters });

  return (
    <>
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        ref={mapRef}
        whenReady={() => fetchClusters()}  {/* no arguments = no TS error */}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {clusters.map((c, i) =>
          c.properties.cluster ? (
            <Marker
              key={i}
              position={[c.geometry.coordinates[1], c.geometry.coordinates[0]]}
              icon={L.divIcon({
                className: 'cluster-bubble',
                html: `<div>${c.properties.point_count}</div>`,
                iconSize: [30, 30],
              })}
              eventHandlers={{
                click: () => {
                  mapRef.current?.flyTo(
                    [c.geometry.coordinates[1], c.geometry.coordinates[0]],
                    mapRef.current.getZoom() + 2
                  );
                },
              }}
            />
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








