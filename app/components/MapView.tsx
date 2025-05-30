'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet';
import 'leaflet.markercluster';
import StationPanel from './StationPanel';

L.Icon.Default.mergeOptions({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
});

type Station = {
  id: number;
  name?: string;
  lat: number;
  lon: number;
  reliability: number | null;
  amenities: string[] | null;
};

const MAP_CENTER: [number, number] = [59, -96];
const MAP_ZOOM = 6; // start wide, then auto-zoom to 7

export default function MapView() {
  const [stations, setStations] = useState<Station[]>([]);
  const [selected, setSelected] = useState<Station | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  function fetchBox(box: L.LatLngBounds) {
    const sw = box.getSouthWest();
    const ne = box.getNorthEast();
    fetch(`/api/stations?sw=${sw.lat},${sw.lng}&ne=${ne.lat},${ne.lng}`)
      .then(r => r.json())
      .then(r => setStations(r.data ?? []))
      .catch(console.error);
  }

  function ClusterLayer() {
    const map = useMap();
    if (!clusterRef.current) {
      clusterRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        chunkInterval: 20,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
      });
      map.addLayer(clusterRef.current);
    }
    return null;
  }

  function AutoZoomIn() {
    const map = useMap();
    useEffect(() => {
      // give the map one tick to render, then zoom in by 1
      requestAnimationFrame(() => {
        if (map.getZoom() === MAP_ZOOM) {
          map.zoomIn(); // goes to zoom 7
        }
      });
    }, [map]);
    return null;
  }

  function BoundsWatcher() {
    const map = useMapEvents({
      moveend: () => fetchBox(map.getBounds()),
      zoomend: () => fetchBox(map.getBounds()),
    });
    useEffect(() => {
      fetchBox(map.getBounds()); // first fetch at zoom 6
    }, []);
    return null;
  }

  useEffect(() => {
    const group = clusterRef.current;
    if (!group) return;
    group.clearLayers();
    stations.forEach(st => {
      const marker = L.marker([st.lat, st.lon])
        .on('click', () => setSelected(st))
        .bindPopup(
          st.reliability == null
            ? 'calculating…'
            : `${Math.round(
                st.reliability > 1 ? st.reliability : st.reliability * 100,
              )}% reliable`,
        );
      group.addLayer(marker);
    });
  }, [stations]);

  return (
    <>
      <MapContainer center={MAP_CENTER} zoom={MAP_ZOOM} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClusterLayer />
        <BoundsWatcher />
        <AutoZoomIn /> {/* zooms itself from 6 → 7 right after paint */}
      </MapContainer>

      <StationPanel station={selected} onClose={() => setSelected(null)} />
    </>
  );
}









