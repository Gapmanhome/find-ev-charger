'use client'

import { useState } from 'react'

export default function TopBar() {
  const [query, setQuery] = useState('')

  return (
    <header className="topbar">
      <div className="brand">Find EV Charger</div>

      {/* centring trick: element with margin-auto */}
      <input
        className="search"
        placeholder="Search address or city"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      <style jsx>{`
        .topbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 56px;
          display: flex;
          align-items: center;
          padding: 0 16px;
          background: #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, .1);
          z-index: 999;
        }
        .brand {
          color: #00895e;
          font-size: 20px;
          font-weight: 700;
        }
        .search {
          margin: 0 auto;          /* puts the input in the middle */
          width: 300px;
          max-width: 70vw;
          padding: 4px 8px;
          border: 1px solid #ccc;
          font-size: 15px;
        }
      `}</style>
    </header>
  )
}

