import React from 'react';

const Layout = ({ children }) => {
  return (
    <div>
      <header>
        <h1>Find EV Charger</h1>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
