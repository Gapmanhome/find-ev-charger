------ START COPY ------
'use client';

import { useRef, useState, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from 'react-leaflet';
import L, { LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import StationPanel from './StationPanel';

L.Icon.Default.mergeOptions({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
});

type Cluster = {
  id?: number;
  properties: { cluster?: boolean; point_count?: number; stationId?: number };
  geometry: { coordinates: [number, number] };
};

const MAP_CENTER: [number, number] = [59, -96];
const MAP_ZOOM = 4;

export default function MapView() {
  const mapRef = useRef<L.Map | null>(null);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  /* fetch clusters for the current map view */
  const fetchClusters = useCallback(async () => {
    const map = mapRef.current;
    if (!map) return;

    const b: LatLngBounds = map.getBounds();
    const url = `/api/clusters?sw=${b.getSouth()},${b.getWest()}&ne=${b.getNorth()},${b.getEast()}&z=${map.getZoom()}`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      setClusters(json);
    } catch (err) {
      console.error('Failed to load clusters', err);
    }
  }, []);

  /* watch for pan / zoom */
  function BoundsWatcher() {
    useMapEvents({ moveend: fetchClusters, zoomend: fetchClusters });
    return null;
  }

  return (
    <>
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        ref={(m) => (mapRef.current = m ?? null)}
        whenReady={fetchClusters}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <BoundsWatcher />

        {clusters.map((c) =>
          c.properties.cluster ? (
            /* cluster bubble */
            <Marker
              key={`cluster-${c.id}`}
              position={[c.geometry.coordinates[1], c.geometry.coordinates[0]]}
              icon={L.divIcon({
                className: 'cluster-bubble',
                html: `<div>${c.properties.point_count}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                interactive: true,
              })}
              eventHandlers={{
                click: () => {
                  const map = mapRef.current;
                  if (!map) return;
                  const next = Math.min(map.getZoom() + 2, 18); // don’t zoom past 18
                  map.flyTo(
                    [c.geometry.coordinates[1], c.geometry.coordinates[0]],
                    next,
                    { duration: 0.3 }
                  );
                },
              }}
            />
          ) : (
            /* single station pin */
            <Marker
              key={`station-${c.id}`}
              position={[c.geometry.coordinates[1], c.geometry.coordinates[0]]}
              eventHandlers={{
                click: () => setSelected(c.properties.stationId ?? null),
              }}
            />
          )
        )}
      </MapContainer>

      <StationPanel stationId={selected} onClose={() => setSelected(null)} />

      <style jsx global>{`
        .cluster-bubble {
          cursor: pointer;
        }
      `}</style>
    </>
  );
}
------ END COPY ------













