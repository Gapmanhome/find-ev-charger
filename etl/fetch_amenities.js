import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter'
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function overpass(q) {
  const body = `[out:json][timeout:25];${q}`;
  for (const url of MIRRORS) {
    for (let w = 5000; w <= 40000; w *= 2) {
      const r = await fetch(url, { method: 'POST', body });
      const t = await r.text();
      if (t[0] !== '{') {
        console.log(`${url} busy – waiting ${w / 1000}s`);
        await sleep(w);
        continue;
      }
      return JSON.parse(t);
    }
    console.log(`${url} failed 3×, switching mirror…`);
  }
  throw new Error('all Overpass mirrors failed');
}

const toRad = d => (d * Math.PI) / 180;
const haversine = (a1, o1, a2, o2) => {
  const R = 6371e3;
  const φ1 = toRad(a1),
    φ2 = toRad(a2),
    dφ = toRad(a2 - a1),
    dλ = toRad(o2 - o1);
  const h =
    Math.sin(dφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

function poi(el, st) {
  const tags = el.tags || {};
  let a = tags.amenity || tags.leisure;
  if (a === 'restaurant') a = 'cafe';
  if (a === 'dog_park') a = 'dog_park';
  if (!['cafe', 'toilets', 'playground', 'dog_park'].includes(a)) return null;
  return {
    station_id: st.id,
    amenity_type: a,
    name: tags.name || '(unnamed)',
    lat: el.lat,
    lon: el.lon,
    distance_m: Math.round(haversine(st.lat, st.lon, el.lat, el.lon))
  };
}

async function main() {
  const { data: stations } = await supabase
    .from('ev_stations')
    .select('id,lat,lon')
    .order('id');

  let added = 0,
    skipped = 0,
    done = 0;

  for (const st of stations) {
    const q = `
      (
        node(around:250,${st.lat},${st.lon})[amenity~"^(cafe|toilets|playground)$"];
        node(around:250,${st.lat},${st.lon})[leisure=dog_park];
      );out center;
    `;

    try {
      const res = await overpass(q);
      const pois = res.elements.map(e => poi(e, st)).filter(Boolean);
      if (pois.length) {
        const { error } = await supabase.from('pois').upsert(pois);
        if (error) throw error;
        added += pois.length;
      }
    } catch (e) {
      skipped++;
      console.error(`Station ${st.id} skipped (${e.message})`);
    }

    done++;
    if (done % 200 === 0) console.log(`Progress: ${done}/${stations.length}`);
  }

  console.log(`=== Finished ===\nPOIs added/updated: ${added}\nStations skipped : ${skipped}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
