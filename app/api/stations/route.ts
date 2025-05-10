
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req;
  const { province, city, page = 1, pageSize = 10 } = query;

  const filters: any = {};
  if (province) filters.province = province;
  if (city) filters.city = city;

  const { data, error } = await supabase
    .from('ev_stations')
    .select('*')
    .match(filters)
    .range((page as number - 1) * (pageSize as number), page as number * (pageSize as number) - 1);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(data);
}
