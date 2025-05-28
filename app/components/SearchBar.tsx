'use client';
import { useState } from 'react';

export default function SearchBar({
  onSearch
}: {
  onSearch: (q: string) => void;
}) {
  const [value, setValue] = useState('');

  return (
    <div
      style={{
        position: 'absolute',
        top: 56,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: 'min(600px, 90%)'
      }}
    >
      <input
        style={{
          width: '100%',
          padding: '8px 12px',
          fontSize: 16,
          borderRadius: 6,
          border: '1px solid #ccc'
        }}
        type="text"
        placeholder="Search chargers …"
        aria-label="Search for an address"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') onSearch(value);
        }}
      />
    </div>
  );
}

