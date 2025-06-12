'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from 'react-leaflet';
import L, { LatLngBounds } from 'leaflet';
import StationPanel from './StationPanel';

/* Leaflet icon paths */
L.Icon.Default.mergeOptions({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
});

/* ------------ types ------------ */
type Station = {
  id: number;
  name: string;
  address: string;
  amenities: Record<string, boolean>;
  lat: number;
  lng: number;
};

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
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  /* load clusters for current map view */
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

  /* helper: fetch one station */
  async function loadStation(id: number) {
    try {
      const res = await fetch(`/api/stations/${id}`);
      const station: Station = await res.json();
      setSelectedStation(station);
    } catch (err) {
      console.error('Failed to load station', err);
    }
  }

  /* watch pan / zoom */
  function BoundsWatcher() {
    useMapEvents({ moveend: fetchClusters, zoomend: fetchClusters });
    return null;
  }

  /* fix white first view */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    setTimeout(() => map.invalidateSize(), 0);
  }, []);

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
            <Marker
              key={`cluster-${c.id}`}
              position={[c.geometry.coordinates[1], c.geometry.coordinates[0]]}
              icon={L.divIcon({
                className: 'cluster-bubble',
                html: `<div>${c.properties.point_count}</div>`,
                iconSize: [34, 34],
                iconAnchor: [17, 17],
              })}
              eventHandlers={{
                click: () => {
                  const map = mapRef.current;
                  if (!map) return;
                  const next = Math.min(map.getZoom() + 2, 18);
                  map.flyTo(
                    [c.geometry.coordinates[1], c.geometry.coordinates[0]],
                    next,
                    { duration: 0.3 }
                  );
                },
              }}
            />
          ) : (
            <Marker
              key={`station-${c.id}`}
              position={[c.geometry.coordinates[1], c.geometry.coordinates[0]]}
              eventHandlers={{
                click: () => {
                  const id = c.properties.stationId;
                  if (id != null) loadStation(id);
                },
              }}
            />
          )
        )}
      </MapContainer>

      <StationPanel
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
      />

      <style jsx global>{`
        .cluster-bubble div {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 17px;
          background: #1e9d3a; /* green */
          color: #fff;
          font-weight: 600;
        }
      `}</style>
    </>
  );
}


















