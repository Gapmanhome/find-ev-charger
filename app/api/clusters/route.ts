import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Supercluster from 'supercluster';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// build index once per cold start
let index: Supercluster;

async function loadIndex() {
  if (index) return index;
  const { data } = await sb
    .from('v_stations_plus')
    .select('id,lat,lon'); // only coords
  const points = (data || []).map((s: any) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [s.lon, s.lat] },
    properties: { id: s.id }
  }));
  index = new Supercluster({ radius: 60, maxZoom: 16 }).load(points);
  return index;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const [swLat, swLon] = (url.searchParams.get('sw') || '0,0').split(',').map(Number);
  const [neLat, neLon] = (url.searchParams.get('ne') || '0,0').split(',').map(Number);
  const zoom = Number(url.searchParams.get('z') || 4);

  const idx = await loadIndex();
  const clusters = idx.getClusters([swLon, swLat, neLon, neLat], zoom);
  return NextResponse.json(clusters);
}
