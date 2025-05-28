import React from 'react';

const icons: Record<string, JSX.Element> = {
  cafe:       <span key="cafe"       title="Café"       role="img" className="poi">☕</span>,
  restaurant: <span key="restaurant" title="Restaurant" role="img" className="poi">🍴</span>,
  toilets:    <span key="toilets"    title="Washroom"   role="img" className="poi">🚻</span>,
  washroom:   <span key="washroom"   title="Washroom"   role="img" className="poi">🚻</span>,
  playground: <span key="playground" title="Playground" role="img" className="poi">🛝</span>,
  dog_park:   <span key="dog_park"   title="Dog park"   role="img" className="poi">🐕</span>,
};

export function getIcons(amenityTypes: string[]): JSX.Element[] {
  return Array.from(new Set(amenityTypes))
    .flatMap(type => icons[type] ? [icons[type]] : []);
}



