import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { flightService } from '../services/flight.service';
import Button from '../components/ui/Button';
import { Plane, Loader2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function FlightResults() {
 const { formatCurrency } = useSettings();
 const [searchParams] = useSearchParams();
 const navigate = useNavigate();
 
 const from = searchParams.get('from') || 'DEL';
 const to = searchParams.get('to') || 'BOM';
 const date = searchParams.get('date') || '2026-10-15';
 
 const [flights, setFlights] = useState([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 fetchFlights();
 }, [from, to, date]);

 const fetchFlights = async () => {
 try {
 setLoading(true);
 const data = await flightService.searchFlights({ from, to, date });
 setFlights(data.data.flights);
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 };

 const formatTime = (isoString) => {
 return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
 };

  return (
  <div className="bg-page min-h-screen pb-16">
  
  {/* 1. Compact Sticky Search Header */}
  <div className="bg-surface border-b border-theme-border text-primary sticky top-14 z-40 shadow-sm">
  <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
  <div className="flex items-center gap-4">
  <div className="bg-accent/10 p-2 rounded-lg backdrop-blur">
  <Plane className="w-5 h-5 text-accent" />
  </div>
  <div>
  <div className="flex items-center gap-2 text-lg font-black tracking-wide">
  {from} <span className="text-accent">→</span> {to}
  </div>
  <div className="text-[11px] font-bold text-muted uppercase tracking-widest">{new Date(date).toDateString()} • 1 Adult • Economy</div>
  </div>
  </div>
  <button className="bg-elevated hover:bg-theme-border border-theme-border text-primary font-bold text-xs uppercase tracking-widest px-6 py-2 rounded transition-colors border">
  Modify Search
  </button>
  </div>
 </div>

  <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-24">
    <div className="flex flex-col lg:flex-row gap-6">
 
 {/* 2. Filter Sidebar */}
        {/* 2. Filter Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-surface rounded shadow-sm border border-theme-border">
            <div className="p-4 border-b border-theme-border bg-page rounded-t">
              <h3 className="font-black text-primary uppercase tracking-widest text-xs">Popular Filters</h3>
            </div>
            <div className="p-4 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 text-accent rounded-sm border-theme-border" />
                <span className="text-sm font-semibold text-secondary group-hover:text-primary">Non Stop</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 text-accent rounded-sm border-theme-border" />
                <span className="text-sm font-semibold text-secondary group-hover:text-primary">Morning Departures</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 text-accent rounded-sm border-theme-border" />
                <span className="text-sm font-semibold text-secondary group-hover:text-primary">Refundable Fares</span>
              </label>
            </div>
          </div>
 </div>

 {/* 3. Results Container */}
        {/* 3. Results Container */}
        <div className="flex-1">
          <div className="bg-surface p-4 rounded shadow-sm border border-theme-border flex justify-between items-center mb-4">
            <h2 className="text-lg font-black text-primary">Flights from {from} to {to}</h2>
            <select className="text-xs font-bold uppercase tracking-widest bg-elevated border-none rounded px-3 py-1.5 cursor-pointer text-primary">
              <option>Cheapest First</option>
              <option>Fastest First</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-20 bg-surface rounded shadow-sm border border-theme-border">
 <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
 </div>
          ) : flights && flights.length > 0 ? (
            <div className="space-y-3">
              {flights.map(flight => (
                <div key={flight.id} className="bg-surface rounded shadow-sm border border-theme-border hover:shadow-lg transition-shadow cursor-pointer flex flex-col md:flex-row p-4 relative group">
                  
                  {/* Airline Info */}
                  <div className="w-full md:w-[200px] flex items-center gap-4 shrink-0 mb-4 md:mb-0">
                    <div className="w-10 h-10 bg-elevated rounded-md flex items-center justify-center border border-theme-border">
                      <Plane className="w-5 h-5 text-muted" />
                    </div>
                    <div>
                      <div className="font-black text-primary">{flight.airline}</div>
                      <div className="text-xs font-bold text-secondary">{flight.flightNumber}</div>
                    </div>
                  </div>

                  {/* Flight Timeline - Rigid Grid Alignment */}
                  <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center px-4 md:px-8 border-y md:border-y-0 md:border-x border-theme-border py-4 md:py-0">
                    
                    {/* Departure */}
                    <div className="text-right pr-6">
                      <div className="text-2xl font-black text-primary">{formatTime(flight.departureTime)}</div>
                      <div className="text-xs font-bold text-secondary uppercase">{flight.departureAirport}</div>
                    </div>

                    {/* Route Line */}
                    <div className="w-32 flex flex-col items-center">
                      <div className="text-[10px] font-black uppercase text-secondary mb-1">{flight.duration}</div>
                      <div className="w-full relative flex items-center justify-center">
                        <div className="w-full h-0.5 bg-theme-border"></div>
                        <div className="absolute w-2 h-2 rounded-full bg-muted left-0"></div>
                        <div className="absolute w-2 h-2 rounded-full bg-muted right-0"></div>
                        <div className={`absolute px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${flight.stops === 0 ? 'bg-green-100 text-green-700' : 'bg-elevated text-secondary'}`}>
                          {flight.stops === 0 ? 'Non-Stop' : `${flight.stops} Stop`}
                        </div>
                      </div>
                    </div>

                    {/* Arrival */}
                    <div className="text-left pl-6">
                      <div className="text-2xl font-black text-primary">{formatTime(flight.arrivalTime)}</div>
                      <div className="text-xs font-bold text-secondary uppercase">{flight.arrivalAirport}</div>
                    </div>
                  </div>

                  {/* Price and CTA */}
                  <div className="w-full md:w-[220px] shrink-0 pl-0 md:pl-6 pt-4 md:pt-0 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end">
                    <div className="text-right">
                      <div className="text-3xl font-black text-primary leading-none mb-1">
                        {formatCurrency(flight.price)}
                      </div>
                      <div className="text-[10px] font-bold text-muted uppercase tracking-widest">
                        Includes taxes & fees
                      </div>
                    </div>
                    <Button onClick={() => navigate(`/flights/${flight.id}`)} className="bg-accent hover:bg-accent/90 text-white font-black text-xs uppercase tracking-widest px-8 py-3 rounded-full mt-0 md:mt-3 shadow-md">
                      View Fares
                    </Button>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface rounded-lg border border-theme-border py-16 px-6 text-center shadow-sm">
              <Plane className="w-12 h-12 text-muted mx-auto mb-4" />
              <h3 className="text-xl font-black text-primary mb-2">No flights found</h3>
              <p className="text-secondary font-semibold mb-6">Try adjusting your search criteria or travel dates.</p>
              <Button onClick={() => navigate('/')} className="bg-accent text-white uppercase tracking-widest text-xs px-6 py-3 rounded-full hover:bg-accent/90">
                Return to Dashboard
              </Button>
            </div>
          )}
 </div>
 </div>
 </div>
 </div>
 );
}
