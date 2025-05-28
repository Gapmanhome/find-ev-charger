// app/api/stations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/nextjs';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sw = url.searchParams.get('sw'); // "lat,lon"
    const ne = url.searchParams.get('ne'); // "lat,lon"

    let q = sb
      .from('v_stations')
      .select(
        'id,name,street_address,city,province,postal_code,lat,lon,reliability'
      );

    if (sw && ne) {
      const [swLat, swLon] = sw.split(',').map(Number);
      const [neLat, neLon] = ne.split(',').map(Number);
      q = q
        .gt('lat', swLat)
        .lt('lat', neLat)
        .gt('lon', swLon)
        .lt('lon', neLon);
    }

    const { data, error } = await q.limit(2000);

    if (error) {
      Sentry.captureException(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

