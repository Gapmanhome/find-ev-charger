'use client';
import dynamic from 'next/dynamic';

// Dynamically import MapView so it runs only in the browser
const MapView = dynamic(() => import('./components/MapView'), {
  ssr: false
});

export default function Home() {
  return <MapView />;
}
