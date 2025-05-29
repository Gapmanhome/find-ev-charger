'use client';

import { useState } from 'react';
import { getIcons } from './poiIcons';

type Station = {
  id: number;
  name?: string;
  street_address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  lat: number;
  lon: number;
  reliability: number | null;
  amenities: string[] | null;
};

interface Props {
  station: Station | null;
  onClose: () => void;
}

export default function StationPanel({ station, onClose }: Props) {
  const [rated, setRated] = useState(false);
  if (!station) return null;

  const icons = getIcons(station.amenities ?? []);
  const rel = station.reliability ?? 0;
  const hue = 120 * (rel / 100);
  const barColor = `hsl(${hue}, 70%, 45%)`;
  const barWidth = `${rel}%`;
  const relLabel = rel ? `${rel.toFixed(0)} % trustworthy` : 'No data yet';

  async function handleRate(rating: 1 | 0) {
    if (rated) return;
    try {
      await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ station_id: station.id, rating })
      });
      setRated(true);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <aside className="station-panel">
      <button className="close" aria-label="Close station details" onClick={onClose}>
        ×
      </button>

      <h2>{station.name ?? 'Charging station'}</h2>
      {station.street_address && (
        <p>
          {station.street_address}
          <br />
          {station.city}, {station.province} {station.postal_code}
        </p>
      )}

      <h3>Within&nbsp;250&nbsp;m</h3>
      {icons.length ? (
        <div className="icon-row">{icons}</div>
      ) : (
        <p>No cafés, washrooms, playgrounds or dog-parks found.</p>
      )}

      <hr />

      <h3>Reliability</h3>
      <div className="trust-wrapper">
        <div className="trust-bar">
          <div className="fill" style={{ width: barWidth, background: barColor }} />
        </div>
        <span className="trust-label">{relLabel}</span>
      </div>

      <hr />

      <h3>Your quick check-in</h3>
      {rated ? (
        <p className="thanks">Thanks for your feedback!</p>
      ) : (
        <div className="rating-row">
          <button aria-label="Good" onClick={() => handleRate(1)}>
            👍
          </button>
          <button aria-label="Bad" onClick={() => handleRate(0)}>
            👎
          </button>
        </div>
      )}

      <style jsx>{`
        .station-panel {
          position: absolute;
          right: 0;
          top: 56px;
          width: 280px;
          height: calc(100vh - 56px);
          overflow-y: auto;
          background: #fff;
          border-left: 1px solid #ccc;
          padding: 16px;
          z-index: 1000;
        }
        .close {
          position: absolute;
          top: 8px;
          right: 8px;
          background: transparent;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }
        .icon-row {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }
        .trust-wrapper {
          margin-top: 4px;
        }
        .trust-bar {
          height: 10px;
          background: #eee;
          border-radius: 4px;
          overflow: hidden;
        }
        .fill {
          height: 100%;
        }
        .trust-label {
          display: block;
          margin-top: 4px;
          font-size: 13px;
          color: #555;
        }
        .rating-row {
          display: flex;
          gap: 12px;
          margin-top: 6px;
        }
        .rating-row button {
          font-size: 22px;
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .thanks {
          color: #4caf50;
          margin-top: 6px;
        }
      `}</style>
    </aside>
  );
}





