/**
 * AirportAutocomplete
 * A reusable airport search input with dropdown suggestions.
 * Uses the same placesService.searchPlaces('airport') call as the Dashboard.
 *
 * Props:
 *   value        – display string (city name, airport name, or IATA code)
 *   airport      – the currently *selected* airport object { code, name, city, country }
 *   onChange     – called with (text) when the user is typing; clears the selection
 *   onSelect     – called with (airportObject) when the user picks a suggestion
 *   placeholder  – input placeholder
 *   id           – html id for the <input>
 *   className    – extra classes for the wrapper div
 */
import React, { useState, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { placesService } from '../../services/places.service';

export default function AirportAutocomplete({
  value,
  airport,
  onChange,
  onSelect,
  placeholder = 'Airport or city',
  id,
  className = '',
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  const lookup = async (q) => {
    if (!q || q.length < 2) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    try {
      const result = await placesService.searchPlaces(q, 'airport');
      const list = Array.isArray(result?.results) ? result.results : [];
      setSuggestions(list);
      setOpen(list.length > 0);
    } catch {
      setSuggestions([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const text = e.target.value.toUpperCase();
    onChange(text);          // parent clears its selectedAirport
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => lookup(text), 300);
  };

  const handleSelect = (opt) => {
    const code = opt.iataCode || opt.code ||
      (String(opt.name || '').match(/\(([A-Z]{3})\)/)?.[1] ?? '');
    const addr = String(opt.address || opt.city || '').split(',').map(p => p.trim()).filter(Boolean);
    const selected = {
      code,
      id: opt.id,
      name: opt.name,
      city: addr[0] || opt.city || '',
      country: addr[addr.length - 1] || opt.country || '',
    };
    onSelect(selected);
    setSuggestions([]);
    setOpen(false);
  };

  const handleBlur = () => setTimeout(() => setOpen(false), 180);
  const handleFocus = () => {
    if (value && value.length >= 2) lookup(value);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete="off"
        className="bg-transparent border-none font-black text-sm p-1 outline-none w-full uppercase"
      />
      {/* Sub-label: show selected airport name when airport is confirmed */}
      {airport && (
        <div className="text-[10px] font-semibold text-slate-400 leading-none px-1 -mt-1 truncate">
          {airport.name ? `${airport.name}` : airport.city || ''}
        </div>
      )}

      {/* Dropdown */}
      {(open || loading) && (
        <div className="absolute z-[9999] top-full left-0 mt-1 w-80 max-w-[90vw] bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
          {loading ? (
            <div className="px-4 py-3 flex items-center gap-2 text-sm font-bold text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin" /> Searching airports…
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm font-semibold text-slate-500">No airports found</div>
          ) : (
            <ul>
              {suggestions.map((opt, idx) => {
                const code = opt.iataCode || opt.code ||
                  (String(opt.name || '').match(/\(([A-Z]{3})\)/)?.[1] ?? '');
                return (
                  <li
                    key={opt.id || idx}
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
                    className="px-4 py-3 hover:bg-slate-100 cursor-pointer border-b border-slate-100 last:border-0 flex items-start gap-3"
                  >
                    <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm truncate">{opt.name}</div>
                      <div className="text-xs text-slate-500 flex gap-2">
                        <span className="truncate">{opt.address}</span>
                        {code && <span className="font-black text-blue-600 shrink-0">{code}</span>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
