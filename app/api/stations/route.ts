// app/api/stations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/nextjs';

export const revalidate = 900; // 15-min edge cache

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sw = searchParams.get('sw');
    const ne = searchParams.get('ne');

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
    if (error) throw error;

    const res = NextResponse.json({ data });
    res.headers.set(
      'Cache-Control',
      's-maxage=900, stale-while-revalidate'
    );
    return res;
  } catch (err: any) {
    Sentry.captureException(err);
    return NextResponse.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}


