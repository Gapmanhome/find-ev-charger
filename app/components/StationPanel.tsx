'use client';

type Station = {
  id: number;
  name: string;
  address: string;
  amenities: Record<string, boolean>;
  lat: number;
  lng: number;
};

type Props = {
  station: Station | null;
  onClose: () => void;
};

export default function StationPanel({ station, onClose }: Props) {
  if (!station) return null; // hidden until a station is selected

  return (
    <aside className="panel">
      <button className="close" onClick={onClose}>
        ×
      </button>

      <h2>{station.name}</h2>
      <p>{station.address}</p>

      <h3>Amenities</h3>
      <ul>
        {Object.entries(station.amenities).map(
          ([key, has]) => has && <li key={key}>{key}</li>
        )}
      </ul>

      <style jsx>{`
        .panel {
          position: absolute;
          top: 0;
          right: 0;
          width: 260px;
          height: 100%;
          background: #fff;
          padding: 16px;
          box-shadow: -2px 0 6px rgba(0, 0, 0, 0.15);
          overflow-y: auto;
        }
        .close {
          float: right;
          border: none;
          background: none;
          font-size: 22px;
          cursor: pointer;
        }
        h2 {
          margin-top: 0;
        }
      `}</style>
    </aside>
  );
}








