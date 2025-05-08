import csv from 'csv-parser';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// NRCan CSV URL
const nrcanCsvUrl = 'https://www.nrcan.gc.ca/sites/www.nrcan.gc.ca/files/earth-sciences/pdf/national_Electric_Vehicle.csv';

// Fetch and parse CSV
async function fetchAndParseCsv(url) {
  const response = await fetch(url);
  const data = await response.text();
  const results = [];

  return new Promise((resolve, reject) => {
    csv()
      .fromString(data)
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

// Upsert data into Supabase
async function upsertData(data) {
  const { data: upsertedData, error } = await supabase
    .from('ev_stations')
    .upsert(data, { onConflict: 'nrcan_id' });

  if (error) {
    console.error('Upsert error:', error);
  } else {
    console.log('Upserted data:', upsertedData);
  }
}

// Main ETL function
async function etl() {
  try {
    const csvData = await fetchAndParseCsv(nrcanCsvUrl);
    const formattedData = csvData.map((row) => ({
      nrcan_id: row['NRCan ID'],
      name: row['Station Name'],
      address: row['Address'],
      city: row['City'],
      province: row['Province'],
      lat: parseFloat(row['Latitude']),
      lng: parseFloat(row['Longitude']),
      connectors: row['Connectors'] ? row['Connectors'].split(',') : [],
      max_kw: parseFloat(row['Maximum kW']),
      network: row['Network'],
      access: row['Access'],
      cost: row['Cost'],
    }));

    await upsertData(formattedData);
    console.log('ETL process completed successfully.');
  } catch (error) {
    console.error('ETL process failed:', error);
  }
}

// Run ETL
etl();
