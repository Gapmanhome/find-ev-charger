import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Supercluster from 'supercluster';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

let index: Supercluster;

async function loadIndex() {
  if (index) return index;
  const { data } = await sb
    .from('v_stations_plus')
    .select('id,lat,lon');
  const pts = (data || []).map((s: any) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [s.lon, s.lat] },
    properties: { id: s.id }
  }));
  index = new Supercluster({ radius: 60, maxZoom: 16 }).load(pts);
  return index;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const [swLat, swLon] = url.searchParams.get('sw')!.split(',').map(Number);
  const [neLat, neLon] = url.searchParams.get('ne')!.split(',').map(Number);
  const z = Number(url.searchParams.get('z') || 4);

  const idx = await loadIndex();
  const clusters = idx.getClusters([swLon, swLat, neLon, neLat], z);
  return NextResponse.json(clusters);
}
