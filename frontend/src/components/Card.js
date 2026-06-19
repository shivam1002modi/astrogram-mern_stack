import React from 'react';

// A reusable Card component that provides a consistent wrapper and title
export default function Card({ title, children }) {
  return (
    <div className="card">
      {/* If a title is provided, render it in a standard h2 tag */}
      {title && <h2>{title}</h2>}
      {children}
    </div>
  );
}
