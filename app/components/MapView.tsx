'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet';
import StationPanel from './StationPanel';

L.Icon.Default.mergeOptions({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
});

type Station = {
  id: number;
  name?: string;
  street_address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  lat: number;
  lon: number;
  reliability: number | null;
};

const MAP_CENTER: [number, number] = [59, -96];
const MAP_ZOOM = 4.5;

export default function MapView() {
  const [stations, setStations] = useState<Station[]>([]);
  const [selected, setSelected] = useState<Station | null>(null);
  const lastBox = useRef<L.LatLngBounds | null>(null);

  function boxesNearlyEqual(a: L.LatLngBounds, b: L.LatLngBounds) {
    const pad = 0.5;
    return (
      a.getSouth() > b.getSouth() + pad &&
      a.getWest() > b.getWest() + pad &&
      a.getNorth() < b.getNorth() - pad &&
      a.getEast() < b.getEast() - pad
    );
  }

  function fetchBox(bounds: L.LatLngBounds) {
    if (lastBox.current && boxesNearlyEqual(bounds, lastBox.current)) return;
    lastBox.current = bounds;
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    fetch(
      `/api/stations?sw=${sw.lat},${sw.lng}&ne=${ne.lat},${ne.lng}&cols=id,lat,lon,reliability`,
    )
      .then(r => r.json())
      .then(r => setStations(r.data ?? []))
      .catch(console.error);
  }

  function BoundsWatcher() {
    const map = useMapEvents({
      moveend: () => fetchBox(map.getBounds()),
      zoomend: () => fetchBox(map.getBounds()),
    });
    useEffect(() => {
      fetchBox(map.getBounds());
    }, []);
    return null;
  }

  function StationPin({ s }: { s: Station }) {
    return (
      <Marker
        position={[s.lat, s.lon]}
        title="EV charger pin"
        eventHandlers={{ click: () => setSelected(s) }}
      >
        <Popup>
          {s.reliability == null
            ? 'calculating…'
            : `${Math.round(
                s.reliability > 1 ? s.reliability : s.reliability * 100,
              )}% reliable`}
        </Popup>
      </Marker>
    );
  }

  return (
    <>
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        zoomSnap={0.5}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BoundsWatcher />
        <MarkerClusterGroup chunkedLoading maxClusterRadius={50}>
          {stations.map(s => (
            <StationPin key={s.id} s={s} />
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      <StationPanel station={selected} onClose={() => setSelected(null)} />
    </>
  );
}


