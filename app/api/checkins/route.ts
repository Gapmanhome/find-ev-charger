// app/api/checkins/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/nextjs';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { station_id, rating } = await req.json();

    if (![0, 1].includes(rating)) {
      return NextResponse.json(
        { error: 'rating must be 1 or 0' },
        { status: 400 }
      );
    }

    const { error } = await sb.from('checkins').insert({ station_id, rating });

    if (error) {
      Sentry.captureException(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

