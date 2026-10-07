import React from 'react';
import Badge from '../ui/Badge';

export default function AirlineLogo({ logoUrl, airlineCode, airlineName, className = '' }) {
  const [error, setError] = React.useState(false);

  if (logoUrl && !error) {
    return (
      <img
        src={logoUrl}
        alt={airlineName || airlineCode}
        className={`w-8 h-8 object-contain ${className}`}
        onError={() => setError(true)}
      />
    );
  }

  // Branded fallbacks for demo airlines
  if (airlineCode === '6E' || airlineName === 'IndiGo') {
    return (
      <div className={`flex items-center justify-center bg-[#001B94] text-white font-black rounded-lg w-8 h-8 ${className}`} title="IndiGo">
        6E
      </div>
    );
  }

  if (airlineCode === 'AI' || airlineName === 'Air India') {
    return (
      <div className={`flex items-center justify-center bg-[#ED1C24] text-white font-black rounded-lg w-8 h-8 ${className}`} title="Air India">
        AI
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center bg-slate-100 text-slate-600 font-bold rounded-lg border border-theme-border w-8 h-8 ${className}`}>
      {airlineCode || (airlineName ? airlineName.substring(0, 2).toUpperCase() : '✈️')}
    </div>
  );
}
