// app/api/amenities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/nextjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stationId = searchParams.get('stationId');
    const swLat = searchParams.get('swLat');
    const swLon = searchParams.get('swLon');
    const neLat = searchParams.get('neLat');
    const neLon = searchParams.get('neLon');

    let query = supabase
      .from('pois')
      .select('station_id, amenity_type')
      .order('amenity_type');

    if (stationId) {
      query = query.eq('station_id', stationId);
    } else if (swLat && swLon && neLat && neLon) {
      query = query
        .gte('lat', Number(swLat))
        .lte('lat', Number(neLat))
        .gte('lon', Number(swLon))
        .lte('lon', Number(neLon));
    } else {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const { data, error } = await query;
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

